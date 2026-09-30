import json

try:
    with open("uis/frontend/data/catalog.json", "r") as f:
        catalog = json.load(f)
        for p in catalog:
            if p.get("title") == "Party Juego Blando Set":
                print(f"ENCONTRADO EN CATALOG.JSON:")
                print(f"ID: {p.get('id')}")
                print(f"Hertwill ID: {p.get('hertwill_id')}")
                print(f"SKU: {p.get('sku')}")
                print(f"Price: {p.get('price')}")
except Exception as e:
    print(f"Error: {e}")
