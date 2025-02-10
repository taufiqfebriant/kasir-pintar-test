import { expressjwt } from "express-jwt";
import { env } from "../utils/env";

export const verifyJWT = expressjwt({
  secret: env.JWT_SECRET,
  algorithms: ["HS256"],
}).unless({
  path: [
    { url: "/api/login", methods: ["POST"] },
    { url: "/api/register", methods: ["POST"] },
  ],
});
