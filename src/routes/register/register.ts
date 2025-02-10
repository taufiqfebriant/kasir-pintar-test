import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import type { RequestHandler } from "express";
import { z } from "zod";
import { db } from "../../db";
import { usersTable } from "../../db/schema";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  email: z.string().email("Invalid email format").max(255, "Email is too long"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

type SelectUser = typeof usersTable.$inferSelect;

type ResBody =
  | { errors: { key: string; message: string }[] }
  | { message: string }
  | {
      data: Pick<
        SelectUser,
        "id" | "name" | "email" | "createdAt" | "updatedAt"
      >;
    };

type ReqBody = z.infer<typeof schema>;

export const registerHandler: RequestHandler<
  unknown,
  ResBody,
  ReqBody
> = async (req, res) => {
  try {
    const parsedData = schema.parse(req.body);

    const { name, email, password } = parsedData;

    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUserIds = await db
      .insert(usersTable)
      .values({
        name,
        email,
        password: hashedPassword,
      })
      .$returningId();

    const newUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, newUserIds[0].id))
      .limit(1);

    if (newUser.length === 0) {
      return res
        .status(500)
        .json({ message: "User not found after insertion" });
    }

    return res.status(201).json({
      data: {
        id: newUser[0].id,
        name: newUser[0].name,
        email: newUser[0].email,
        createdAt: newUser[0].createdAt,
        updatedAt: newUser[0].updatedAt,
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
