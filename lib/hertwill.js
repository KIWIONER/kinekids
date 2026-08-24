"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PRODUCTS_MOCK = void 0;
exports.getHertwillProducts = getHertwillProducts;
exports.getCuratedProducts = getCuratedProducts;
var supabase_1 = require("@/lib/supabase");
var pricing_1 = require("@/lib/pricing");
exports.PRODUCTS_MOCK = [
    // 1. High Ticket: Sets Completos
    {
        id: "set-1",
        title: "IGLU Set de Construcción Completo",
        category: "set",
        price: 289.00,
        description: "Un conjunto completo de bloques de espuma blanda para fomentar la exploración espacial libre y el gateo seguro. Diseñado bajo los principios Pikler.",
        imageUrl: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=600",
        ageRange: "6 meses - 3 años",
        dimensions: "120cm x 120cm x 30cm",
        wholesale_price: 289.00,
        markup_multiplier: 1.45,
        retail_price: 420.00,
        shipping_cost: 19.99
    },
    {
        id: "set-2",
        title: "Circuito de Motricidad Pikler Max",
        category: "set",
        price: 349.00,
        description: "Conjunto de 6 piezas que incluye rampa, escalones y túnel de estimulación motora. El set definitivo para el desarrollo de la confianza física.",
        imageUrl: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&q=80&w=600",
        ageRange: "9 meses - 4 años",
        dimensions: "180cm x 60cm x 40cm",
        wholesale_price: 349.00,
        markup_multiplier: 1.45,
        retail_price: 505.00,
        shipping_cost: 24.99
    },
    // 2. Mid Ticket: Módulos Individuales
    {
        id: "mod-1",
        title: "Cubo de Gateo y Escalada",
        category: "module",
        price: 95.00,
        description: "Módulo individual de espuma de alta densidad. Ideal para servir como escalón, asiento o soporte para el juego activo independiente.",
        imageUrl: "https://images.unsplash.com/photo-1515488042361-404e9250afef?auto=format&fit=crop&q=80&w=600",
        ageRange: "6 meses - 5 años",
        dimensions: "50cm x 50cm x 30cm",
        wholesale_price: 95.00,
        markup_multiplier: 1.8,
        retail_price: 170.00,
        shipping_cost: 14.99
    },
    {
        id: "mod-2",
        title: "Rampa de Deslizamiento Suave",
        category: "module",
        price: 110.00,
        description: "Rampa blanda con base antideslizante para la práctica segura del gateo inclinado y deslizamiento. Acompaña el desarrollo del equilibrio.",
        imageUrl: "https://images.unsplash.com/photo-1566854868039-478db63dcee5?auto=format&fit=crop&q=80&w=600",
        ageRange: "8 meses - 3 años",
        dimensions: "70cm x 50cm x 25cm",
        wholesale_price: 110.00,
        markup_multiplier: 1.8,
        retail_price: 200.00,
        shipping_cost: 14.99
    },
    // 3. Low Ticket: Accesorios Sensoriales
    {
        id: "acc-1",
        title: "Cilindro Sensorial Texturizado",
        category: "accessory",
        price: 39.00,
        description: "Rodillo sensorial de espuma suave para estimulación vestibular y ejercicios de equilibrio guiado o libre.",
        imageUrl: "https://images.unsplash.com/photo-1537655780520-1e392edd816a?auto=format&fit=crop&q=80&w=600",
        ageRange: "3 meses - 2 años",
        dimensions: "40cm x 15cm x 15cm",
        wholesale_price: 39.00,
        markup_multiplier: 2.5,
        retail_price: 100.00,
        shipping_cost: 9.99
    },
    {
        id: "acc-2",
        title: "Bloque de Texturas y Contrastes",
        category: "accessory",
        price: 35.00,
        description: "Pequeño cubo blando con caras texturizadas y colores de contraste orgánicos para estimulación táctil temprana en bebés.",
        imageUrl: "https://images.unsplash.com/photo-1581579438747-1dc8d1e0ca96?auto=format&fit=crop&q=80&w=600",
        ageRange: "0 meses - 18 meses",
        dimensions: "20cm x 20cm x 20cm",
        wholesale_price: 35.00,
        markup_multiplier: 2.5,
        retail_price: 90.00,
        shipping_cost: 9.99
    }
];
var brandSlugMapCache = null; // lowercase brand name or slug -> brand slug
/**
 * Resuelve cualquier nombre de marca o slug al slug exacto que espera la API de Hertwill.
 * Ej: "IGLU" -> "iglu-soft"
 */
function resolveBrandSlug(input, apiKey) {
    return __awaiter(this, void 0, void 0, function () {
        var lowerInput, res, json, map_1, e_1, resolved;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!input)
                        return [2 /*return*/, input];
                    lowerInput = input.toLowerCase().trim();
                    if (!!brandSlugMapCache) return [3 /*break*/, 6];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, fetch("https://api.hertwill.com/v1/brands", {
                            headers: {
                                Authorization: "Bearer ".concat(apiKey),
                                Accept: "application/json",
                            },
                            next: { revalidate: 86400 },
                        })];
                case 2:
                    res = _a.sent();
                    if (!res.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, res.json()];
                case 3:
                    json = _a.sent();
                    map_1 = new Map();
                    (json.data || []).forEach(function (b) {
                        if (b.name)
                            map_1.set(b.name.toLowerCase().trim(), b.slug);
                        if (b.slug)
                            map_1.set(b.slug.toLowerCase().trim(), b.slug);
                    });
                    brandSlugMapCache = map_1;
                    _a.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    e_1 = _a.sent();
                    console.error("Error al obtener mapa de marcas de Hertwill:", e_1);
                    return [3 /*break*/, 6];
                case 6:
                    if (brandSlugMapCache) {
                        resolved = brandSlugMapCache.get(lowerInput);
                        if (resolved)
                            return [2 /*return*/, resolved];
                    }
                    return [2 /*return*/, lowerInput.replace(/[^a-z0-9]+/g, "-")];
            }
        });
    });
}
// Cachés persistentes en memoria del servidor
var brandsCache = null; // brand slug -> brand ID
var shippingCache = {}; // brand ID -> shipping price to Spain
// Helper para obtener el ID de la marca
function getBrandIdBySlug(slug, apiKey) {
    return __awaiter(this, void 0, void 0, function () {
        var res, json, rawBrands, cache, _i, rawBrands_1, b, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (brandsCache) {
                        return [2 /*return*/, brandsCache[slug] || null];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch("https://api.hertwill.com/v1/brands", {
                            headers: {
                                Authorization: "Bearer ".concat(apiKey),
                                Accept: "application/json",
                            },
                            next: { revalidate: 86400 }, // Cachear por 24 horas
                        })];
                case 2:
                    res = _a.sent();
                    if (!res.ok)
                        throw new Error("Brands status: ".concat(res.status));
                    return [4 /*yield*/, res.json()];
                case 3:
                    json = _a.sent();
                    rawBrands = json.data || [];
                    cache = {};
                    for (_i = 0, rawBrands_1 = rawBrands; _i < rawBrands_1.length; _i++) {
                        b = rawBrands_1[_i];
                        if (b.slug && b.id) {
                            cache[b.slug] = String(b.id);
                        }
                    }
                    brandsCache = cache;
                    return [2 /*return*/, brandsCache[slug] || null];
                case 4:
                    err_1 = _a.sent();
                    console.error("Error al obtener marcas para mapeo:", err_1);
                    return [2 /*return*/, null];
                case 5: return [2 /*return*/];
            }
        });
    });
}
// Helper para obtener la tarifa de envío a España
function getShippingPriceToSpain(brandId, apiKey) {
    return __awaiter(this, void 0, void 0, function () {
        var res, json, data, price, spRate, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (shippingCache[brandId] !== undefined) {
                        return [2 /*return*/, shippingCache[brandId]];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch("https://api.hertwill.com/v1/brands/".concat(brandId, "/shipping-price-lists"), {
                            headers: {
                                Authorization: "Bearer ".concat(apiKey),
                                Accept: "application/json",
                            },
                            next: { revalidate: 86400 }, // Cachear por 24 horas
                        })];
                case 2:
                    res = _a.sent();
                    if (!res.ok)
                        throw new Error("Shipping price list status: ".concat(res.status));
                    return [4 /*yield*/, res.json()];
                case 3:
                    json = _a.sent();
                    data = json.data || [];
                    price = 14.99;
                    if (data[0] && data[0].shipping_prices) {
                        spRate = data[0].shipping_prices.find(function (r) { return r.dest_iso_code === "ES"; });
                        if (spRate && typeof spRate.price === "number") {
                            price = spRate.price;
                        }
                    }
                    shippingCache[brandId] = price;
                    return [2 /*return*/, price];
                case 4:
                    err_2 = _a.sent();
                    console.error("Error al obtener tarifa de env\u00EDo para marca ID ".concat(brandId, ":"), err_2);
                    return [2 /*return*/, 14.99];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function getHertwillProducts() {
    return __awaiter(this, arguments, void 0, function (page, limit, brand, category) {
        var apiKey, url, resolvedBrand, response, errorText, json, rawProducts, adultRegex_1, pagination, uniqueBrandSlugs, brandSlugToIdMap_1, brandIdToShippingPriceMap_1, uniqueBrandIds, products, error_1;
        var _this = this;
        var _a, _b;
        if (page === void 0) { page = 1; }
        if (limit === void 0) { limit = 20; }
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    apiKey = process.env.HERTWILL_API_KEY;
                    if (!apiKey || apiKey.startsWith("hk_mock")) {
                        console.log("Hertwill API: Usando catálogo simulado (mock) paginado.");
                        return [2 /*return*/, {
                                products: exports.PRODUCTS_MOCK,
                                pagination: {
                                    page: 1,
                                    per_page: limit,
                                    total: exports.PRODUCTS_MOCK.length,
                                    page_count: 1
                                },
                                facets: [
                                    {
                                        field_name: "brand",
                                        counts: [
                                            { count: 4, highlighted: "KineKids Mock", value: "KineKids Mock" }
                                        ]
                                    },
                                    {
                                        field_name: "category",
                                        counts: [
                                            { count: 4, highlighted: "Juegos y Juguetes", value: "Juegos y Juguetes" }
                                        ]
                                    }
                                ]
                            }];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 11, , 12]);
                    url = "https://api.hertwill.com/v1/products?page=".concat(page, "&limit=").concat(limit);
                    if (!brand) return [3 /*break*/, 3];
                    return [4 /*yield*/, resolveBrandSlug(brand, apiKey)];
                case 2:
                    resolvedBrand = _c.sent();
                    url += "&brand=".concat(encodeURIComponent(resolvedBrand));
                    _c.label = 3;
                case 3:
                    if (category)
                        url += "&category=".concat(encodeURIComponent(category));
                    return [4 /*yield*/, fetch(url, {
                            headers: {
                                Authorization: "Bearer ".concat(apiKey),
                                Accept: "application/json",
                            },
                            next: { revalidate: 3600 }, // Caché de revalidación por 1 hora
                        })];
                case 4:
                    response = _c.sent();
                    if (!!response.ok) return [3 /*break*/, 6];
                    return [4 /*yield*/, response.text()];
                case 5:
                    errorText = _c.sent();
                    console.error("Hertwill API retorn\u00F3 c\u00F3digo ".concat(response.status, ". Cuerpo: ").concat(errorText));
                    throw new Error("Hertwill API retorn\u00F3 c\u00F3digo ".concat(response.status));
                case 6: return [4 /*yield*/, response.json()];
                case 7:
                    json = _c.sent();
                    console.log("Hertwill API Response (RAW):", JSON.stringify(json, null, 2)); // <-- NUEVO LOG
                    rawProducts = json.data || [];
                    adultRegex_1 = /boxer|brief|thong|bralette|underwear|panties|lingerie|men's celebration|men's daily|men's sport|signature collection/i;
                    rawProducts = rawProducts.filter(function (p) { return !adultRegex_1.test(p.name || ""); });
                    pagination = ((_a = json.meta) === null || _a === void 0 ? void 0 : _a.pagination) || {
                        page: 1,
                        per_page: limit,
                        total: rawProducts.length,
                        page_count: 1
                    };
                    uniqueBrandSlugs = Array.from(new Set(rawProducts.map(function (p) { var _a; return (_a = p.brand) === null || _a === void 0 ? void 0 : _a.slug; }).filter(Boolean)));
                    brandSlugToIdMap_1 = {};
                    return [4 /*yield*/, Promise.all(uniqueBrandSlugs.map(function (slug) { return __awaiter(_this, void 0, void 0, function () {
                            var id;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, getBrandIdBySlug(slug, apiKey)];
                                    case 1:
                                        id = _a.sent();
                                        if (id) {
                                            brandSlugToIdMap_1[slug] = id;
                                        }
                                        return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 8:
                    _c.sent();
                    brandIdToShippingPriceMap_1 = {};
                    uniqueBrandIds = Array.from(new Set(Object.values(brandSlugToIdMap_1)));
                    return [4 /*yield*/, Promise.all(uniqueBrandIds.map(function (brandId) { return __awaiter(_this, void 0, void 0, function () {
                            var price;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, getShippingPriceToSpain(brandId, apiKey)];
                                    case 1:
                                        price = _a.sent();
                                        brandIdToShippingPriceMap_1[brandId] = price;
                                        return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 9:
                    _c.sent();
                    // 4. Enriquecer en paralelo el número exacto de stock físico real desde la API
                    return [4 /*yield*/, Promise.all(rawProducts.map(function (p) { return __awaiter(_this, void 0, void 0, function () {
                            var detailRes, detailJson, e_2;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!(p.stock === null || p.stock === undefined)) return [3 /*break*/, 6];
                                        _a.label = 1;
                                    case 1:
                                        _a.trys.push([1, 5, , 6]);
                                        return [4 /*yield*/, fetch("https://api.hertwill.com/v1/products/".concat(p.id), {
                                                headers: {
                                                    Authorization: "Bearer ".concat(apiKey),
                                                    Accept: "application/json",
                                                },
                                                next: { revalidate: 3600 },
                                            })];
                                    case 2:
                                        detailRes = _a.sent();
                                        if (!detailRes.ok) return [3 /*break*/, 4];
                                        return [4 /*yield*/, detailRes.json()];
                                    case 3:
                                        detailJson = _a.sent();
                                        if (detailJson.data && typeof detailJson.data.stock === "number") {
                                            p.stock = detailJson.data.stock;
                                        }
                                        _a.label = 4;
                                    case 4: return [3 /*break*/, 6];
                                    case 5:
                                        e_2 = _a.sent();
                                        return [3 /*break*/, 6];
                                    case 6: return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 10:
                    // 4. Enriquecer en paralelo el número exacto de stock físico real desde la API
                    _c.sent();
                    products = rawProducts.map(function (p) {
                        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
                        var wholesalePrice = typeof p.price === "number" ? p.price : parseFloat(p.price || "0");
                        var pricing = (0, pricing_1.calculatePricing)(wholesalePrice);
                        var category = "accessory";
                        if (wholesalePrice > 80) {
                            category = "set";
                        }
                        else if (wholesalePrice >= 20) {
                            category = "module";
                        }
                        var brandId = ((_a = p.brand) === null || _a === void 0 ? void 0 : _a.slug) ? brandSlugToIdMap_1[p.brand.slug] : null;
                        var shippingCost = brandId ? ((_b = brandIdToShippingPriceMap_1[brandId]) !== null && _b !== void 0 ? _b : 14.99) : 14.99;
                        var brandName = ((_c = p.brand) === null || _c === void 0 ? void 0 : _c.name) || ((_d = p.brand) === null || _d === void 0 ? void 0 : _d.slug) || (((_e = p.name) === null || _e === void 0 ? void 0 : _e.includes("IGLU")) ? "IGLU" : ((_f = p.name) === null || _f === void 0 ? void 0 : _f.includes("TOKU")) ? "TOKU" : ((_g = p.name) === null || _g === void 0 ? void 0 : _g.includes("ELIN")) ? "KOTTO" : "Hertwill");
                        var brandSlug = ((_h = p.brand) === null || _h === void 0 ? void 0 : _h.slug) || brandName.toLowerCase();
                        return {
                            id: String(p.id),
                            title: p.name || "Producto de KineKids",
                            category: category,
                            price: wholesalePrice,
                            description: p.description || "Sin descripción disponible.",
                            imageUrl: ((_j = p.images) === null || _j === void 0 ? void 0 : _j.featured) || (((_k = p.images) === null || _k === void 0 ? void 0 : _k.gallery) && p.images.gallery[0]) || "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=600",
                            ageRange: p.ageRange || ((_l = p.metadata) === null || _l === void 0 ? void 0 : _l.ageRange) || "6 meses - 4 años",
                            dimensions: p.dimensions || ((_m = p.metadata) === null || _m === void 0 ? void 0 : _m.dimensions) || "Medida estándar",
                            brand: brandName,
                            brand_name: brandName,
                            brand_slug: brandSlug,
                            wholesale_price: wholesalePrice,
                            markup_multiplier: pricing.markupMultiplier,
                            retail_price: pricing.retailPrice,
                            shipping_cost: shippingCost,
                            stock_status: p.stock_status || "instock",
                            stock: typeof p.stock === "number" ? p.stock : null,
                        };
                    });
                    return [2 /*return*/, { products: products, pagination: pagination, facets: ((_b = json.meta) === null || _b === void 0 ? void 0 : _b.facets) || [] }];
                case 11:
                    error_1 = _c.sent();
                    console.error("Error al obtener productos de Hertwill:", error_1);
                    return [2 /*return*/, {
                            products: exports.PRODUCTS_MOCK,
                            pagination: {
                                page: 1,
                                per_page: 50,
                                total: exports.PRODUCTS_MOCK.length,
                                page_count: 1
                            },
                            facets: []
                        }];
                case 12: return [2 /*return*/];
            }
        });
    });
}
// Obtener catálogo curado desde Supabase o desde la Fuente Única de Verdad (data/curated_catalog.json)
function getCuratedProducts() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, data, error, err_3, DEFAULT_CURATED_PRODUCTS;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!supabase_1.supabase) return [3 /*break*/, 4];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, supabase_1.supabase
                            .from("products")
                            .select("*")];
                case 2:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (!error && data && data.length > 0) {
                        console.log("Cargados ".concat(data.length, " productos curados de Supabase."));
                        return [2 /*return*/, data.map(function (p) { return ({
                                id: p.id,
                                title: p.title,
                                category: p.category,
                                price: parseFloat(p.price),
                                description: p.description,
                                imageUrl: p.image_url,
                                ageRange: p.age_range,
                                dimensions: p.dimensions,
                                wholesale_price: p.wholesale_price,
                                retail_price_override: p.price,
                                retail_price: p.price,
                            }); })];
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_3 = _b.sent();
                    console.error("Error al cargar productos de Supabase:", err_3);
                    return [3 /*break*/, 4];
                case 4: return [4 /*yield*/, Promise.resolve().then(function () { return require("./default_catalog"); })];
                case 5:
                    DEFAULT_CURATED_PRODUCTS = (_b.sent()).DEFAULT_CURATED_PRODUCTS;
                    return [2 /*return*/, DEFAULT_CURATED_PRODUCTS];
            }
        });
    });
}
