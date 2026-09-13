import type { ReactNode } from "react";
import { BilingualText } from "./BilingualText";
import { Badge } from "./Badge";
import type { Bilingual } from "../types";

type Props = {
  icon?: ReactNode;
  iconTone?: "primary" | "accent";
  label: Bilingual;
  status?: Bilingual;
  statusTone?: "ok" | "warn" | "neutral";
  value: string;
  unit?: string;
  caption?: Bilingual;
  layout?: "compact" | "detailed" | "mini";
  footer?: ReactNode;
};

export function VitalStat({
  icon,
  iconTone = "primary",
  label,
  status,
  statusTone = "ok",
  value,
  unit,
  caption,
  layout = "compact",
  footer,
}: Props) {
  return (
    <article className={`vital vital--${layout}`} data-icon-tone={iconTone}>
      <header className="vital__head">
        <div className="vital__label-row">
          {icon ? <span className="vital__icon-box">{icon}</span> : null}
          <BilingualText
            primary={label.primary}
            secondary={label.secondary}
            size="xs"
            layout="stack"
            tone="muted"
            uppercaseSecondary={layout === "compact"}
          />
        </div>
        {status ? (
          <Badge tone={statusTone}>
            <BilingualText
              primary={status.primary}
              secondary={status.secondary}
              size="xs"
              layout="slash"
              uppercaseSecondary={false}
            />
          </Badge>
        ) : null}
      </header>
      <p className="vital__value">
        <span>{value}</span>
        {unit ? <span className="vital__unit">{unit}</span> : null}
      </p>
      {caption ? (
        <BilingualText
          primary={caption.primary}
          secondary={caption.secondary}
          size="xs"
          layout="slash"
          tone="muted"
          className="vital__caption"
        />
      ) : null}
      {footer}
    </article>
  );
}
