import type { ReactNode } from "react";

import { cn } from "../../lib/cn";
import { uiTheme } from "../../lib/ui-theme";

type ShellSize = "sm" | "md" | "lg" | "xl";

const maxWidthClass: Record<ShellSize, string> = {
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-6xl",
};

interface PageShellProps {
  children: ReactNode;
  centered?: boolean;
  className?: string;
  size?: ShellSize;
}

export function PageShell({
  children,
  centered = false,
  className,
  size = "lg",
}: PageShellProps) {
  return (
    <main
      className={cn(
        uiTheme.layout.container,
        maxWidthClass[size],
        centered
          ? "flex min-h-screen items-center justify-center py-10"
          : "min-h-screen py-8 sm:py-12",
        className,
      )}
    >
      {children}
    </main>
  );
}
