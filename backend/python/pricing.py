import math
from typing import Dict, Any, Tuple

def calculate_kinekids_price(wholesale_price: float) -> Tuple[float, float, str]:
    """
    Calcula el PVP recomendado y la categoría de la Escalera de Valor de KineKids.
    
    Reglas:
    - Low Ticket (Accesorios): Coste < 20€ -> Multiplicador 2.50x
    - Mid Ticket (Módulos): Coste 20€ - 80€ -> Multiplicador 1.80x
    - High Ticket (Sets Completos): Coste > 80€ -> Multiplicador 1.45x
    - Redondeo: Múltiplo de 5€ más cercano.
    
    Retorna: (precio_retail_redondeado, multiplicador, categoria_slug)
    """
    price = max(0.0, float(wholesale_price))
    
    if price > 80.0:
        multiplier = 1.45
        category = "set"
    elif price >= 20.0:
        multiplier = 1.80
        category = "module"
    else:
        multiplier = 2.50
        category = "accessory"
        
    raw_retail = price * multiplier
    # Redondeo psicotécnico a múltiplos de 5€
    rounded_retail = round(raw_retail / 5.0) * 5.0
    
    return float(rounded_retail), multiplier, category

def get_pricing_breakdown(wholesale_price: float, shipping_cost: float = 14.99) -> Dict[str, Any]:
    """
    Retorna el desglose financiero completo incluyendo coste de envío y margen neto estimado.
    """
    retail_price, multiplier, category = calculate_kinekids_price(wholesale_price)
    gross_margin = retail_price - wholesale_price
    net_profit = gross_margin - shipping_cost
    margin_percentage = (net_profit / retail_price * 100.0) if retail_price > 0 else 0.0
    
    return {
        "wholesale_price": wholesale_price,
        "retail_price": retail_price,
        "markup_multiplier": multiplier,
        "category": category,
        "shipping_cost": shipping_cost,
        "gross_margin": round(gross_margin, 2),
        "net_profit": round(net_profit, 2),
        "net_margin_percentage": round(margin_percentage, 1),
    }
