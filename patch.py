import os

path = 'uis/frontend/components/ProductCard.tsx'
with open(path, 'r') as f:
    content = f.read()

# 1. Replace Add To Cart Block
search_str = """          <button
            onClick={handleAddToCart}
            className={`px-4.5 py-2.5 rounded-full font-bold text-xs flex items-center space-x-1.5 transition-all duration-300 cursor-pointer shadow-sm ${
              isAdded
                ? "bg-emerald-600 text-white"
                : "bg-[#242424] hover:bg-black text-white"
            }`}
            aria-label="Añadir al carrito"
          >"""

replace_str = """          {(product as any).stock_status === "outofstock" ? (
            <button
              disabled
              className="px-4.5 py-2.5 rounded-full font-bold text-xs flex items-center space-x-1.5 transition-all duration-300 shadow-sm bg-red-100 text-red-600 cursor-not-allowed opacity-80"
              aria-label="Agotado"
            >
              <PackageX className="w-3.5 h-3.5" />
              <span>AGOTADO</span>
            </button>
          ) : (
          <button
            onClick={handleAddToCart}
            className={`px-4.5 py-2.5 rounded-full font-bold text-xs flex items-center space-x-1.5 transition-all duration-300 cursor-pointer shadow-sm ${
              isAdded
                ? "bg-emerald-600 text-white"
                : "bg-[#242424] hover:bg-black text-white"
            }`}
            aria-label="Añadir al carrito"
          >"""

content = content.replace(search_str, replace_str)

# 2. Need to add a closing tag for the ternary we just injected
search_str_close = """              )}
          </button>"""

replace_str_close = """              )}
          </button>
          )}"""

content = content.replace(search_str_close, replace_str_close)


# 3. Add PackageX to lucide-react imports
if "PackageX" not in content:
    content = content.replace('import { Heart, Check, Plus, Sparkles } from "lucide-react";', 'import { Heart, Check, Plus, Sparkles, PackageX } from "lucide-react";')

with open(path, 'w') as f:
    f.write(content)

print("ProductCard patched.")
