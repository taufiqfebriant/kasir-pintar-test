import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { db } from "../../db";
import { usersTable } from "../../db/schema";
import { env } from "../../utils/env";

const schema = z.object({
  email: z.string().email("Invalid email format").max(255, "Email is too long"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

type SelectUser = typeof usersTable.$inferSelect;

type ResBodyData = Pick<
  SelectUser,
  "id" | "name" | "email" | "createdAt" | "updatedAt"
> & { token: string };

type ResBody =
  | { errors: { key: string; message: string }[] }
  | { message: string }
  | {
      data: ResBodyData;
    };

type ReqBody = z.infer<typeof schema>;

export const loginHandler: RequestHandler<unknown, ResBody, ReqBody> = async (
  req,
  res
) => {
  try {
    const parsedData = schema.parse(req.body);

    const { email, password } = parsedData;

    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (existingUser.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = existingUser[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.status(200).json({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        token: `Bearer ${token}`,
      },
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({
        errors: e.issues.map((err) => ({
          key: err.path.join("."),
          message: err.message,
        })),
      });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};
