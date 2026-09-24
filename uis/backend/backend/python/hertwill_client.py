import os
import asyncio
from typing import List, Dict, Any, Optional
import httpx
from pydantic import BaseModel, Field
from backend.python.pricing import calculate_kinekids_price, get_pricing_breakdown

# Models Pydantic v2
class BrandInfo(BaseModel):
    id: Optional[str] = None
    name: Optional[str] = None
    slug: Optional[str] = None

class CategoryInfo(BaseModel):
    id: Optional[str] = None
    name: Optional[str] = None
    slug: Optional[str] = None

class ProductImages(BaseModel):
    featured: Optional[str] = None
    gallery: Optional[List[str]] = Field(default_factory=list)

class HertwillProduct(BaseModel):
    id: str
    name: str
    description: Optional[str] = ""
    wholesale_price: float = Field(alias="price", default=0.0)
    images: Optional[ProductImages] = None
    brand: Optional[BrandInfo] = None
    category: Optional[CategoryInfo] = None

class OrderItemInput(BaseModel):
    variant_id: str
    quantity: int = Field(gt=0, default=1)

class CustomerAddressInput(BaseModel):
    name: str
    email: str
    address: str
    city: str
    postal_code: str
    country_code: str = "ES"

class OrderPayload(BaseModel):
    customer: CustomerAddressInput
    items: List[OrderItemInput]

class HertwillClient:
    def __init__(self, api_key: Optional[str] = None, base_url: str = "https://api.hertwill.com/v1"):
        self.api_key = api_key or os.getenv("HERTWILL_API_KEY", "")
        self.base_url = base_url
        self.semaphore = asyncio.Semaphore(5)  # Máximo 5 peticiones concurrentes (Red Teaming Anti-RateLimit)
        self._brand_slug_cache: Optional[Dict[str, str]] = None
        self._shipping_cache: Dict[str, float] = {}

    def _get_headers(self) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Accept": "application/json",
            "Content-Type": "application/json",
        }

    async def _fetch_brands_map(self, client: httpx.AsyncClient) -> Dict[str, str]:
        """Cachea el mapa de nombre/slug a slug nativo de Hertwill."""
        if self._brand_slug_cache is not None:
            return self._brand_slug_cache

        try:
            res = await client.get(f"{self.base_url}/brands", headers=self._get_headers())
            if res.status_code == 200:
                data = res.json().get("data", [])
                mapping = {}
                for b in data:
                    name = (b.get("name") or "").lower().strip()
                    slug = (b.get("slug") or "").lower().strip()
                    if name:
                        mapping[name] = slug
                    if slug:
                        mapping[slug] = slug
                self._brand_slug_cache = mapping
                return mapping
        except Exception as e:
            print(f"Error al obtener mapa de marcas en Python: {e}")
        
        self._brand_slug_cache = {}
        return {}

    async def resolve_brand_slug(self, brand_input: str, client: httpx.AsyncClient) -> str:
        """Resuelve nombres comerciales como 'IGLU' a slugs válidos como 'iglu-soft'."""
        if not brand_input:
            return brand_input
        
        cleaned = brand_input.lower().strip()
        mapping = await self._fetch_brands_map(client)
        if cleaned in mapping:
            return mapping[cleaned]
        
        # Fallback slugify
        return cleaned.replace(" ", "-")

    async def get_products(
        self,
        page: int = 1,
        limit: int = 50,
        brand: Optional[str] = None,
        category: Optional[str] = None
    ) -> Dict[str, Any]:
        """Obtiene el catálogo de productos paginado y procesado con precios KineKids."""
        async with httpx.AsyncClient(timeout=10.0) as client:
            async with self.semaphore:
                url = f"{self.base_url}/products?page={page}&limit={limit}"
                if brand:
                    resolved_brand = await self.resolve_brand_slug(brand, client)
                    url += f"&brand={httpx.URL(resolved_brand).raw_path.decode()}"
                if category:
                    url += f"&category={httpx.URL(category).raw_path.decode()}"

                if not self.api_key or self.api_key.startswith("hk_mock"):
                    return {"products": [], "pagination": {"page": page, "total": 0, "page_count": 0}}

                res = await client.get(url, headers=self._get_headers())
                if res.status_code != 200:
                    raise httpx.HTTPStatusError(f"Hertwill API Error {res.status_code}", request=res.request, response=res)
                
                data = res.json()
                raw_items = data.get("data", [])
                pagination = data.get("meta", {}).get("pagination", {"page": page, "total": len(raw_items), "page_count": 1})

                processed_products = []
                for item in raw_items:
                    w_price = float(item.get("price", 0.0))
                    pricing = get_pricing_breakdown(w_price)
                    
                    featured_img = item.get("images", {}).get("featured")
                    gallery = item.get("images", {}).get("gallery", [])
                    img_url = featured_img or (gallery[0] if gallery else "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=600")

                    processed_products.append({
                        "id": str(item.get("id")),
                        "title": item.get("name", "Producto KineKids"),
                        "wholesale_price": w_price,
                        "retail_price": pricing["retail_price"],
                        "markup_multiplier": pricing["markup_multiplier"],
                        "category": pricing["category"],
                        "description": item.get("description", ""),
                        "imageUrl": img_url,
                        "brand": item.get("brand", {}).get("name", ""),
                    })

                return {
                    "products": processed_products,
                    "pagination": pagination,
                }

    async def Fulfill_order(self, payload: OrderPayload) -> Dict[str, Any]:
        """Procesa una orden real hacia la API de Hertwill (POST /v1/orders)."""
        async with httpx.AsyncClient(timeout=10.0) as client:
            async with self.semaphore:
                if not self.api_key or self.api_key.startswith("hk_mock"):
                    # Simulación de respuesta en modo Mock
                    return {
                        "status": "success",
                        "order_id": f"HTW-MOCK-{payload.customer.postal_code}",
                        "message": "Orden simulada creada con éxito en Hertwill Sandbox.",
                    }

                endpoint = f"{self.base_url}/orders"
                body = payload.model_dump()
                
                res = await client.post(endpoint, headers=self._get_headers(), json=body)
                if res.status_code not in (200, 201):
                    raise httpx.HTTPStatusError(f"Error procesando orden en Hertwill: {res.status_code} - {res.text}", request=res.request, response=res)
                
                return res.json()
