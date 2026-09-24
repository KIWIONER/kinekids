import pytest
from pydantic import ValidationError
from backend.python.mcp_server import CuratedProductSchema, PriceUpdateInputSchema, FinancialAuditOutputSchema

def test_curated_product_pydantic_validation():
    # Producto válido
    prod = CuratedProductSchema(
        id="9656",
        title="Set de Juego Blando 10 Bloques",
        wholesale_price=132.71,
        retail_price=208.0,
        shipping_cost=33.0
    )
    assert prod.wholesale_price == 132.71
    assert prod.total_cost == 165.71
    assert prod.net_margin == 42.29
    assert prod.margin_percentage == 20.33

def test_invalid_wholesale_price():
    with pytest.raises(ValidationError):
        CuratedProductSchema(
            id="000",
            title="Producto Inválido",
            wholesale_price=-10.0,
            retail_price=50.0
        )

def test_price_update_input_validation():
    inp = PriceUpdateInputSchema(product_id="9656", new_retail_price=215.0)
    assert inp.product_id == "9656"
    assert inp.new_retail_price == 215.0

    with pytest.raises(ValidationError):
        PriceUpdateInputSchema(product_id="9656", new_retail_price=-5.0)
