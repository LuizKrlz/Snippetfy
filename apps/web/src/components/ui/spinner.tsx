import { Spinner, type SpinnerProps as HeroSpinnerProps } from "@heroui/react";

import { cn } from "../../lib/cn";

export interface AppSpinnerProps extends Omit<HeroSpinnerProps, "className"> {
  className?: string;
}

export function AppSpinner({ className, ...props }: AppSpinnerProps) {
  return (
    <Spinner
      className={cn("text-emerald-400", className)}
      size="sm"
      {...props}
    />
  );
}
