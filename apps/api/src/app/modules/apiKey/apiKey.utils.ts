import crypto from "crypto";
import { API_KEY_CONSTANTS } from "./apiKey.constant";
import { ApiKey, ApiKeyListItem } from "./apiKey.interface";

// ─── Key Generation ───────────────────────────────────────────────────────────

/**
 * Generates a cryptographically random API key.
 *
 * Format: `vp_<64 hex chars>`
 * - The prefix makes keys recognizable in logs / headers.
 * - 32 random bytes (= 64 hex chars) gives ~2^256 combinations,
 *   making brute-force infeasible even without rate-limiting.
 *
 * @returns Raw API key string (never stored — only shown to user once)
 */
export function generateApiKey(): string {
  const randomPart = crypto
    .randomBytes(API_KEY_CONSTANTS.KEY_BYTE_LENGTH)
    .toString("hex");
  return `${API_KEY_CONSTANTS.KEY_PREFIX}${randomPart}`;
}

// ─── Key Hashing ──────────────────────────────────────────────────────────────

/**
 * Produces a one-way SHA-256 hash of the raw API key.
 *
 * Why SHA-256 instead of bcrypt?
 * - API keys are high-entropy (64 random hex chars) — no risk of dictionary attack.
 * - SHA-256 is fast, which matters because we hash on every single request.
 * - bcrypt is designed for low-entropy secrets like passwords; overkill here.
 *
 * @param rawKey  The raw `vp_xxx...` key string
 * @returns       hex-encoded SHA-256 hash
 */
export function hashApiKey(rawKey: string): string {
  return crypto.createHash("sha256").update(rawKey).digest("hex");
}

// ─── Key Masking ──────────────────────────────────────────────────────────────

/**
 * Creates a masked version of a raw key for display purposes.
 *
 * Example: "vp_a1b2c3d4...abcdef78"
 * Shows the prefix + first 8 hex chars + "..." + last 8 hex chars.
 *
 * Note: This function works with the raw key, not the hash (which is opaque).
 * Since we don't store the raw key, we derive a display-safe "fingerprint"
 * from the hash instead — showing the first and last 4 chars of the hash.
 */
export function maskHashedKey(hashedKey: string): string {
  const prefix = API_KEY_CONSTANTS.KEY_PREFIX;
  const first = hashedKey.slice(0, 4);
  const last = hashedKey.slice(-4);
  return `${prefix}${first}...${last}`;
}

// ─── Formatting ───────────────────────────────────────────────────────────────

/**
 * Transforms a raw Prisma ApiKey row into a safe list item.
 * Strips hashedKey and userId, adds a masked key for display.
 */
export function toApiKeyListItem(apiKey: ApiKey): ApiKeyListItem {
  return {
    id: apiKey.id,
    name: apiKey.name,
    maskedKey: maskHashedKey(apiKey.hashedKey),
    lastUsedAt: apiKey.lastUsedAt,
    createdAt: apiKey.createdAt,
  };
}
