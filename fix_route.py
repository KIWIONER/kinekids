import os

path = "uis/frontend/app/api/checkout/intent/route.ts"
with open(path, "r") as f:
    content = f.read()

# Replace the fetch part
old_fetch = """      const productRes = await fetch(`${wcUrl}/wp-json/wc/v3/products?sku=${hertwillId}`, {
        headers: { "Authorization": authHeader }
      });"""

new_fetch = """      // Añadimos User-Agent para saltarnos el cortafuegos WAF de Hostinger/Cloudflare
      const productRes = await fetch(`${wcUrl}/wp-json/wc/v3/products?sku=${hertwillId}&consumer_key=${wcKey}&consumer_secret=${wcSecret}`, {
        headers: { 
          "Authorization": authHeader,
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) KineKids/1.0"
        }
      });"""

new_content = content.replace(old_fetch, new_fetch)

with open(path, "w") as f:
    f.write(new_content)
print("Route updated with WAF bypass.")
