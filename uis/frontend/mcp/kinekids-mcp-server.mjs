import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { getCatalogRepository } from "../lib/adapters/index.js";

// Funciones de cálculo financiero locales al MCP
function calculateFinancials(product) {
  const wholesale = product.wholesale_price ?? product.price ?? 0;
  const shipping = product.shipping_cost ?? (wholesale > 80 ? 33 : wholesale > 30 ? 20 : 14.99);
  const totalCost = wholesale + shipping;
  const activeRetail = product.retail_price_override ?? product.retail_price ?? product.price ?? 0;
  const netMarginEuros = activeRetail - totalCost;
  const netMarginPercent = activeRetail > 0 ? (netMarginEuros / activeRetail) * 100 : 0;
  const target20Retail = Math.ceil(totalCost / 0.80);

  return {
    wholesale,
    shipping,
    totalCost,
    activeRetail,
    netMarginEuros: parseFloat(netMarginEuros.toFixed(2)),
    netMarginPercent: parseFloat(netMarginPercent.toFixed(1)),
    target20Retail,
  };
}

// Inicializar Servidor MCP de KineKids
const server = new Server(
  {
    name: "kinekids-catalog",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Definición de Herramientas MCP
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "kinekids_get_catalog",
        description: "Obtiene el catálogo curado completo de KineKids con métricas financieras detalladas.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "kinekids_update_price",
        description: "Actualiza el PVP de un producto en el catálogo curado preservando inmutablemente el coste mayorista.",
        inputSchema: {
          type: "object",
          properties: {
            productId: { type: "string", description: "ID del producto" },
            newRetailPrice: { type: "number", description: "Nuevo PVP público en Euros (€)" },
          },
          required: ["productId", "newRetailPrice"],
        },
      },
      {
        name: "kinekids_audit_financials",
        description: "Audita la salud financiera del catálogo curado identificando productos con margen neto < 20% o precios desajustados.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "hertwill_query_supplier",
        description: "Consulta en vivo la API del proveedor Hertwill para buscar marcas, productos o estado de stock.",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Término de búsqueda o marca" },
            brandSlug: { type: "string", description: "Slug opcional de marca (ej. iglu-soft, meowbaby)" },
          },
        },
      },
    ],
  };
});

// Ejecución de Herramientas MCP
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const repository = getCatalogRepository();

  if (name === "kinekids_get_catalog") {
    const products = await repository.getCuratedProducts();
    const enriched = products.map((p) => ({
      ...p,
      financials: calculateFinancials(p),
    }));

    const totalProfit = enriched.reduce((acc, p) => acc + p.financials.netMarginEuros, 0);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              totalProducts: enriched.length,
              totalCuratedGrossProfit: parseFloat(totalProfit.toFixed(2)),
              products: enriched.map((p) => ({
                id: p.id,
                title: p.title,
                category: p.category,
                retailPrice: p.financials.activeRetail,
                wholesaleCost: p.financials.wholesale,
                shippingSpain: p.financials.shipping,
                netProfit: p.financials.netMarginEuros,
                netProfitMargin: `${p.financials.netMarginPercent}%`,
              })),
            },
            null,
            2
          ),
        },
      ],
    };
  }

  if (name === "kinekids_update_price") {
    const { productId, newRetailPrice } = args;
    const products = await repository.getCuratedProducts();
    const idx = products.findIndex((p) => String(p.id) === String(productId));

    if (idx === -1) {
      return {
        content: [{ type: "text", text: `Error: Producto ID ${productId} no encontrado en el catálogo.` }],
        isError: true,
      };
    }

    const target = products[idx];
    const wholesale = target.wholesale_price ?? target.price ?? 0;
    const newPriceRound = Math.round(newRetailPrice);

    products[idx] = {
      ...target,
      wholesale_price: wholesale,
      retail_price_override: newPriceRound,
      retail_price: newPriceRound,
      price: newPriceRound,
    };

    await repository.saveCuratedProducts(products);
    const fin = calculateFinancials(products[idx]);

    return {
      content: [
        {
          type: "text",
          text: `PVP de "${target.title}" (ID: ${productId}) actualizado a ${newPriceRound}€. Beneficio Neto Est: +${fin.netMarginEuros}€ (${fin.netMarginPercent}%).`,
        },
      ],
    };
  }

  if (name === "kinekids_audit_financials") {
    const products = await repository.getCuratedProducts();
    const lowMarginItems = [];
    let healthyCount = 0;

    products.forEach((p) => {
      const fin = calculateFinancials(p);
      if (fin.netMarginPercent < 20) {
        lowMarginItems.push({
          id: p.id,
          title: p.title,
          activeRetail: fin.activeRetail,
          wholesaleCost: fin.wholesale,
          shippingSpain: fin.shipping,
          currentMargin: `${fin.netMarginPercent}%`,
          recommendedPvp20: `${fin.target20Retail}€`,
        });
      } else {
        healthyCount++;
      }
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              totalAudited: products.length,
              healthyMarginItems: healthyCount,
              lowMarginCount: lowMarginItems.length,
              attentionRequired: lowMarginItems,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  if (name === "hertwill_query_supplier") {
    const { query, brandSlug } = args || {};
    const apiKey = process.env.HERTWILL_API_KEY;

    if (!apiKey) {
      return {
        content: [{ type: "text", text: "Error: No HERTWILL_API_KEY configurada." }],
        isError: true,
      };
    }

    try {
      let url = "https://api.hertwill.com/v1/products?page=1&limit=20";
      if (brandSlug) url += `&brand=${encodeURIComponent(brandSlug)}`;
      if (query) url += `&search=${encodeURIComponent(query)}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
      });

      if (!res.ok) throw new Error(`Hertwill API Error ${res.status}`);
      const data = await res.json();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                totalProductsFound: data.meta?.pagination?.total || 0,
                productsSample: (data.data || []).map((p) => ({
                  id: p.id,
                  name: p.name,
                  brand: p.brand?.name,
                  price: p.price,
                })),
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error al consultar Hertwill: ${err.message}` }],
        isError: true,
      };
    }
  }

  throw new Error(`Herramienta desconocida: ${name}`);
});

// Arrancar Servidor MCP sobre Stdio
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Servidor MCP de KineKids conectado en modo Stdio.");
}

main().catch((err) => {
  console.error("Error fatal en Servidor MCP KineKids:", err);
  process.exit(1);
});
