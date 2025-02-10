import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "mysql",
  dbCredentials: {
    user: "kasirpintar",
    password: "kasirpintar",
    database: "kasir_pintar",
    port: 3306,
    host: "127.0.0.1",
  },
});
