import type { ElementType } from "react";
import type { Bilingual } from "../types";

type Size = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";

type Props = Bilingual & {
  as?: ElementType;
  size?: Size;
  layout?: "stack" | "inline" | "slash" | "beside";
  tone?: "default" | "muted" | "brand";
  uppercaseSecondary?: boolean;
  className?: string;
};

export function BilingualText({
  primary,
  secondary,
  as: Tag = "span",
  size = "md",
  layout = "stack",
  tone = "default",
  uppercaseSecondary,
  className = "",
}: Props) {
  const caps =
    uppercaseSecondary === true ||
    (uppercaseSecondary !== false && layout === "inline" && size === "xs");
  return (
    <Tag
      className={`bi bi--${size} bi--${layout} bi--${tone}${caps ? " bi--caps" : ""} ${className}`.trim()}
    >
      <span className="bi__primary">{primary}</span>
      {secondary ? <span className="bi__secondary">{secondary}</span> : null}
    </Tag>
  );
}
