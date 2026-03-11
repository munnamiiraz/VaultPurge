export const API_KEY_CONSTANTS = {
  /**
   * Prefix prepended to every raw API key.
   * Makes it easy to identify VaultPurge keys in logs, headers, etc.
   */
  KEY_PREFIX: "vp_",

  /**
   * Length (in bytes) of the random portion of the key.
   * 32 bytes = 64 hex chars → ~2^256 combinations = brute-force resistant.
   */
  KEY_BYTE_LENGTH: 32,

  /**
   * HTTP header the Chrome extension sends the API key in.
   * Example: x-api-key: vp_a1b2c3d4...
   */
  HEADER_NAME: "x-api-key",

  /**
   * Maximum number of API keys a single user can create.
   * Prevents abuse / key hoarding.
   */
  MAX_KEYS_PER_USER: 5,

  /**
   * Limits for the key name field.
   */
  NAME_MIN_LENGTH: 1,
  NAME_MAX_LENGTH: 100,
} as const;
