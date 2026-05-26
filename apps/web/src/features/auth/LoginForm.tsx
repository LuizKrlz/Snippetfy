import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@snippetfy/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useForm } from "react-hook-form";

import { ApiClientError } from "../../lib/api-client.js";
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
    resolver: zodResolver(loginSchema),
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
    <div className="auth-page">
      <div className="auth-card">
        <h1>Sign in</h1>
        <p className="hint">Access your snippet library</p>

        <form
          className="auth-form"
          onSubmit={handleSubmit((data) => mutation.mutate(data))}
        >
          {errors.root && (
            <p className="form-error" role="alert">
              {errors.root.message}
            </p>
          )}

          <label>
            Email
            <input type="email" autoComplete="email" {...register("email")} />
            {errors.email && (
              <span className="field-error">{errors.email.message}</span>
            )}
          </label>

          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              {...register("password")}
            />
            {errors.password && (
              <span className="field-error">{errors.password.message}</span>
            )}
          </label>

          <button className="btn-primary" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="auth-footer">
          No account? <Link to="/signup">Create one</Link>
        </p>
      </div>
    </div>
  );
}
