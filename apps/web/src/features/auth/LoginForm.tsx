import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@snippetfy/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useForm } from "react-hook-form";

import { ApiClientError } from "../../lib/api-client.js";
import { AppAlert, AppButton, AppInput, PageShell, SectionCard } from "../../components/ui";
import { login } from "./api.js";
import { authKeys } from "./queries.js";

function safeInternalPath(path?: string) {
  if (path && path.startsWith("/") && !path.startsWith("//")) {
    return path;
  }

  return "/library";
}

export function LoginForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const search = useSearch({ from: "/login" });

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema as never),
  });

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: authKeys.me });
      await navigate({ to: safeInternalPath(search.redirect) });
    },
    onError: (error) => {
      if (error instanceof ApiClientError) {
        if (error.body.code === "INVALID_CREDENTIALS") {
          setError("root", { message: "Invalid email or password" });
          return;
        }
        setError("root", { message: error.message });
      }
    },
  });

  return (
    <PageShell centered size="sm">
      <SectionCard
        className="max-w-md"
        description="Access your snippet library"
        title="Sign in"
      >
        <form
          className="grid gap-5"
          onSubmit={handleSubmit((data) => mutation.mutate(data))}
        >
          {errors.root && (
            <AppAlert tone="danger" title="Unable to sign in">
              {errors.root.message}
            </AppAlert>
          )}

          <AppInput
            autoComplete="email"
            errorMessage={errors.email?.message}
            label="Email"
            type="email"
            {...register("email")}
          />

          <AppInput
            autoComplete="current-password"
            errorMessage={errors.password?.message}
            label="Password"
            type="password"
            {...register("password")}
          />

          <AppButton className="w-full" isLoading={mutation.isPending} type="submit">
            {mutation.isPending ? "Signing in…" : "Sign in"}
          </AppButton>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          No account? <Link to="/signup">Create one</Link>
        </p>
      </SectionCard>
    </PageShell>
  );
}
