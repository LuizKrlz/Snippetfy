import type { ReactNode } from "react";

import { Modal } from "@heroui/react";

import { cn } from "../../lib/cn";
import { uiTheme } from "../../lib/ui-theme";

interface AppModalProps {
  body: ReactNode;
  footer?: ReactNode;
  state?: unknown;
  title?: ReactNode;
}

export function AppModal({
  body,
  footer,
  state,
  title,
}: AppModalProps) {
  return (
    <Modal state={state as never}>
      <Modal.Container>
        <Modal.Dialog className={cn(uiTheme.surface.elevated, uiTheme.radius.lg)}>
          {title ? (
            <Modal.Header className="px-6 pt-6">
              <Modal.Heading className={cn("text-xl font-semibold", uiTheme.text.title)}>
                {title}
              </Modal.Heading>
            </Modal.Header>
          ) : null}
          <Modal.Body className="px-6 py-6">{body}</Modal.Body>
          {footer ? <Modal.Footer className="px-6 pb-6">{footer}</Modal.Footer> : null}
        </Modal.Dialog>
      </Modal.Container>
    </Modal>
  );
}
