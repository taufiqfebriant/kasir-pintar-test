import { defineConfig } from "drizzle-kit";
import { env } from "./src/utils/env";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "mysql",
  dbCredentials: {
    user: env.MYSQL_USER,
    password: env.MYSQL_PASSWORD,
    database: env.MYSQL_DATABASE,
    port: env.MYSQL_PORT,
    host: env.MYSQL_HOST,
  },
});
