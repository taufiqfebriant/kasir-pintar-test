import { Router } from "express";
import { loginHandler } from "./login.js";

const router = Router();

router.post("/", loginHandler);

export { router as login };
