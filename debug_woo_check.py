import os, json, urllib.request, re

env_path = "uis/frontend/.env.local"
with open(env_path, "r") as f:
    env_content = f.read()

url_match = re.search(r"WOOCOMMERCE_URL=([^\s]+)", env_content)
key_match = re.search(r"WOOCOMMERCE_CONSUMER_KEY=([^\s]+)", env_content)
sec_match = re.search(r"WOOCOMMERCE_CONSUMER_SECRET=([^\s]+)", env_content)

if url_match and key_match and sec_match:
    url = url_match.group(1)
    key = key_match.group(1)
    sec = sec_match.group(1)
    
    sku = "SET_36X_06"
    full_url = f"{url}/wp-json/wc/v3/products?sku={sku}&status=any&consumer_key={key}&consumer_secret={sec}"
    req = urllib.request.Request(full_url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            print(f"Resultados encontrados: {len(data)}")
            for p in data:
                print(f"- ID: {p.get('id')}, Name: {p.get('name')}, SKU: {p.get('sku')}, Price: {p.get('price')}")
    except Exception as e:
        print(f"Error connecting to WooCommerce: {e}")
