import type { RequestHandler } from "express";
import { redisClient } from "../../utils/redis";

type ResBody = { message: string };

export const postHandler: RequestHandler<unknown, ResBody> = async (
  req,
  res
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }

  try {
    const exp = req.auth?.exp;
    if (!exp) {
      return res
        .status(400)
        .json({ message: "Invalid token, expiration missing" });
    }

    await redisClient.setEx(
      `blacklist:${token}`,
      exp - Math.floor(Date.now() / 1000),
      token
    );

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to process the logout" });
  }
};
