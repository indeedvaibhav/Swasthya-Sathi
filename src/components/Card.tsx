import type { HTMLAttributes, ReactNode } from "react";

type Props = HTMLAttributes<HTMLElement> & {
  as?: "div" | "section" | "article";
  padding?: "md" | "lg" | "none";
  children: ReactNode;
};

export function Card({
  as: Tag = "div",
  padding = "lg",
  className = "",
  children,
  ...rest
}: Props) {
  return (
    <Tag className={`card card--pad-${padding} ${className}`.trim()} {...rest}>
      {children}
    </Tag>
  );
}
