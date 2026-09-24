import os
from typing import Optional, Dict, Any
from fastapi import FastAPI, Header, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from backend.python.hertwill_client import HertwillClient, OrderPayload
from backend.python.pricing import get_pricing_breakdown

load_dotenv()

app = FastAPI(
    title="KineKids Dropshipping Backend API",
    description="Microservicio en Python para automatización de catálogo, márgenes y sincronización de pedidos con Hertwill.",
    version="1.0.0",
)

# Configuración CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

INTERNAL_SECRET_TOKEN = os.getenv("KINEKIDS_INTERNAL_TOKEN", "kinekids_secure_internal_token_2026")
client = HertwillClient()

def verify_internal_token(x_internal_token: Optional[str] = Header(None)):
    """
    Middleware de seguridad Red Team: Protege endpoints privados contra invocaciones no autorizadas.
    """
    if not x_internal_token or x_internal_token != INTERNAL_SECRET_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Acceso Denegado: Cabecera X-Internal-Token inválida o ausente.",
        )
    return x_internal_token

@app.get("/health")
def health_check():
    """Endpoint público para verificar el estado de salud del backend."""
    return {
        "status": "healthy",
        "service": "kinekids-python-core",
        "environment": os.getenv("NODE_ENV", "development"),
        "version": "1.0.0",
    }

@app.get("/api/pricing/calculate")
def calculate_price_endpoint(wholesale_price: float, shipping_cost: float = 14.99):
    """Calcula el desglose financiero de un producto según la Escalera de Valor."""
    return get_pricing_breakdown(wholesale_price, shipping_cost)

@app.post("/api/sync/catalog", dependencies=[Depends(verify_internal_token)])
async def sync_catalog_endpoint(page: int = 1, limit: int = 50, brand: Optional[str] = None):
    """
    Endpoint privado: Obtiene y procesa el catálogo de Hertwill con reintentos y resolución de marcas.
    """
    try:
        data = await client.get_products(page=page, limit=limit, brand=brand)
        return {
            "status": "success",
            "count": len(data.get("products", [])),
            "data": data,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error durante la sincronización de catálogo: {str(e)}",
        )

@app.post("/api/orders/fulfill", dependencies=[Depends(verify_internal_token)])
async def fulfill_order_endpoint(payload: OrderPayload):
    """
    Endpoint privado: Procesa un pedido verificado en la API de Hertwill.
    """
    try:
        res = await client.Fulfill_order(payload)
        return {
            "status": "success",
            "hertwill_response": res,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Error de comunicación con proveedor Hertwill: {str(e)}",
        )
