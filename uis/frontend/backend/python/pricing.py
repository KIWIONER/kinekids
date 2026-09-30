import math
from typing import Dict, Any, Tuple, Optional

def calculate_kinekids_price(wholesale_price: float, shipping_cost: float = 0.0, amazon_price: Optional[float] = None) -> Tuple[float, float, str, bool]:
    """
    Calcula el PVP dinámico para asegurar un margen NETO del 20%, o ajustar contra Amazon.
    
    Retorna: (retail_price, multiplier_efectivo, category, is_out_of_stock)
    """
    price = max(0.0, float(wholesale_price))
    base_cost = price + shipping_cost
    
    # 1. Calcular precio ideal para mantener exactamente un 20% de margen NETO.
    # Formula: Margen = (Retail - Coste) / Retail -> 0.20 = 1 - (Coste / Retail) -> Retail = Coste / 0.80
    ideal_retail = base_cost / 0.80
    
    # Categorización basada en coste (mantenemos la lógica de tags para el frontend)
    if price > 80.0:
        category = "set"
    elif price >= 20.0:
        category = "module"
    else:
        category = "accessory"

    final_retail = ideal_retail
    is_out_of_stock = False

    # 2. Competencia de precios con Amazon
    if amazon_price and amazon_price > 0:
        if ideal_retail < amazon_price:
            # Nuestro precio ideal (20% margen) ya es MÁS BARATO que Amazon.
            # Podríamos subirlo para igualar, pero el usuario dijo: "no buscamos mayor margen... ofrecemos descuento"
            # y "intentamos siempre estar un poco por debajo del precio de amazon".
            # Así que nos quedamos con el ideal_retail, que le ganará a Amazon y da el 20%.
            final_retail = ideal_retail
        else:
            # Amazon es más barato que nuestro precio ideal. Tenemos que hacer match.
            # Intentamos ponernos 1 céntimo o 1 euro por debajo si queremos, o hacer match exacto.
            # Haremos match exacto o un poco por debajo.
            final_retail = amazon_price - 0.05 # Ligeramente por debajo para ganar la buy box
            
            # Verificamos si al bajar el precio, el margen cae por debajo del 10%
            new_margin = (final_retail - base_cost) / final_retail if final_retail > 0 else 0
            if new_margin < 0.10:
                is_out_of_stock = True
                final_retail = 0.0 # Se inhabilita la venta
    
    # Redondeo comercial opcional (terminar en .95 o redondear a 5)
    if not is_out_of_stock:
        final_retail = round(final_retail / 5.0) * 5.0 - 0.05 # Ejemplo: 144.95

    # Calcular multiplicador efectivo (solo para tracking interno)
    effective_multiplier = final_retail / price if price > 0 and final_retail > 0 else 0.0

    return float(final_retail), effective_multiplier, category, is_out_of_stock

def get_pricing_breakdown(wholesale_price: float, shipping_cost: float = 14.99, amazon_price: Optional[float] = None) -> Dict[str, Any]:
    retail_price, multiplier, category, is_oos = calculate_kinekids_price(wholesale_price, shipping_cost, amazon_price)
    
    if is_oos:
        return {
            "wholesale_price": wholesale_price,
            "retail_price": 0.0,
            "markup_multiplier": 0.0,
            "category": category,
            "shipping_cost": shipping_cost,
            "gross_margin": 0.0,
            "net_profit": 0.0,
            "net_margin_percentage": 0.0,
            "stock_status": "outofstock"
        }

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
        "stock_status": "instock"
    }
