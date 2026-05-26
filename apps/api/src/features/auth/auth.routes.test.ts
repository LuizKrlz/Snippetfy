/**
 * Smoke assertions for Phase 1 auth module exports.
 * Run: pnpm --filter @snippetfy/api exec tsx --test src/features/auth/auth.routes.test.ts
 */
import assert from "node:assert/strict";
import { test } from "node:test";

import { registerSchema, loginSchema } from "@snippetfy/shared";

test("registerSchema rejects short password", () => {
  const result = registerSchema.safeParse({
    name: "Test",
    email: "a@b.com",
    password: "123",
  });
  assert.equal(result.success, false);
});

test("loginSchema accepts valid payload", () => {
  const result = loginSchema.safeParse({
    email: "test@example.com",
    password: "secret",
  });
  assert.equal(result.success, true);
});
