import { Router } from "express";
import { Role } from "../../constants/index";
import { checkAuth } from "../../middleware/checkAuth";
import { ApiKeyController } from "./apiKey.controller";

const router = Router();

// ─── All API key management routes require session authentication ──────────────
// Users manage their API keys via the web dashboard (session auth)

/**
 * @route   POST /api-keys
 * @desc    Generate a new API key
 * @body    { name: string }
 * @access  Private (USER, ADMIN)
 */
router.post("/", checkAuth(Role.USER, Role.ADMIN), ApiKeyController.createApiKey);

/**
 * @route   GET /api-keys
 * @desc    List all API keys for the user
 * @access  Private (USER, ADMIN)
 */
router.get("/", checkAuth(Role.USER, Role.ADMIN), ApiKeyController.listApiKeys);

/**
 * @route   DELETE /api-keys/:id
 * @desc    Revoke an API key
 * @access  Private (USER, ADMIN)
 */
router.delete("/:id", checkAuth(Role.USER, Role.ADMIN), ApiKeyController.revokeApiKey);

export const ApiKeyRoutes = router;
