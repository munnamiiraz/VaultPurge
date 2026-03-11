// ─── API Key Entity — matches Prisma ApiKey model ─────────────────────────────

export interface ApiKey {
  id: string;
  userId: string;
  hashedKey: string;
  name: string;
  lastUsedAt: Date | null;
  createdAt: Date;
}

// ─── Response Shapes ──────────────────────────────────────────────────────────

/** Returned when listing keys — NEVER includes the raw key or hash */
export interface ApiKeyListItem {
  id: string;
  name: string;
  /** Masked version for display, e.g. "vp_a1b2...ef78" */
  maskedKey: string;
  lastUsedAt: Date | null;
  createdAt: Date;
}

/** Returned only once on creation — the ONLY time the raw key is visible */
export interface ApiKeyCreateResult {
  id: string;
  name: string;
  /** Raw API key — shown only once, never stored */
  key: string;
  createdAt: Date;
}
