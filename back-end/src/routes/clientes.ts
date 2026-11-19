import { Router } from "express";
import * as controller from "../controllers/clienteController";
import { requireAuth } from "../middlewares/authMiddleware";
import { leadRateLimiter } from "../middlewares/rateLimiter";

const router = Router();

router.post("/contato", leadRateLimiter, controller.createPublicLead);

router.use(requireAuth);

router.get("/", controller.retrieveAll);
router.get("/relatorio", controller.downloadReport);
router.get("/:id", controller.retrieveOne);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

export default router;
