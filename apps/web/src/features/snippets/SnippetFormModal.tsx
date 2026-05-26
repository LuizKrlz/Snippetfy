import { zodResolver } from "@hookform/resolvers/zod";
import { createSnippetSchema, type CreateSnippetInput } from "@snippetfy/shared";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { AppAlert, AppButton, AppInput, AppModal, AppTextarea } from "../../components/ui";

interface SnippetFormModalProps {
  title: string;
  submitLabel: string;
  isOpen: boolean;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  initialValues: CreateSnippetInput;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (values: CreateSnippetInput) => void;
}

export function SnippetFormModal({
  title,
  submitLabel,
  isOpen,
  isSubmitting = false,
  errorMessage,
  initialValues,
  onOpenChange,
  onSubmit,
}: SnippetFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateSnippetInput>({
    resolver: zodResolver(createSnippetSchema as never),
    defaultValues: initialValues,
  });

  useEffect(() => {
    if (isOpen) {
      reset(initialValues);
    }
  }, [initialValues, isOpen, reset]);

  return (
    <AppModal
      body={
        <form className="grid gap-4" id="snippet-form" onSubmit={handleSubmit(onSubmit)}>
          {errorMessage ? (
            <AppAlert tone="danger" title="Unable to save snippet">
              {errorMessage}
            </AppAlert>
          ) : null}
          <p className="text-sm text-slate-400">
            Use markdown for headings, links, lists, and fenced code blocks.
          </p>
          <AppInput
            autoFocus
            errorMessage={errors.title?.message}
            label="Snippet title"
            placeholder="Reusable fetch hook"
            {...register("title")}
          />
          <AppTextarea
            className="font-mono text-sm"
            errorMessage={errors.content?.message}
            hint="Markdown preview is available in the detail panel."
            label="Content"
            placeholder={"```ts\nexport function example() {}\n```"}
            rows={12}
            {...register("content")}
          />
        </form>
      }
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <AppButton intent="ghost" onClick={() => onOpenChange(false)} type="button">
            Cancel
          </AppButton>
          <AppButton form="snippet-form" isLoading={isSubmitting} type="submit">
            {isSubmitting ? "Saving..." : submitLabel}
          </AppButton>
        </div>
      }
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={title}
    />
  );
}
