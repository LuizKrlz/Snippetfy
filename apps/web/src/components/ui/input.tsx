import { useId } from "react";

import { Input, type InputProps as HeroInputProps } from "@heroui/react";

import { cn } from "../../lib/cn";
import { uiTheme } from "../../lib/ui-theme";

export interface AppInputProps extends Omit<HeroInputProps, "className"> {
  className?: string;
  label?: string;
  errorMessage?: string;
  hint?: string;
}

export function AppInput({
  className,
  errorMessage,
  hint,
  id,
  label,
  ...props
}: AppInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hasError = Boolean(errorMessage);

  return (
    <label className="grid gap-2" htmlFor={inputId}>
      {label ? (
        <span className={cn("text-sm font-medium", uiTheme.text.muted)}>
          {label}
        </span>
      ) : null}
      <Input
        className={cn(
          "w-full rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 text-slate-100 shadow-inner shadow-black/10 transition focus-within:border-emerald-400/60",
          hasError && "border-rose-500/50 focus-within:border-rose-400",
          className,
        )}
        fullWidth
        id={inputId}
        variant="secondary"
        {...props}
      />
      {errorMessage ? (
        <span className="text-sm text-rose-400">{errorMessage}</span>
      ) : hint ? (
        <span className={cn("text-sm", uiTheme.text.hint)}>{hint}</span>
      ) : null}
    </label>
  );
}
