import { Hono } from "hono";
import type { AppBindings } from "../lib/types/types";

export const authRouter = new Hono<AppBindings>();
