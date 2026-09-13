import type { ReactNode } from "react";
import { Button } from "./Button";
import { usePrimaryCtaRegistration } from "./PrimaryCtaScope";

type Props = {
  variant?: "primary" | "secondary";
  eyebrow: ReactNode;
  icon: ReactNode;
  title: string;
  subtitle?: string;
  body?: ReactNode;
  actionLabel: ReactNode;
  onAction?: () => void;
  footer?: ReactNode;
  extra?: ReactNode;
};

export function PrimaryActionCard({
  variant = "primary",
  eyebrow,
  icon,
  title,
  subtitle,
  body,
  actionLabel,
  onAction,
  footer,
  extra,
}: Props) {
  usePrimaryCtaRegistration(variant === "primary");

  return (
    <article className={`pac pac--${variant}`}>
      <div className="pac__eyebrow">{eyebrow}</div>
      <div className="pac__row">
        <div className="pac__icon">{icon}</div>
        <div className="pac__copy">
          <h3 className="pac__title">{title}</h3>
          {subtitle ? <p className="pac__subtitle">{subtitle}</p> : null}
          {body ? <div className="pac__body">{body}</div> : null}
        </div>
        {extra}
        <Button
          variant={variant === "primary" ? "primary" : "secondary"}
          size={variant === "primary" ? "lg" : "md"}
          registerPrimary={false}
          className="pac__cta"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      </div>
      {footer ? <div className="pac__footer">{footer}</div> : null}
    </article>
  );
}
