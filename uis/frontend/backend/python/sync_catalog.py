import asyncio
import json
import os
from hertwill_client import HertwillClient

async def sync_catalog():
    print("Iniciando sincronización de catálogo desde Hertwill...")
    client = HertwillClient()
    
    # 1. Obtener los productos con el nuevo algoritmo de precios (márgenes y reglas de Amazon aplicadas)
    # Nota: Si se integra una API de Amazon, se le pasaría el amazon_price al pricing module.
    # Por ahora asume que el modulo get_products hace uso del nuevo get_pricing_breakdown.
    
    all_products = []
    page = 1
    total_pages = 1
    
    while page <= total_pages:
        print(f"Obteniendo página {page}...")
        try:
            data = await client.get_products(page=page, limit=100)
            products = data.get("products", [])
            pagination = data.get("pagination", {})
            
            # Filtrar productos marcados como agotados por la regla de Amazon
            active_products = [p for p in products if p.get("stock_status", "instock") != "outofstock"]
            all_products.extend(active_products)
            
            total_pages = pagination.get("page_count", 1)
            page += 1
        except Exception as e:
            print(f"Error en página {page}: {e}")
            break
            
    print(f"Sincronización completa. {len(all_products)} productos obtenidos.")
    
    # 2. Guardar en el catálogo curado local para el frontend headless
    target_path = "../data/curated_catalog.json"
    os.makedirs(os.path.dirname(target_path), exist_ok=True)
    with open(target_path, "w") as f:
        json.dump(all_products, f, indent=2, ensure_ascii=False)
        
    print(f"Catálogo guardado en {target_path}")

if __name__ == "__main__":
    asyncio.run(sync_catalog())
