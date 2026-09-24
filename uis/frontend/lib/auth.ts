// Motor de firma y verificación de JWT con Web Crypto API (HMAC SHA-256)
// Totalmente nativo en Node.js 18+ y Next.js Edge Runtime. Zero dependencias.

const DEFAULT_SECRET = "kinekids_super_secret_jwt_key_2026_min_32_bytes_long!";

function base64UrlEncode(str: string): string {
  const base64 = btoa(str);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }
  return atob(base64);
}

function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return base64UrlEncode(binary);
}

async function getCryptoKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function createAdminToken(email: string): Promise<string> {
  const secret = process.env.ADMIN_JWT_SECRET || DEFAULT_SECRET;
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: email,
    role: "admin",
    iat: now,
    exp: now + 24 * 60 * 60, // Expiración en 24 horas
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const key = await getCryptoKey(secret);
  const enc = new TextEncoder();
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(dataToSign));
  const signature = bufferToBase64Url(signatureBuffer);

  return `${dataToSign}.${signature}`;
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  if (!token || typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [encodedHeader, encodedPayload, signature] = parts;
  const secret = process.env.ADMIN_JWT_SECRET || DEFAULT_SECRET;

  try {
    // 1. Verificar expiración
    const payloadJson = JSON.parse(base64UrlDecode(encodedPayload));
    const now = Math.floor(Date.now() / 1000);
    if (payloadJson.exp && payloadJson.exp < now) {
      return false;
    }

    // 2. Verificar firma
    const dataToSign = `${encodedHeader}.${encodedPayload}`;
    const key = await getCryptoKey(secret);
    const enc = new TextEncoder();
    
    // Reconstruir firma recibida como ArrayBuffer
    const sigBinary = base64UrlDecode(signature);
    const sigBytes = new Uint8Array(sigBinary.length);
    for (let i = 0; i < sigBinary.length; i++) {
      sigBytes[i] = sigBinary.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes,
      enc.encode(dataToSign)
    );

    return isValid;
  } catch (err) {
    return false;
  }
}
