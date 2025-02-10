import { Router } from "express";
import { registerHandler } from "./register.js";

const router = Router();

router.post("/", registerHandler);

export { router as register };
