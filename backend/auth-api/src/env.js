import dotenv from "dotenv";
import path from "node:path";
import { authApiRoot } from "./paths.js";

const envFile = process.env.AUTH_API_ENV_FILE || path.join(authApiRoot, ".env");

dotenv.config({ path: envFile });
