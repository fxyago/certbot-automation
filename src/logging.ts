import { env } from "bun";
import pino from "pino";
import pretty from "pino-pretty";

export const log = pino(
  {
    level: env.LOG_LEVEL ?? "info",
  },
  pretty()
);
