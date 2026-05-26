import { Toast, toast } from "@heroui/react";

export function AppToastRegion() {
  return <Toast.Provider />;
}

export const appToast = {
  danger(message: string, description?: string) {
    return toast.danger(message, description ? { description } : undefined);
  },
  info(message: string, description?: string) {
    return toast.info(message, description ? { description } : undefined);
  },
  success(message: string, description?: string) {
    return toast.success(message, description ? { description } : undefined);
  },
};
