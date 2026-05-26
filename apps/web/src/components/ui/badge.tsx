import type { ReactNode } from "react";

import { Chip, type ChipProps as HeroChipProps } from "@heroui/react";

import { cn } from "../../lib/cn";

export interface AppBadgeProps extends Omit<HeroChipProps, "children" | "className"> {
  className?: string;
  children: ReactNode;
}

export function AppBadge({ children, className, ...props }: AppBadgeProps) {
  return (
    <Chip
      className={cn("rounded-full border border-white/10 bg-white/8", className)}
      size="sm"
      variant="soft"
      {...props}
    >
      {children}
    </Chip>
  );
}
