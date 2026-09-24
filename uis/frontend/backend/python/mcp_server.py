import os
import json
import asyncio
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, field_validator
import mcp.types as types
from mcp.server import Server, NotificationOptions
from mcp.server.models import InitializationOptions
from mcp.server.stdio import stdio_server

from backend.python.pricing import get_pricing_breakdown, calculate_kinekids_price
from backend.python.hertwill_client import HertwillClient

# ==========================================
# 1. MODELOS DE PYDANTIC V2 (ESQUEMAS NATIVOS)
# ==========================================

class CuratedProductSchema(BaseModel):
    id: str = Field(..., description="ID único del producto curado")
    title: str = Field(..., description="Título pedagógico comercial")
    category: str = Field("module", description="Categoría Value Ladder (set, module, accessory)")
    wholesale_price: float = Field(..., gt=0.0, description="Coste inmutable de proveedor Hertwill")
    retail_price: float = Field(..., gt=0.0, description="PVP público de venta en España")
    shipping_cost: float = Field(33.0, ge=0.0, description="Coste de transporte oficial a España")
    brand: Optional[str] = Field("KineKids", description="Marca o fabricante del producto")
    imageUrl: Optional[str] = Field(None, description="Imagen principal del producto")

    @field_validator("wholesale_price")
    @classmethod
    def validate_wholesale_price(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("El coste mayorista debe ser un valor positivo.")
        return round(v, 2)

    @property
    def total_cost(self) -> float:
        return round(self.wholesale_price + self.shipping_cost, 2)

    @property
    def net_margin(self) -> float:
        return round(self.retail_price - self.total_cost, 2)

    @property
    def margin_percentage(self) -> float:
        if self.retail_price <= 0:
            return 0.0
        return round((self.net_margin / self.retail_price) * 100, 2)


class PriceUpdateInputSchema(BaseModel):
    product_id: str = Field(..., description="ID del producto a actualizar")
    new_retail_price: float = Field(..., gt=0.0, description="Nuevo PVP público")


class FinancialAuditOutputSchema(BaseModel):
    total_audited: int = Field(..., description="Total de productos analizados")
    healthy_count: int = Field(..., description="Productos con margen neto >= 20%")
    low_margin_count: int = Field(..., description="Productos con margen insuficiente (< 20%)")
    alerts: List[str] = Field(default_factory=list, description="Advertencias de salud financiera")


class SupplierQuerySchema(BaseModel):
    query: Optional[str] = Field(None, description="Término de búsqueda de productos o marcas")
    brand: Optional[str] = Field(None, description="Slug de la marca a filtrar")
    limit: int = Field(20, ge=1, le=100, description="Límite de resultados")


# ==========================================
# 2. INICIALIZACIÓN DEL SERVIDOR MCP EN PYTHON
# ==========================================

server = Server("kinekids-python-mcp")
CATALOG_PATH = os.path.join(os.getcwd(), "data", "curated_catalog.json")

def load_catalog_raw() -> List[Dict[str, Any]]:
    if not os.path.exists(CATALOG_PATH):
        return []
    with open(CATALOG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def save_catalog_raw(data: List[Dict[str, Any]]) -> None:
    os.makedirs(os.path.dirname(CATALOG_PATH), exist_ok=True)
    with open(CATALOG_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


# ==========================================
# 3. REGISTRO DE HERRAMIENTAS MCP (HANDLERS)
# ==========================================

async def handle_list_tools(req: types.ListToolsRequest, extra: Any) -> types.ListToolsResult:
    return types.ListToolsResult(
        tools=[
            types.Tool(
                name="kinekids_get_catalog",
                description="Obtiene el catálogo curado de KineKids validado mediante modelos Pydantic V2.",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "category": {"type": "string", "description": "Filtro opcional por categoría (set, module, accessory)"}
                    }
                }
            ),
            types.Tool(
                name="kinekids_update_price",
                description="Actualiza el PVP público de un producto validando mediante Pydantic y preservando inmutablemente el coste del proveedor.",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "product_id": {"type": "string", "description": "ID único del producto"},
                        "new_retail_price": {"type": "number", "description": "Nuevo precio de venta público (PVP)"}
                    },
                    "required": ["product_id", "new_retail_price"]
                }
            ),
            types.Tool(
                name="kinekids_audit_financials",
                description="Audita en tiempo real los márgenes netos del catálogo con validación estricta de Pydantic V2.",
                inputSchema={
                    "type": "object",
                    "properties": {}
                }
            ),
            types.Tool(
                name="hertwill_query_supplier",
                description="Consulta asíncrona de stock y productos directos a la API de Hertwill mediante cliente Python asíncrono.",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "query": {"type": "string", "description": "Búsqueda textual por título"},
                        "brand": {"type": "string", "description": "Marca del producto"},
                        "limit": {"type": "integer", "default": 20}
                    }
                }
            ),
        ]
    )

async def handle_call_tool(req: types.CallToolRequest, extra: Any) -> types.CallToolResult:
    name = req.params.name
    args = req.params.arguments or {}

    # Tool 1: kinekids_get_catalog
    if name == "kinekids_get_catalog":
        raw_items = load_catalog_raw()
        valid_products: List[Dict[str, Any]] = []
        filter_category = args.get("category")

        for item in raw_items:
            try:
                prod = CuratedProductSchema(
                    id=str(item.get("id")),
                    title=item.get("title") or item.get("name", "Producto"),
                    category=item.get("category", "module"),
                    wholesale_price=float(item.get("wholesale_price") or item.get("price") or 0.0),
                    retail_price=float(item.get("retail_price") or item.get("price") or 0.0),
                    shipping_cost=float(item.get("shipping_cost") or (33.0 if item.get("category") != "accessory" else 14.99)),
                    brand=item.get("brand"),
                    imageUrl=item.get("imageUrl")
                )

                if filter_category and prod.category != filter_category:
                    continue

                prod_dict = prod.model_dump()
                prod_dict["total_cost"] = prod.total_cost
                prod_dict["net_margin"] = prod.net_margin
                prod_dict["margin_percentage"] = prod.margin_percentage
                valid_products.append(prod_dict)
            except Exception as err:
                print(f"Error al validar producto Pydantic {item.get('id')}: {err}")

        return types.CallToolResult(
            content=[
                types.TextContent(
                    type="text",
                    text=json.dumps({
                        "source": "Python MCP Server (Pydantic V2)",
                        "count": len(valid_products),
                        "products": valid_products
                    }, ensure_ascii=False, indent=2)
                )
            ]
        )

    # Tool 2: kinekids_update_price
    elif name == "kinekids_update_price":
        try:
            input_data = PriceUpdateInputSchema(
                product_id=str(args.get("product_id")),
                new_retail_price=float(args.get("new_retail_price", 0.0))
            )
        except Exception as err:
            return types.CallToolResult(content=[types.TextContent(type="text", text=f"Error de validación Pydantic: {err}")])

        raw_items = load_catalog_raw()
        updated_product = None

        for item in raw_items:
            if str(item.get("id")) == input_data.product_id:
                item["retail_price"] = input_data.new_retail_price
                updated_product = item
                break

        if not updated_product:
            return types.CallToolResult(content=[types.TextContent(type="text", text=f"Producto ID {input_data.product_id} no encontrado en catálogo.")])

        save_catalog_raw(raw_items)

        prod = CuratedProductSchema(
            id=str(updated_product.get("id")),
            title=updated_product.get("title", "Producto"),
            category=updated_product.get("category", "module"),
            wholesale_price=float(updated_product.get("wholesale_price", 0.0)),
            retail_price=float(updated_product.get("retail_price", 0.0)),
            shipping_cost=float(updated_product.get("shipping_cost", 33.0)),
            brand=updated_product.get("brand"),
            imageUrl=updated_product.get("imageUrl")
        )

        return types.CallToolResult(
            content=[
                types.TextContent(
                    type="text",
                    text=json.dumps({
                        "status": "success",
                        "message": f"PVP de '{prod.title}' actualizado a {prod.retail_price}€ en Python MCP.",
                        "product": {
                            "id": prod.id,
                            "title": prod.title,
                            "wholesale_price": prod.wholesale_price,
                            "retail_price": prod.retail_price,
                            "shipping_cost": prod.shipping_cost,
                            "net_margin": prod.net_margin,
                            "margin_percentage": prod.margin_percentage
                        }
                    }, ensure_ascii=False, indent=2)
                )
            ]
        )

    # Tool 3: kinekids_audit_financials
    elif name == "kinekids_audit_financials":
        raw_items = load_catalog_raw()
        total_audited = 0
        healthy_count = 0
        low_margin_count = 0
        alerts: List[str] = []

        for item in raw_items:
            try:
                prod = CuratedProductSchema(
                    id=str(item.get("id")),
                    title=item.get("title", "Producto"),
                    category=item.get("category", "module"),
                    wholesale_price=float(item.get("wholesale_price") or 0.0),
                    retail_price=float(item.get("retail_price") or 0.0),
                    shipping_cost=float(item.get("shipping_cost") or 33.0),
                    brand=item.get("brand"),
                    imageUrl=item.get("imageUrl")
                )
                total_audited += 1

                if prod.margin_percentage >= 20.0:
                    healthy_count += 1
                else:
                    low_margin_count += 1
                    alerts.append(
                        f"⚠️ Producto '{prod.title}' (ID {prod.id}): Margen neto bajo {prod.margin_percentage}% "
                        f"(PVP {prod.retail_price}€ vs Coste Total {prod.total_cost}€)"
                    )
            except Exception as err:
                alerts.append(f"❌ Error validando producto ID {item.get('id')}: {err}")

        audit_result = FinancialAuditOutputSchema(
            total_audited=total_audited,
            healthy_count=healthy_count,
            low_margin_count=low_margin_count,
            alerts=alerts
        )

        return types.CallToolResult(
            content=[
                types.TextContent(
                    type="text",
                    text=json.dumps(audit_result.model_dump(), ensure_ascii=False, indent=2)
                )
            ]
        )

    # Tool 4: hertwill_query_supplier
    elif name == "hertwill_query_supplier":
        try:
            query_input = SupplierQuerySchema(
                query=args.get("query"),
                brand=args.get("brand"),
                limit=args.get("limit", 20)
            )
        except Exception as err:
            return types.CallToolResult(content=[types.TextContent(type="text", text=f"Error de validación Pydantic: {err}")])

        client = HertwillClient()
        try:
            res = await client.get_products(
                page=1,
                limit=query_input.limit,
                brand=query_input.brand
            )
            return types.CallToolResult(
                content=[
                    types.TextContent(
                        type="text",
                        text=json.dumps({
                            "source": "Hertwill API (Python Async Client)",
                            "count": len(res.get("products", [])),
                            "products": res.get("products", [])
                        }, ensure_ascii=False, indent=2)
                    )
                ]
            )
        except Exception as err:
            return types.CallToolResult(content=[types.TextContent(type="text", text=f"Error al consultar Hertwill API: {err}")])

    else:
        raise ValueError(f"Herramienta no encontrada: {name}")

# Registrar handlers de MCP
server.add_request_handler("tools/list", types.ListToolsRequest, handle_list_tools)
server.add_request_handler("tools/call", types.CallToolRequest, handle_call_tool)


# ==========================================
# 4. EJECUCIÓN PRINCIPAL DEL SERVIDOR STDIO
# ==========================================

async def main():
    async with stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            InitializationOptions(
                server_name="kinekids-python-mcp",
                server_version="1.0.0",
                capabilities=server.get_capabilities(
                    notification_options=NotificationOptions(),
                    experimental_capabilities={},
                ),
            ),
        )

if __name__ == "__main__":
    asyncio.run(main())
