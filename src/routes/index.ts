import { Router } from "express";
import { attendances } from "./attendances/index.js";
import { login } from "./login/index.js";
import { register } from "./register/index.js";

const router = Router();

router.use("/register", register);
router.use("/login", login);
router.use("/attendances", attendances);

export { router };
