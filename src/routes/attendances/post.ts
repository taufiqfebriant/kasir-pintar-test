import { and, eq, isNull } from "drizzle-orm";
import { RequestHandler } from "express";
import { z } from "zod";
import { db } from "../../db";
import { attendancesTable } from "../../db/schema";

const schema = z.object({
  type: z.enum(["clock-in", "clock-out"], {
    errorMap: () => ({
      message:
        "Invalid 'type' value. It should be either 'clock-in' or 'clock-out'.",
    }),
  }),
});

type SelectAttendance = typeof attendancesTable.$inferSelect;

type ResBody =
  | { errors: { key: string; message: string }[] }
  | { message: string }
  | {
      data: Pick<
        SelectAttendance,
        "id" | "userId" | "clockIn" | "clockOut" | "createdAt" | "updatedAt"
      >;
    };

type ReqBody = z.infer<typeof schema>;

export const postHandler: RequestHandler<unknown, ResBody, ReqBody> = async (
  req,
  res
) => {
  try {
    const parsedData = schema.parse(req.body);

    const { type } = parsedData;
    const userId = req.auth?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const currentAttendance = await db
      .select()
      .from(attendancesTable)
      .where(
        and(
          eq(attendancesTable.userId, userId),
          isNull(attendancesTable.clockOut)
        )
      )
      .limit(1);

    if (type === "clock-in") {
      if (currentAttendance.length > 0) {
        return res
          .status(400)
          .json({ message: "You have already clocked in today." });
      }

      const newAttendanceIds = await db
        .insert(attendancesTable)
        .values({
          userId,
          clockIn: new Date(),
        })
        .$returningId();

      const newAttendance = await db
        .select()
        .from(attendancesTable)
        .where(eq(attendancesTable.id, newAttendanceIds[0].id))
        .limit(1);

      return res.status(201).json({
        data: {
          id: newAttendance[0].id,
          userId: newAttendance[0].userId,
          clockIn: newAttendance[0].clockIn,
          clockOut: newAttendance[0].clockOut,
          createdAt: newAttendance[0].createdAt,
          updatedAt: newAttendance[0].updatedAt,
        },
      });
    }

    if (type === "clock-out") {
      if (currentAttendance.length === 0) {
        return res
          .status(400)
          .json({ message: "You need to clock-in before clocking out." });
      }

      await db
        .update(attendancesTable)
        .set({ clockOut: new Date() })
        .where(eq(attendancesTable.id, currentAttendance[0].id));

      const updatedAttendance = await db
        .select()
        .from(attendancesTable)
        .where(eq(attendancesTable.id, currentAttendance[0].id))
        .limit(1);

      return res.status(200).json({
        data: {
          id: updatedAttendance[0].id,
          userId: updatedAttendance[0].userId,
          clockIn: updatedAttendance[0].clockIn,
          clockOut: updatedAttendance[0].clockOut,
          createdAt: updatedAttendance[0].createdAt,
          updatedAt: updatedAttendance[0].updatedAt,
        },
      });
    }

    return res.status(400).json({ message: "Invalid type" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        errors: error.issues.map((err) => ({
          key: err.path.join("."),
          message: err.message,
        })),
      });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};
