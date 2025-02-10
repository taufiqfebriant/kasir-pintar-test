import { drizzle } from "drizzle-orm/mysql2";

export const db = drizzle({
  connection: {
    user: "kasirpintar",
    password: "kasirpintar",
    database: "kasir_pintar",
    port: 3306,
    host: "127.0.0.1",
  },
});
