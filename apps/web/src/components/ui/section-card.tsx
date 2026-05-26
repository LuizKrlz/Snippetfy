import type { ReactNode } from "react";

import { cn } from "../../lib/cn";

import { AppCard } from "./card";

interface SectionCardProps {
  children: ReactNode;
  className?: string;
  description?: ReactNode;
  footer?: ReactNode;
  title?: ReactNode;
}

export function SectionCard({
  children,
  className,
  description,
  footer,
  title,
}: SectionCardProps) {
  return (
    <AppCard
      className={cn("w-full", className)}
      description={description}
      footer={footer}
      title={title}
    >
      {children}
    </AppCard>
  );
}
