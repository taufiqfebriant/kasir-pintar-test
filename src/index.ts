import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import express from "express";
import { verifyJWT } from "./middlewares/verify-jwt";
import { router } from "./routes";

dayjs.extend(utc);
dayjs.extend(timezone);

const app = express();

app.use(express.json());
app.use("/api", verifyJWT, router);

const port = 3000;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
