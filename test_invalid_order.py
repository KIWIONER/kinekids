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
b64_auth = base64.b64encode(f"{key}:{sec}".encode()).decode()

orderData = {
    "line_items": [{"product_id": 10230, "quantity": 1}]
}

full_url = f"{url}/wp-json/wc/v3/orders?consumer_key={key}&consumer_secret={sec}"
req = urllib.request.Request(full_url, data=json.dumps(orderData).encode(), headers={
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) KineKids/1.0',
    'Content-Type': 'application/json',
    'Authorization': f'Basic {b64_auth}'
})

try:
    with urllib.request.urlopen(req) as response:
        print("Success")
except urllib.error.HTTPError as e:
    print(f"Error {e.code}: {e.read().decode()}")
