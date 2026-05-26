import type { ReactNode } from "react";

import { Alert, type AlertProps as HeroAlertProps } from "@heroui/react";

import { cn } from "../../lib/cn";

type AppAlertTone = "accent" | "success" | "warning" | "danger";

export interface AppAlertProps
  extends Omit<HeroAlertProps, "children" | "className" | "status"> {
  className?: string;
  title?: string;
  tone?: AppAlertTone;
  children: ReactNode;
}

export function AppAlert({
  children,
  className,
  title,
  tone = "danger",
  ...props
}: AppAlertProps) {
  return (
    <Alert
      className={cn("rounded-2xl border border-white/10 bg-white/6", className)}
      status={tone}
      {...props}
    >
      <Alert.Content className="gap-1">
        {title ? <Alert.Title className="font-medium">{title}</Alert.Title> : null}
        <Alert.Description>{children}</Alert.Description>
      </Alert.Content>
    </Alert>
  );
}
