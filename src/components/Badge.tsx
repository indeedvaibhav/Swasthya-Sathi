import type { ReactNode } from "react";

type Tone = "ok" | "warn" | "neutral" | "accent";

export function Badge({
  tone = "ok",
  children,
  className = "",
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return <span className={`badge badge--${tone} ${className}`.trim()}>{children}</span>;
}
