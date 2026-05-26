import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { config } from "dotenv";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

// Monorepo root .env (pnpm db:seed runs Prisma from apps/api)
config({ path: resolve(__dirname, "../../../.env") });
config({ path: resolve(__dirname, "../.env") });

const prisma = new PrismaClient();

const BCRYPT_ROUNDS = 12;
const DEV_EMAIL = "testeuser@mail.com";
const DEV_PASSWORD = "123456";

async function main() {
  const password = await bcrypt.hash(DEV_PASSWORD, BCRYPT_ROUNDS);

  await prisma.user.upsert({
    where: { email: DEV_EMAIL },
    update: {
      name: "Test User",
      password,
    },
    create: {
      name: "Test User",
      email: DEV_EMAIL,
      password,
    },
  });

  console.log(`Seeded dev user: ${DEV_EMAIL} / ${DEV_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
