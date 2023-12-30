require("dotenv").config();
import { Redis } from "ioredis";

const redisClient = () => {
  if (process.env.REDIS_URL) {
    console.log("Redies connented");
    return process.env.REDIS_URL;
  }
  throw new Error("Redies connection failed");
};

export const redis = new Redis(redisClient());
