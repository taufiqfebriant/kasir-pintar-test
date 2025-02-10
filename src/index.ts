import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import express from "express";
import { verifyJWT } from "./middlewares/verify-jwt";
import { router } from "./routes";
import { env } from "./utils/env";

dayjs.extend(utc);
dayjs.extend(timezone);

const app = express();

app.use(express.json());
app.use("/api", verifyJWT, router);

app.listen(env.PORT, () => {
  console.log(`Kasir pintar app listening on port ${env.PORT}`);
});
