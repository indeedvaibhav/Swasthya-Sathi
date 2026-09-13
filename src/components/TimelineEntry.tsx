import type { ReactNode } from "react";

type Props = {
  icon: ReactNode;
  title: string;
  detail?: string;
  time: string;
};

export function TimelineEntry({ icon, title, detail, time }: Props) {
  return (
    <article className="tl">
      <div className="tl__icon">{icon}</div>
      <div className="tl__body">
        <p className="tl__title">{title}</p>
        {detail ? <p className="tl__detail">{detail}</p> : null}
      </div>
      <time className="tl__time">{time}</time>
    </article>
  );
}
