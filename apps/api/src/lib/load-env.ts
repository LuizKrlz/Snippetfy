import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { config } from "dotenv";

const currentDir = fileURLToPath(new URL(".", import.meta.url));

config({ path: resolve(currentDir, "../../../../.env") });
config({ path: resolve(currentDir, "../../.env") });
