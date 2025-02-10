import { z } from "zod";

const envSchema = z.object({
  TZ: z.string().min(1, "TZ is required"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  PORT: z
    .string()
    .min(1, "PORT is required")
    .regex(/^\d+$/, "PORT must be a valid number")
    .transform((val) => Number(val)), // Transformasi ke number
});

export const env = envSchema.parse(process.env);
