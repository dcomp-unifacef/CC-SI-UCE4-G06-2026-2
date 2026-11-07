import { Router } from "express";
import * as controller
    from "../controllers/clienteController";


const router = Router();


router.get("/", controller.retrieveAll);
router.get("/relatorio", controller.downloadReport);
router.get("/:id", controller.retrieveOne);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);


export default router;
