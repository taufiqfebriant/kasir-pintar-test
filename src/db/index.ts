import { drizzle } from "drizzle-orm/mysql2";
import { env } from "../utils/env";

export const db = drizzle({
  connection: {
    user: env.MYSQL_USER,
    password: env.MYSQL_PASSWORD,
    database: env.MYSQL_DATABASE,
    port: env.MYSQL_PORT,
    host: env.MYSQL_HOST,
  },
});
