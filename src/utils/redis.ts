import * as redis from "redis";
import { env } from "./env";

const url = `redis://${env.REDIS_HOST}:${env.REDIS_PORT}`;

export const redisClient = redis.createClient({
  url,
});

redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});
