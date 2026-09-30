# 📦 Agrupación de Variantes y Selector de Imagen Principal en Curados (/admin/curados)

## 1. Contexto y Problema Resuelto
Anteriormente, el panel administrativo de productos curados renderizaba cada variante individual de un mismo producto como una tarjeta separada (por ejemplo, 8 tarjetas idénticas para un mismo set de espuma que solo cambiaban de color). Esto producía un catálogo visualmente saturado (cerca de 200 tarjetas) que dificultaba la fijación de precios y la selección de imágenes representativas.

## 2. Arquitectura de la Solución
Se actualizó `uis/backend/app/admin/curados/page.tsx` con un agregador reactivo `useMemo`:
- **Agrupación por Nombre Base:** Utiliza `parseProductTitle(p.title)` de `lib/variants.ts` para agrupar todas las variantes bajo una única tarjeta representativa.
- **Píldoras Interactivas de Variantes:** Permite conmutar la variante activa en tiempo real para visualizar y editar su coste específico, PVP y margen neto.
- **Botón "Aplicar a todas":** Replicación instantánea del precio editado a todas las variantes del producto.
- **Galería con Navegación por Flechas (⬅️ ➡️):** Controles superpuestos en la fotografía del producto para navegar entre todas las imágenes de las variantes y fijar la preferida como imagen principal (`imageUrl`) mediante el botón **"🌟 Fijar Principal"**.
- **Cálculo Fiel de Coste de Envío:** Restitución de la tarifa base estándar de 33,00 € para envíos a España peninsular, garantizando un margen neto objetivo superior al 20%.

---

## 3. Archivos Involucrados
- `uis/backend/app/admin/curados/page.tsx`
- `uis/backend/lib/variants.ts` & `uis/frontend/lib/variants.ts`
- `uis/backend/lib/pricing.ts` & `uis/frontend/lib/pricing.ts`
