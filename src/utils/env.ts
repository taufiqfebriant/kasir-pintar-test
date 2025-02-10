import { z } from "zod";

const envSchema = z.object({
  PORT: z
    .string()
    .min(1, "PORT is required")
    .regex(/^\d+$/, "PORT must be a valid number")
    .transform((val) => Number(val)),
  TZ: z.string().min(1, "TZ is required"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  MYSQL_ROOT_PASSWORD: z.string().min(1, "MYSQL_ROOT_PASSWORD is required"),
  MYSQL_DATABASE: z.string().min(1, "MYSQL_DATABASE is required"),
  MYSQL_USER: z.string().min(1, "MYSQL_USER is required"),
  MYSQL_PASSWORD: z.string().min(1, "MYSQL_PASSWORD is required"),
  MYSQL_PORT: z
    .string()
    .min(1, "MYSQL_PORT is required")
    .regex(/^\d+$/, "MYSQL_PORT must be a valid number")
    .transform((val) => Number(val)),
  ELASTIC_PASSWORD: z.string().min(1, "ELASTIC_PASSWORD is required"),
  DISCOVERY_TYPE: z.string().min(1, "DISCOVERY_TYPE is required"),
  ELASTICSEARCH_PORT: z
    .string()
    .min(1, "ELASTICSEARCH_PORT is required")
    .regex(/^\d+$/, "ELASTICSEARCH_PORT must be a valid number")
    .transform((val) => Number(val)),
  PMA_PORT: z
    .string()
    .min(1, "PMA_PORT is required")
    .regex(/^\d+$/, "PMA_PORT must be a valid number")
    .transform((val) => Number(val)),
  REDIS_HOST: z.string().min(1, "REDIS_HOST is required"),
  REDIS_PORT: z
    .string()
    .min(1, "REDIS_PORT is required")
    .regex(/^\d+$/, "REDIS_PORT must be a valid number")
    .transform((val) => Number(val)),
});

export const env = envSchema.parse(process.env);
