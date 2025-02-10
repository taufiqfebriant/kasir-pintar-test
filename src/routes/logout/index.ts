import { Router } from "express";
import { postHandler } from "./post.js";

const router = Router();

router.post("/", postHandler);

export { router as logout };
