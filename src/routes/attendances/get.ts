import { RequestHandler } from "express";
import { z } from "zod";
import elasticsearchClient from "../../utils/elasticsearch";

type Query = {
  bool: {
    must: Array<{
      term?: {
        userId: number;
      };
      range?: {
        clockIn?: {
          gte?: string;
        };
        clockOut?: {
          lte?: string;
        };
      };
    }>;
  };
};

const schema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

type Attendance = {
  userId: number;
  clockIn: string;
  clockOut: string | null;
  createdAt: string;
  updatedAt: string | null;
};

type ResBodyData = ({ id: number } & Attendance)[];

type ResBody =
  | { errors: { key: string; message: string }[] }
  | { message: string }
  | {
      data: ResBodyData;
    };

export const getHandler: RequestHandler<unknown, ResBody> = async (
  req,
  res
) => {
  try {
    const userId = req.auth?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const parsedData = schema.parse(req.query);
    const { startDate, endDate } = parsedData;

    const query: Query = {
      bool: {
        must: [
          {
            term: {
              userId,
            },
          },
        ],
      },
    };

    if (startDate) {
      const formattedStartDate = `${startDate}T00:00:00.000Z`;

      query.bool.must.push({
        range: {
          clockIn: {
            gte: formattedStartDate,
          },
        },
      });
    }

    if (endDate) {
      const formattedEndDate = `${endDate}T23:59:59.000Z`;

      query.bool.must.push({
        range: {
          clockOut: {
            lte: formattedEndDate,
          },
        },
      });
    }

    const result = await elasticsearchClient.search<Attendance>({
      index: "attendances",
      body: {
        query,
      },
    });

    const results: ResBodyData = result.hits.hits
      .filter((hit) => hit._source)
      .map((hit) => {
        const source = hit._source;

        return {
          id: Number(hit._id),
          userId: source?.userId ?? 0,
          clockIn: source?.clockIn ?? "",
          clockOut: source?.clockOut ?? null,
          createdAt: source?.createdAt ?? "",
          updatedAt: source?.updatedAt ?? null,
        };
      });

    return res.status(200).json({
      data: results,
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
