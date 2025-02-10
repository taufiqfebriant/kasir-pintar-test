import { Router } from "express";
import { login } from "./login/index.js";
import { register } from "./register/index.js";

const router = Router();

router.use("/register", register);
router.use("/login", login);

export { router };
