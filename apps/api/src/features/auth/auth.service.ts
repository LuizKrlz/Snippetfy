import type { LoginInput, RegisterInput, UserPublic } from "@snippetfy/shared";
import bcrypt from "bcryptjs";
import { sign } from "hono/jwt";

import { ApiError } from "../../lib/api-error.js";
import { env, parseExpiresInSeconds } from "../../lib/env.js";
import { prisma } from "../../lib/prisma.js";
import type { AuthUser, JwtPayload } from "./auth.types.js";

const BCRYPT_ROUNDS = 12;

export function toPublicUser(user: {
  id: number;
  name: string | null;
  email: string;
}): UserPublic {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

export async function createToken(user: AuthUser): Promise<string> {
  const exp =
    Math.floor(Date.now() / 1000) +
    parseExpiresInSeconds(env.jwtExpiresIn);

  const payload: JwtPayload = {
    sub: user.id,
    email: user.email,
    exp,
  };

  return sign(payload, env.jwtSecret(), "HS256");
}

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existing) {
    throw new ApiError(409, "Email already registered", "EMAIL_TAKEN");
  }

  const password = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password,
    },
  });

  return toPublicUser(user);
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw new ApiError(401, "Invalid email or password", "INVALID_CREDENTIALS");
  }

  const valid = await bcrypt.compare(input.password, user.password);

  if (!valid) {
    throw new ApiError(401, "Invalid email or password", "INVALID_CREDENTIALS");
  }

  return toPublicUser(user);
}

export async function findUserById(id: number) {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    return null;
  }

  return toPublicUser(user);
}
