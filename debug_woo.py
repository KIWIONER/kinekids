import os, json, urllib.request, base64, re

path = "uis/frontend/app/api/checkout/intent/route.ts"
with open(path, "r") as f:
    content = f.read()

# Revert to old content
new_content = content.replace(
"""    // Recalcular el precio total seguro
    let totalCents = 0;
    const orderItems = [];

    for (const item of items) {
      // FIX: Por ahora, durante el desarrollo y para evitar desincronizaciones 
      // con WooCommerce, usamos el precio que viene del catálogo (item.product.price)
      // pero TODO: En producción, cruzar con LocalFileCatalogAdapter o DB real.
      const price = parseFloat(item.product.price);
      const hertwillId = item.product.hertwill_id || item.product.id;
      
      if (!isNaN(price)) {
         totalCents += Math.round(price * 100) * item.quantity;
         orderItems.push({
            product_id: hertwillId,
            quantity: item.quantity,
            name: item.product.title,
            price: price
         });
      }
    }""",
"""    // Recalcular el precio total seguro desde WooCommerce
    let totalCents = 0;
    const orderItems = [];

    for (const item of items) {
      const hertwillId = item.product.hertwill_id || item.product.id;
      
      const productRes = await fetch(`${wcUrl}/wp-json/wc/v3/products?sku=${hertwillId}`, {
        headers: { "Authorization": authHeader }
      });
      
      if (productRes.ok) {
        const productsData = await productRes.json();
        if (Array.isArray(productsData) && productsData.length > 0) {
          const wcProduct = productsData[0];
          const price = parseFloat(wcProduct.price);
          
          if (!isNaN(price)) {
             // Multiplicar por 100 para Stripe y sumar al total
             totalCents += Math.round(price * 100) * item.quantity;
             orderItems.push({
                product_id: wcProduct.id,
                quantity: item.quantity
             });
          }
        }
      }
    }"""
)
with open(path, "w") as f:
    f.write(new_content)
print("Route reverted to strict mode.")

# Debug WooCommerce
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
    
    auth_str = f"{key}:{sec}"
    b64_auth = base64.b64encode(auth_str.encode()).decode()
    
    req = urllib.request.Request(f"{url}/wp-json/wc/v3/products")
    req.add_header("Authorization", f"Basic {b64_auth}")
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            print(f"DEBUG WOOCOMMERCE: Encontrados {len(data)} productos.")
            for p in data[:5]:
                print(f"- ID: {p.get('id')}, Name: {p.get('name')}, SKU: {p.get('sku')}")
    except Exception as e:
        print(f"Error connecting to WooCommerce: {e}")
