import { z } from "zod";
import { API_KEY_CONSTANTS } from "./apiKey.constant";

// ─── POST /api-keys — Create a new API key ───────────────────────────────────

export const createApiKeySchema = z.object({
  name: z
    .string("name is required")
    .min(
      API_KEY_CONSTANTS.NAME_MIN_LENGTH,
      `name must be at least ${API_KEY_CONSTANTS.NAME_MIN_LENGTH} character(s)`
    )
    .max(
      API_KEY_CONSTANTS.NAME_MAX_LENGTH,
      `name cannot exceed ${API_KEY_CONSTANTS.NAME_MAX_LENGTH} characters`
    )
    .trim(),
});

// ─── Inferred types ───────────────────────────────────────────────────────────

export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;
