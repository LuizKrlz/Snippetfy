import type { ReactNode } from "react";

import { Button, Spinner, type ButtonProps as HeroButtonProps } from "@heroui/react";

import { cn } from "../../lib/cn";
import { uiTheme } from "../../lib/ui-theme";

type AppButtonIntent = "primary" | "secondary" | "ghost" | "danger";

export interface AppButtonProps
  extends Omit<HeroButtonProps, "children" | "className"> {
  children?: ReactNode;
  className?: string;
  intent?: AppButtonIntent;
  isLoading?: boolean;
}

const intentClassName: Record<AppButtonIntent, string> = {
  primary: uiTheme.accent.primary,
  secondary:
    "bg-white/8 text-slate-100 hover:bg-white/12 data-[hovered=true]:bg-white/12",
  ghost: uiTheme.accent.ghost,
  danger: uiTheme.accent.danger,
};

export function AppButton({
  children,
  className,
  intent = "primary",
  isDisabled,
  isLoading = false,
  ...props
}: AppButtonProps) {
  return (
    <Button
      className={cn(
        "h-11 rounded-2xl px-4 font-medium transition-transform duration-150 data-[pressed=true]:scale-[0.98]",
        intentClassName[intent],
        className,
      )}
      isDisabled={isDisabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <Spinner size="sm" className="text-current" />
          {children}
        </span>
      ) : (
        children
      )}
    </Button>
  );
}
