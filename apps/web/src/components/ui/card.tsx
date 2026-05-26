import type { ReactNode } from "react";

import { Card, type CardProps as HeroCardProps } from "@heroui/react";

import { cn } from "../../lib/cn";
import { uiTheme } from "../../lib/ui-theme";

export interface AppCardProps extends Omit<HeroCardProps, "children" | "className"> {
  className?: string;
  title?: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
}

export function AppCard({
  children,
  className,
  description,
  footer,
  title,
  ...props
}: AppCardProps) {
  return (
    <Card
      className={cn(uiTheme.surface.card, uiTheme.radius.lg, className)}
      {...props}
    >
      {title || description ? (
        <Card.Header className="flex flex-col items-start gap-2 px-6 pt-6">
          {title ? (
            <Card.Title className={cn("text-2xl", uiTheme.text.title)}>
              {title}
            </Card.Title>
          ) : null}
          {description ? (
            <Card.Description className={uiTheme.text.muted}>
              {description}
            </Card.Description>
          ) : null}
        </Card.Header>
      ) : null}
      <Card.Content className="px-6 py-6">{children}</Card.Content>
      {footer ? <Card.Footer className="px-6 pb-6">{footer}</Card.Footer> : null}
    </Card>
  );
}
