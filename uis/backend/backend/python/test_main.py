import pytest
from fastapi.testclient import TestClient
from backend.python.main import app, INTERNAL_SECRET_TOKEN
from backend.python.pricing import calculate_kinekids_price, get_pricing_breakdown

client = TestClient(app)

# 1. Pruebas del motor de precios y Escalera de Valor
def test_value_ladder_low_ticket():
    wholesale = 10.0  # < 20€
    retail, multiplier, category = calculate_kinekids_price(wholesale)
    assert multiplier == 2.50
    assert category == "accessory"
    # 10.0 * 2.5 = 25.0 -> redondeado a múltiplo de 5 -> 25.0
    assert retail == 25.0

def test_value_ladder_mid_ticket():
    wholesale = 50.0  # 20€ - 80€
    retail, multiplier, category = calculate_kinekids_price(wholesale)
    assert multiplier == 1.80
    assert category == "module"
    # 50.0 * 1.8 = 90.0 -> redondeado a múltiplo de 5 -> 90.0
    assert retail == 90.0

def test_value_ladder_high_ticket():
    wholesale = 100.0  # > 80€
    retail, multiplier, category = calculate_kinekids_price(wholesale)
    assert multiplier == 1.45
    assert category == "set"
    # 100.0 * 1.45 = 145.0 -> redondeado a múltiplo de 5 -> 145.0
    assert retail == 145.0

def test_pricing_breakdown():
    res = get_pricing_breakdown(100.0, shipping_cost=15.0)
    assert res["wholesale_price"] == 100.0
    assert res["retail_price"] == 145.0
    assert res["gross_margin"] == 45.0
    assert res["net_profit"] == 30.0

# 2. Pruebas de Endpoints Públicos
def test_health_check_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "kinekids-python-core"

# 3. Pruebas de Seguridad Red Team (X-Internal-Token Header Verification)
def test_sync_catalog_unauthorized():
    # Intento de invocación sin cabecera X-Internal-Token debe retornar 401
    response = client.post("/api/sync/catalog")
    assert response.status_code == 401
    assert "Acceso Denegado" in response.json()["detail"]

def test_sync_catalog_authorized():
    # Invocación con cabecera X-Internal-Token correcta debe retornar 200
    headers = {"X-Internal-Token": INTERNAL_SECRET_TOKEN}
    response = client.post("/api/sync/catalog", headers=headers)
    assert response.status_code == 200
    assert response.json()["status"] == "success"

def test_fulfill_order_validation():
    # Invocación con cuerpo inválido debe fallar con 422 Unprocessable Entity
    headers = {"X-Internal-Token": INTERNAL_SECRET_TOKEN}
    response = client.post("/api/orders/fulfill", headers=headers, json={})
    assert response.status_code == 422
