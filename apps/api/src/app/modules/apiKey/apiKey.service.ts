import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { API_KEY_CONSTANTS } from "./apiKey.constant";
import { ApiKeyCreateResult, ApiKeyListItem } from "./apiKey.interface";
import { generateApiKey, hashApiKey, toApiKeyListItem } from "./apiKey.utils";

// ─── Create API Key ──────────────────────────────────────────────────────────

/**
 * Generates a new API key for a user.
 *
 * Security flow:
 * 1. Generate a cryptographically random key  (vp_<64-hex>)
 * 2. SHA-256 hash it
 * 3. Store the hash — never the raw key
 * 4. Return the raw key to the user — this is the ONLY time it's visible
 *
 * Enforces a per-user limit (MAX_KEYS_PER_USER) to prevent abuse.
 */
const createApiKey = async (
  userId: string,
  name: string
): Promise<ApiKeyCreateResult> => {
  // Enforce per-user limit
  const existingCount = await prisma.apiKey.count({ where: { userId } });

  if (existingCount >= API_KEY_CONSTANTS.MAX_KEYS_PER_USER) {
    throw new AppError(
      status.BAD_REQUEST,
      `You can have at most ${API_KEY_CONSTANTS.MAX_KEYS_PER_USER} API keys. Revoke an existing key first.`
    );
  }

  // Generate + hash
  const rawKey = generateApiKey();
  const hashedKey = hashApiKey(rawKey);

  const apiKey = await prisma.apiKey.create({
    data: {
      userId,
      hashedKey,
      name: name.trim(),
    },
  });

  // Return raw key only once
  return {
    id: apiKey.id,
    name: apiKey.name,
    key: rawKey,
    createdAt: apiKey.createdAt,
  };
};

// ─── List API Keys ───────────────────────────────────────────────────────────

/**
 * Returns all API keys for a user.
 * Keys are masked — neither the raw key nor the full hash is exposed.
 */
const listApiKeys = async (userId: string): Promise<ApiKeyListItem[]> => {
  const keys = await prisma.apiKey.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return keys.map(toApiKeyListItem);
};

// ─── Revoke (Delete) API Key ─────────────────────────────────────────────────

/**
 * Deletes an API key by ID.
 * Scoped to userId — a user can only revoke their own keys.
 */
const revokeApiKey = async (id: string, userId: string): Promise<void> => {
  const existing = await prisma.apiKey.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new AppError(status.NOT_FOUND, `API key "${id}" not found.`);
  }

  await prisma.apiKey.delete({ where: { id } });
};

// ─── Validate API Key (for middleware) ────────────────────────────────────────

/**
 * Validates a raw API key from the request header.
 *
 * 1. Hash the incoming raw key
 * 2. Look up the hash in the database
 * 3. If found, update lastUsedAt (fire-and-forget)
 * 4. Return the associated user
 *
 * Returns null if the key is invalid / not found.
 */
const validateApiKey = async (rawKey: string) => {
  const hashedKey = hashApiKey(rawKey);

  const apiKey = await prisma.apiKey.findUnique({
    where: { hashedKey },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          isDeleted: true,
        },
      },
    },
  });

  if (!apiKey) return null;

  // Fire-and-forget: update lastUsedAt without blocking the response
  prisma.apiKey
    .update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    })
    .catch(() => {
      // Silently ignore — lastUsedAt is non-critical telemetry
    });

  return apiKey.user;
};

// ─── Export ───────────────────────────────────────────────────────────────────

export const ApiKeyService = {
  createApiKey,
  listApiKeys,
  revokeApiKey,
  validateApiKey,
};
