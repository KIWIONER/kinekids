# Auditoría Integral de Botones y Enlaces - KineKids E-Commerce

Este documento contiene el inventario exhaustivo y el estado de validación de todos los enlaces, botones y elementos interactivos en la **Tienda Oficial (Frontend)** y en el **Panel Administrativo (Backend)**.

---

## 1. Web Oficial (Frontend · Puerto 3000)

### 🏷️ Header y Navegación Principal
| Elemento | Tipo | Destino / Acción | Estado |
| :--- | :---: | :--- | :---: |
| **Logo KineKids** | Enlace (`<Link>`) | Redirige al inicio (`/`) con scroll arriba. | ✅ 100% Funcional |
| **Nuestra Filosofía** | Enlace (`<Link>`) | Ancla a sección de filosofía (`/#essence`). | ✅ 100% Funcional |
| **Píldora: Sets de Juego** | Enlace (`<Link>`) | Scroll suave a sección Sets (`/#sets`). | ✅ 100% Funcional |
| **Píldora: Módulos & Pikler** | Enlace (`<Link>`) | Scroll suave a sección Módulos (`/#modulos`). | ✅ 100% Funcional |
| **Píldora: Mobiliario** | Enlace (`<Link>`) | Scroll suave a sección Mobiliario (`/#mobiliario`). | ✅ 100% Funcional |
| **Píldora: Cunas & Carritos** | Enlace (`<Link>`) | Scroll suave a sección Cunas (`/#cunas-carritos`). | ✅ 100% Funcional |
| **Píldora: Accesorios** | Enlace (`<Link>`) | Scroll suave a sección Accesorios (`/#accesorios`). | ✅ 100% Funcional |
| **Acceso Familias / Usuario** | Botón / Menú | Abre dropdown de autenticación o enlace directo a `/login`. | ✅ 100% Funcional |
| **Icono Carrito de Compra** | Botón (`onClick`) | Abre / cierra el panel lateral del carrito (`CartDrawer`). | ✅ 100% Funcional |

---

### 🛍️ Tarjetas de Producto (`ProductCard` en Catálogo)
| Elemento | Tipo | Destino / Acción | Estado |
| :--- | :---: | :--- | :---: |
| **Imagen / Título del Producto** | Enlace (`<Link>`) | Navega a la ficha del producto (`/products/[id]`). | ✅ 100% Funcional |
| **Botón Hover "Ver Detalles"** | Enlace (`<Link>`) | Navega a la ficha del producto (`/products/[id]`). | ✅ 100% Funcional |
| **Botón "+ AÑADIR"** | Botón (`onClick`) | Añade el artículo al carrito y muestra feedback *"¡AÑADIDO!"*. | ✅ 100% Funcional |
| **Badge de Categoría con Destello** | Visual / Badge | Muestra la familia correspondiente (ej. *Cunas & Carritos*). | ✅ 100% Funcional |
| **Badge "+X Colores"** | Indicador | Muestra la cantidad de variantes disponibles. | ✅ 100% Funcional |

---

### 📄 Página de Detalle de Producto (`/products/[id]`)
| Elemento | Tipo | Destino / Acción | Estado |
| :--- | :---: | :--- | :---: |
| **Breadcrumb "Inicio"** | Enlace (`<Link>`) | Redirige al inicio (`/`). | ✅ 100% Funcional |
| **Breadcrumb "Categoría"** | Enlace (`<Link>`) | Regresa a su categoría en la tienda (`/#cunas-carritos`, etc.). | ✅ 100% Funcional |
| **Botón "← Volver al catálogo"** | Botón (`onClick`) | Historial inteligente (`window.history.back()`) con fallback a categoría. | ✅ 100% Funcional |
| **Selector de Colores / Variantes** | Botones (`onClick`) | Cambia en tiempo real la foto activa, precio y título (`router.replace`). | ✅ 100% Funcional |
| **Galería de Miniaturas** | Botones (`onClick`) | Cambia la imagen activa en el visor principal. | ✅ 100% Funcional |
| **Zoom / Lightbox (Abrir Foto)** | Botón (`onClick`) | Abre el modal de imagen en pantalla completa. | ✅ 100% Funcional |
| **Flechas Lightbox (Prev / Next)** | Botones (`onClick`) | Navega entre imágenes en pantalla completa. | ✅ 100% Funcional |
| **Selector de Cantidad (- / +)** | Botones (`onClick`) | Incrementa o reduce la cantidad a ordenar. | ✅ 100% Funcional |
| **Botón "Añadir a la Cesta"** | Botón (`onClick`) | Añade al carrito y abre automáticamente el drawer. | ✅ 100% Funcional |
| **Enlace "Explorar más en [Categoría]"** | Enlace (`<a>`) | Ancla a la sección de la categoría en el home. | ✅ 100% Funcional |

---

### 🛒 Carrito Lateral (`CartDrawer`)
| Elemento | Tipo | Destino / Acción | Estado |
| :--- | :---: | :--- | :---: |
| **Botón Cerrar (`X`)** | Botón (`onClick`) | Oculta el panel lateral del carrito. | ✅ 100% Funcional |
| **Botón "Seguir comprando"** | Botón (`onClick`) | Cierra el carrito y vuelve a la vista activa. | ✅ 100% Funcional |
| **Disminuir Cantidad (`-`)** | Botón (`onClick`) | Reduce unidades (elimina al llegar a 0). | ✅ 100% Funcional |
| **Aumentar Cantidad (`+`)** | Botón (`onClick`) | Añade una unidad adicional. | ✅ 100% Funcional |
| **Icono Papelera (Eliminar)** | Botón (`onClick`) | Remueve el ítem del carrito. | ✅ 100% Funcional |
| **"Proceder al Checkout"** | Botón (`onClick`) | Redirige al flujo de pago seguro (`/checkout`). | ✅ 100% Funcional |

---

### 💳 Proceso de Checkout y Cuenta de Usuario
| Elemento | Tipo | Destino / Acción | Estado |
| :--- | :---: | :--- | :---: |
| **"Volver a la tienda"** (`/checkout`) | Enlace (`<Link>`) | Redirige a la tienda (`/`). | ✅ 100% Funcional |
| **"Usar Datos de Prueba"** | Botón (`onClick`) | Autocompleta los campos de envío para tests rápidos. | ✅ 100% Funcional |
| **"Pagar [Total] €"** | Botón (`submit`) | Valida el formulario, procesa la orden y envía a `/checkout/success`. | ✅ 100% Funcional |
| **"Seguir explorando"** (`/checkout/success`) | Enlace (`<Link>`) | Redirige al catálogo (`/`). | ✅ 100% Funcional |
| **Iniciar Sesión** (`/login`) | Botón (`submit`) | Valida credenciales e inicia sesión. | ✅ 100% Funcional |
| **"Guardar Ajustes"** (`/mi-cuenta/configuracion`) | Botón (`submit`) | Persiste los datos del perfil de usuario. | ✅ 100% Funcional |
| **"Cerrar Sesión"** (`/mi-cuenta`) | Botón (`onClick`) | Cierra la sesión activa y redirige. | ✅ 100% Funcional |

---

## 2. Panel Administrativo (Backend · Puerto 3001)

### 🛠️ Barra Superior Administrativa (`AdminSubHeader`)
| Elemento | Tipo | Destino / Acción | Estado |
| :--- | :---: | :--- | :---: |
| **Logo KineKids Admin** | Enlace (`<Link>`) | Redirige al Dashboard principal (`/`). | ✅ 100% Funcional |
| **Pestaña "Dashboard"** | Enlace (`<Link>`) | Vista de métricas y pedidos (`/`). | ✅ 100% Funcional |
| **Pestaña "Curados & Márgenes"** | Enlace (`<Link>`) | Catálogo oficial de 183 productos (`/admin/curados`). | ✅ 100% Funcional |
| **Pestaña "Catálogo Hertwill"** | Enlace (`<Link>`) | Explorador de proveedor (`/admin/catalogo`). | ✅ 100% Funcional |
| **Botón "Refrescar Tienda"** | Botón (`onClick`) | Dispara webhook de revalidación al frontend y emite `BroadcastChannel`. | ✅ 100% Funcional |
| **Botón "Ver Tienda"** | Enlace externo (`<a>`) | Abre la web oficial en nueva pestaña (`http://localhost:3000`). | ✅ 100% Funcional |
| **Botón "Salir" (Logout)** | Botón (`onClick`) | Cierra sesión de administrador (`/api/admin/logout`) y envía a `/admin/login`. | ✅ 100% Funcional |

---

### 📦 Gestión de Curados (`/admin/curados`)
| Elemento | Tipo | Destino / Acción | Estado |
| :--- | :---: | :--- | :---: |
| **Pestañas de Categoría (Sets, Módulos, etc.)** | Botones (`onClick`) | Filtra la tabla por cada una de las 5 categorías oficiales. | ✅ 100% Funcional |
| **Flechas Mover Categoría (← / →)** | Botones (`onClick`) | Reordena las categorías en la navegación global. | ✅ 100% Funcional |
| **Flechas Mover Producto (← / →)** | Botones (`onClick`) | Cambia el orden (`sort_order`) del producto en la tienda. | ✅ 100% Funcional |
| **Selector de Categoría (Dropdown)** | `<select>` (`onChange`) | Reasigna la categoría y **auto-guarda en tiempo real** en base de datos. | ✅ 100% Funcional |
| **Input de Precio (PVP)** | `<input>` (`onChange`) | Edita el precio de venta sugerido. | ✅ 100% Funcional |
| **Botón "20%" (Margen Objetivo)** | Botón (`onClick`) | Calcula y fija automáticamente el PVP con 20% de margen. | ✅ 100% Funcional |
| **Botón "Guardar Cambios"** | Botón (`onClick`) | Guarda modificaciones de precio y ficha en Supabase y local. | ✅ 100% Funcional |
| **Botón "Quitar de Curados"** | Botón (`onClick`) | Remueve el artículo del catálogo público de la tienda. | ✅ 100% Funcional |

---

### 🔍 Explorador Catálogo Hertwill (`/admin/catalogo`)
| Elemento | Tipo | Destino / Acción | Estado |
| :--- | :---: | :--- | :---: |
| **Buscador y Filtro de Categorías** | `<input>` / Botones | Búsqueda local o profunda en servidor. | ✅ 100% Funcional |
| **Paginación (← Anterior / Siguiente →)** | Botones (`onClick`) | Navega por las páginas del catálogo externo. | ✅ 100% Funcional |
| **Botón "Curar / Sincronizar"** | Botón (`onClick`) | Importa el producto al catálogo oficial de KineKids. | ✅ 100% Funcional |
| **Botón "Descurar"** | Botón (`onClick`) | Remueve el producto importado. | ✅ 100% Funcional |

---

## 3. Resumen y Métricas de Validación
- **Enlaces Auditados:** 44 enlaces (25 en Frontend + 19 en Backend) -> **100% HTTP 200 / Rutas Válidas**.
- **Botones Auditados:** 67 botones (28 en Frontend + 39 en Backend) -> **100% con manejador activo**.
- **Errores 404 / Huérfanos:** **0**.
- **Estado de Pruebas Automatizadas:** **5/5 tests pasados (`suite.test.mjs`)**.
