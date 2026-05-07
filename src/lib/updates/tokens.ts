// Signed-URL approve / reject tokens.
// Adapted from /Users/user/Projects/bestai/src/lib/autopilot/tokens.ts.
// HMAC-SHA256, base64url, timing-safe compare, default 72h TTL.
// Each pending_review row stores hashed approve_token + reject_token; the
// email digest carries the raw signed URL.

import crypto from "crypto";

const SECRET_ENV = "UPDATES_TOKEN_SECRET";

interface Payload {
  pid: string; // pending_review id
  action: "approve" | "reject";
  exp: number; // unix seconds
}

function getSecret(): string {
  const s = process.env[SECRET_ENV];
  if (!s) throw new Error(`Missing env var ${SECRET_ENV}`);
  return s;
}

function b64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function fromB64url(s: string): Buffer {
  const pad = "=".repeat((4 - (s.length % 4)) % 4);
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

export function signActionToken(
  pid: string,
  action: "approve" | "reject",
  ttlSec = 72 * 3600,
): string {
  const payload: Payload = { pid, action, exp: Math.floor(Date.now() / 1000) + ttlSec };
  const payloadB64 = b64url(Buffer.from(JSON.stringify(payload)));
  const mac = crypto.createHmac("sha256", getSecret()).update(payloadB64).digest();
  return `${payloadB64}.${b64url(mac)}`;
}

export function verifyActionToken(token: string): Payload | null {
  try {
    const [payloadB64, macB64] = token.split(".");
    if (!payloadB64 || !macB64) return null;
    const expected = crypto.createHmac("sha256", getSecret()).update(payloadB64).digest();
    const provided = fromB64url(macB64);
    if (expected.length !== provided.length) return null;
    if (!crypto.timingSafeEqual(expected, provided)) return null;
    const payload = JSON.parse(fromB64url(payloadB64).toString()) as Payload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

// Token hash for storing in DB (so we can know if a token has been used
// without storing the raw token).
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
