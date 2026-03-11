import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { LeadRoutes } from "../modules/lead/lead.routes";
import { ApiKeyRoutes } from "../modules/apiKey/apiKey.routes";

const router = Router();

router.use("/auth", AuthRoutes);
router.use("/leads", LeadRoutes);
router.use("/api-keys", ApiKeyRoutes);

export const IndexRoutes = router;
