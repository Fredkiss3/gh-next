"use client";
import * as React from "react";

// Components
import { Button } from "~/app/(components)/button";
import {
  AlertFillIcon,
  CheckIcon,
  StopIcon,
  XIcon,
} from "@primer/octicons-react";

// utils
import { clsx } from "~/lib/shared-utils";
import { PauseableTimeout } from "~/lib/pauseable-timeout";

// types
import type { SessionFlash } from "~/lib/session";

type ToastProps = {
  type?: SessionFlash["type"];
  duration?: number;
  children: React.ReactNode;
  keep?: boolean;
  dismissable?: boolean;
  className?: string;
  delay?: number;
};

export function Toast({
  children,
  duration = 1500,
  delay = 0,
  keep = false,
  type = "success",
  dismissable = false,
  className,
}: ToastProps) {
  const [removed, setRemoved] = React.useState(false);
  const [hidden, setHidden] = React.useState(false);
  const timer = React.useRef<PauseableTimeout | null>(null);

  React.useEffect(() => {
    timer.current = keep
      ? null
      : new PauseableTimeout(() => setRemoved(true), duration + delay);

    timer.current?.start();

    return () => {
      timer.current?.stop();
    };
  }, [keep, duration, delay]);

  function removeToast() {
    if (removed) {
      setHidden(true);
    }
  }

  return (
    <div
      className={clsx(
        className,
        "rounded-md text-foreground flex",
        "bg-background shadow-md transition",
        {
          hidden,
          "translate-x-[calc(100%+50px)]": removed,
        }
      )}
      // Remove toast after animation ends
      onTransitionEnd={removeToast}
      onMouseEnter={() => {
        if (!removed) {
          timer.current?.pause();
        }
      }}
      onMouseLeave={() => {
        if (!removed) {
          timer.current?.resume();
        }
      }}
    >
      <div
        className={clsx(
          "flex items-center justify-center w-12 text-white rounded-l-md",
          {
            "bg-success": type === "success",
            "bg-danger": type === "error",
            "bg-accent": type === "info",
            "bg-severe": type === "warning",
          }
        )}
      >
        {type === "success" && <CheckIcon className="h-4 w-4" />}
        {type === "info" && <StopIcon className="h-4 w-4" />}
        {type === "error" && <StopIcon className="h-4 w-4" />}
        {type === "warning" && <AlertFillIcon className="h-4 w-4" />}
      </div>
      <div className="flex p-4 border-neutral border-r border-b border-t rounded-r-md gap-2">
        <span>{children}</span>
        {dismissable && (
          <Button
            variant="invisible"
            isSquared
            onClick={() => setRemoved(true)}
            className="!border-0"
          >
            <XIcon className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
