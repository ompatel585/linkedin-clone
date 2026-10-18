import { Router } from "express";
import { protectRoute } from "../../middleware/auth.js";
import { search } from "./search.controller.js";

const router = Router();

router.get("/", protectRoute, search);

export default router;
