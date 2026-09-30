# 🛒 Motor de Cross-Selling por Marca y Ofertas de Paquete con Envío Unificado

## 1. Modelo de Negocio y Arbitraje de Envíos
En la red de dropshipping de Hertwill, los productos provienen de diferentes talleres y artesanos europeos (MeowBaby en Polonia, leg&go en Letonia, Luula, etc.).
- **Venta Desacoplada (2 compras individuales):** 2 portes de envío independientes de 33,00 € c/u = 66,00 € de coste logístico total.
- **Venta Combinada (Misma Marca):** Al salir del mismo taller, ambos productos se consolidan en un único paquete (~33,00 € en total).
- **Estrategia Comercial:** Al ofrecer un **15% de descuento en el 2º producto complementario**, el cliente percibe un descuento muy atractivo y KineKids incrementa el margen neto de la operación en más de un **+74%**.

---

## 2. Componentes Técnicos Implementados
1. **Motor de Afinidad (`lib/cross_selling.ts`):**
   - `detectProductBrand(title)`: Reconocimiento inteligente de la marca fabricante.
   - `getBrandCompatibleAddons(product, catalog, limit)`: Búsqueda y filtrado de accesorios complementarios que pertenecen estrictamente al mismo fabricante.
   - `calculateBundlePricing(mainProduct, addonProduct, discountPercent)`: Cálculo matemático de precios, ahorro del cliente y validación de margen neto comercial.
2. **Componente de UI (`BundleOfferWidget.tsx`):**
   - Widget interactivo situado en la ficha de producto (`ProductDetailClient.tsx`).
   - Muestra tarjetas conectadas con el símbolo `+`, selector de color del complemento y botón directo **«Añadir Pack al Carrito»**.
3. **Suite de Pruebas Unitarias (`unit-test/suite.test.mjs`):**
   - 12 pruebas unitarias automatizadas con 100% de éxito.
