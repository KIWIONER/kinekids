import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import fs from "fs";
import path from "path";

const CACHE_FILE = path.join(process.cwd(), "lib", "translation_cache.json");

// Cache en memoria
let translationCache: Record<string, string> = {};

// Cargar caché del archivo al arrancar
if (fs.existsSync(CACHE_FILE)) {
  try {
    translationCache = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
  } catch (e) {
    console.error("Failed to read translation cache file:", e);
  }
}

/**
 * Traduce textos de inglés a español utilizando Google Translate de forma gratuita.
 */
async function translateFree(text: string): Promise<string> {
  const res = await fetch(
    `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=es&dt=t&q=${encodeURIComponent(text)}`
  );
  if (!res.ok) throw new Error(`Google Translate error: ${res.status}`);
  const json = await res.json();
  // El resultado viene en una estructura de arrays anidados
  return json[0].map((item: any) => item[0]).join("");
}

/**
 * Traduce una descripción del inglés al español de forma profesional, cálida y pedagógica.
 * Utiliza un sistema de caché en memoria y archivo JSON para que cada producto se traduzca una sola vez.
 */
export async function translateDescription(productId: string, englishText: string): Promise<string> {
  if (!englishText) return "";

  const cacheKey = String(productId);

  // 1. Comprobar si ya está traducido en la caché
  if (translationCache[cacheKey]) {
    return translationCache[cacheKey];
  }

  let cleanTranslation = "";

  // Comprobar presencia de clave de API para Gemini
  const hasGeminiKey = !!(process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY);

  if (hasGeminiKey) {
    try {
      console.log(`[Translator] Traduciendo producto ${productId} usando Gemini 1.5 Flash...`);
      const { text: translated } = await generateText({
        model: google("gemini-1.5-flash"),
        prompt: `Translate the following product description to professional, warm, engaging, and pedagogical Spanish (suitable for a premium children's play store). Preserve any bullet points (like •) or formatting. Only return the translated text without any conversational preamble:\n\n${englishText}`,
      });
      cleanTranslation = translated.trim();
    } catch (err) {
      console.error(`[Translator] Error al traducir con Gemini, usando fallback de Google Translate:`, err);
    }
  }

  // Si no se pudo traducir con Gemini (o no hay API key), usar el traductor gratuito
  if (!cleanTranslation) {
    try {
      console.log(`[Translator] Traduciendo producto ${productId} usando Google Translate gratuito...`);
      cleanTranslation = await translateFree(englishText);
    } catch (err) {
      console.error(`[Translator] Error al usar Google Translate gratuito:`, err);
    }
  }

  // 3. Normalizar y guardar en la caché y persistir en el archivo
  const { normalizeToSpanish } = await import("@/lib/description_parser");
  const normalized = normalizeToSpanish(cleanTranslation || englishText);

  if (normalized) {
    translationCache[cacheKey] = normalized;
    try {
      const libDir = path.dirname(CACHE_FILE);
      if (!fs.existsSync(libDir)) {
        fs.mkdirSync(libDir, { recursive: true });
      }
      fs.writeFileSync(CACHE_FILE, JSON.stringify(translationCache, null, 2), "utf-8");
    } catch (fsErr) {
      console.error("Failed to write translation cache to disk:", fsErr);
    }
    return normalized;
  }

  return normalizeToSpanish(englishText);
}
