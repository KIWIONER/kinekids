import os

path = 'uis/frontend/components/ProductCard.tsx'
with open(path, 'r') as f:
    content = f.read()

# Fix the broken line
broken = """<span className={}>
            {product.stock_status === "outofstock" ? "No Disponible" : getDisplayPrice()}
          </span>"""

fixed = """<span className={`text-xl font-extrabold tracking-tight ${(product as any).stock_status === "outofstock" ? "text-red-500 line-through" : "text-neutral-900"}`}>
            {(product as any).stock_status === "outofstock" ? "No Disponible" : getDisplayPrice()}
          </span>"""

content = content.replace(broken, fixed)

with open(path, 'w') as f:
    f.write(content)

print("Syntax error fixed!")
