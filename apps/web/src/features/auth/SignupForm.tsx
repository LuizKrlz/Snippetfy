import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@snippetfy/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";

import { ApiClientError } from "../../lib/api-client.js";
import { register } from "./api.js";
import { authKeys } from "./queries.js";

export function SignupForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register: registerField,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const mutation = useMutation({
    mutationFn: register,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: authKeys.me });
      await navigate({ to: "/library" });
    },
    onError: (error) => {
      if (error instanceof ApiClientError) {
        if (error.body.code === "EMAIL_TAKEN") {
          setError("email", { message: "Email already registered" });
          return;
        }
        setError("root", { message: error.message });
      }
    },
  });

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create account</h1>
        <p className="hint">Start organizing your snippets</p>

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
            Name
            <input type="text" autoComplete="name" {...registerField("name")} />
            {errors.name && (
              <span className="field-error">{errors.name.message}</span>
            )}
          </label>

          <label>
            Email
            <input
              type="email"
              autoComplete="email"
              {...registerField("email")}
            />
            {errors.email && (
              <span className="field-error">{errors.email.message}</span>
            )}
          </label>

          <label>
            Password
            <input
              type="password"
              autoComplete="new-password"
              {...registerField("password")}
            />
            {errors.password && (
              <span className="field-error">{errors.password.message}</span>
            )}
          </label>

          <button className="btn-primary" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Creating…" : "Create account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
