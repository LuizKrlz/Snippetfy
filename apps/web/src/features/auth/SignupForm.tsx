import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@snippetfy/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";

import { ApiClientError } from "../../lib/api-client.js";
import { AppAlert, AppButton, AppInput, PageShell, SectionCard } from "../../components/ui";
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
    resolver: zodResolver(registerSchema as never),
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
    <PageShell centered size="sm">
      <SectionCard
        className="max-w-md"
        description="Start organizing your snippets"
        title="Create account"
      >
        <form
          className="grid gap-5"
          onSubmit={handleSubmit((data) => mutation.mutate(data))}
        >
          {errors.root && (
            <AppAlert tone="danger" title="Unable to create account">
              {errors.root.message}
            </AppAlert>
          )}

          <AppInput
            autoComplete="name"
            errorMessage={errors.name?.message}
            label="Name"
            type="text"
            {...registerField("name")}
          />

          <AppInput
            autoComplete="email"
            errorMessage={errors.email?.message}
            label="Email"
            type="email"
            {...registerField("email")}
          />

          <AppInput
            autoComplete="new-password"
            errorMessage={errors.password?.message}
            label="Password"
            type="password"
            {...registerField("password")}
          />

          <AppButton className="w-full" isLoading={mutation.isPending} type="submit">
            {mutation.isPending ? "Creating…" : "Create account"}
          </AppButton>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </SectionCard>
    </PageShell>
  );
}
