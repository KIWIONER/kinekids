import os, json, urllib.request, re, base64

env_path = "uis/frontend/.env.local"
with open(env_path, "r") as f:
    env_content = f.read()

url_match = re.search(r"WOOCOMMERCE_URL=([^\s]+)", env_content)
key_match = re.search(r"WOOCOMMERCE_CONSUMER_KEY=([^\s]+)", env_content)
sec_match = re.search(r"WOOCOMMERCE_CONSUMER_SECRET=([^\s]+)", env_content)

url = url_match.group(1)
key = key_match.group(1)
sec = sec_match.group(1)

full_url = f"{url}/wp-json/wc/v3/orders?consumer_key={key}&consumer_secret={sec}"
req = urllib.request.Request(full_url, headers={'User-Agent': 'Mozilla/5.0'})

try:
    with urllib.request.urlopen(req) as response:
        orders = json.loads(response.read().decode())
        print(f"Últimos {len(orders)} pedidos:")
        for o in orders[:5]:
            print(f"- ID: {o.get('id')}, Status: {o.get('status')}, Total: {o.get('total')}, Email: {o.get('billing', {}).get('email')}")
except Exception as e:
    print(f"Error: {e}")
