import type { ButtonHTMLAttributes, ReactNode } from "react";
import { usePrimaryCtaRegistration } from "./PrimaryCtaScope";

type Variant = "primary" | "secondary" | "ghost" | "sos" | "accent";
type Size = "md" | "sm" | "lg";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  registerPrimary?: boolean;
};

export function Button({
  variant = "secondary",
  size = "md",
  icon,
  registerPrimary = true,
  className = "",
  children,
  ...rest
}: Props) {
  usePrimaryCtaRegistration(registerPrimary && variant === "primary" && size === "md");

  return (
    <button
      type="button"
      className={`btn btn--${variant} btn--${size} ${className}`.trim()}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
