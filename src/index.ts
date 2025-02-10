import express from "express";
import { verifyJWT } from "./middlewares/verify-jwt";
import { router } from "./routes";

const app = express();

app.use(express.json());
app.use("/api", verifyJWT, router);

const port = 3000;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
