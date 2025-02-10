import { Router } from "express";
import { getHandler } from "./get.js";
import { postHandler } from "./post.js";

const router = Router();

router.post("/", postHandler);
router.get("/", getHandler);

export { router as attendances };
