import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function svg(props: IconProps) {
  return {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
    ...props,
  };
}

export function IconMic(p: IconProps) {
  return (
    <svg {...svg(p)}>
      <path d="M12 3a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v3" />
    </svg>
  );
}

export function IconPill(p: IconProps) {
  return (
    <svg {...svg(p)}>
      <rect x="3.5" y="8" width="17" height="8" rx="4" transform="rotate(-35 12 12)" />
      <path d="M8.5 9.5 15.5 14.5" />
    </svg>
  );
}

export function IconHeart(p: IconProps) {
  return (
    <svg {...svg(p)}>
      <path d="M19.5 9.5c0 4.5-7.5 10-7.5 10S4.5 14 4.5 9.5A3.8 3.8 0 0 1 12 7a3.8 3.8 0 0 1 7.5 2.5Z" />
    </svg>
  );
}

export function IconUsers(p: IconProps) {
  return (
    <svg {...svg(p)}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 19a6 6 0 0 1 12 0" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M21 19a5 5 0 0 0-4-4.9" />
    </svg>
  );
}

export function IconStethoscope(p: IconProps) {
  return (
    <svg {...svg(p)}>
      <path d="M6 4v6a4 4 0 0 0 8 0V4" />
      <path d="M6 4H5" />
      <path d="M14 4h1" />
      <path d="M18 12a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
      <path d="M14 14v1a4 4 0 0 0 4 4" />
    </svg>
  );
}

export function IconPhone(p: IconProps) {
  return (
    <svg {...svg(p)}>
      <path d="M7 3h3l1.5 4-2 1.5a12 12 0 0 0 6 6L17 13l4 1.5V18a2 2 0 0 1-2 2A16 16 0 0 1 4 7a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

export function IconCheck(p: IconProps) {
  return (
    <svg {...svg(p)}>
      <path d="M5 12.5 9.5 17 19 7.5" />
    </svg>
  );
}

export function IconClock(p: IconProps) {
  return (
    <svg {...svg(p)}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4.5l3 1.5" />
    </svg>
  );
}

export function IconPlusMed(p: IconProps) {
  return (
    <svg {...svg(p)}>
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

export function IconDroplet(p: IconProps) {
  return (
    <svg {...svg(p)}>
      <path d="M12 3s6 6.2 6 10.2A6 6 0 0 1 6 13.2C6 9.2 12 3 12 3Z" />
    </svg>
  );
}

export function IconPulse(p: IconProps) {
  return (
    <svg {...svg(p)}>
      <path d="M3 12h3l2.5-6 4 12 2.5-6H21" />
    </svg>
  );
}

export function IconAlert(p: IconProps) {
  return (
    <svg {...svg(p)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}

export function IconO2(p: IconProps) {
  return (
    <svg {...svg(p)}>
      <path d="M7 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M17 18a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path d="M9.2 12.5 13 10" />
    </svg>
  );
}

export function IconSpark(p: IconProps) {
  return (
    <svg {...svg(p)}>
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M6 6l2 2M16 16l2 2M18 6l-2 2M8 16l-2 2" />
    </svg>
  );
}

export function IconWalk(p: IconProps) {
  return (
    <svg {...svg(p)}>
      <circle cx="13" cy="5" r="2" />
      <path d="M8 21l3-7 3 2 3 5" />
      <path d="M9 12l2-3 4 1 2 3" />
    </svg>
  );
}

export function IconSend(p: IconProps) {
  return (
    <svg {...svg(p)}>
      <path d="M5 12h12" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

export function IconPlay(p: IconProps) {
  return (
    <svg {...svg({ ...p, fill: "currentColor", stroke: "none" })}>
      <path d="M8 6.5v11l9-5.5-9-5.5Z" />
    </svg>
  );
}

export function IconFile(p: IconProps) {
  return (
    <svg {...svg(p)}>
      <path d="M7 4h7l4 4v12H7V4Z" />
      <path d="M14 4v4h4" />
    </svg>
  );
}

export function IconPlus(p: IconProps) {
  return (
    <svg {...svg(p)}>
      <path d="M12 6v12M6 12h12" />
    </svg>
  );
}

export function IconMessage(p: IconProps) {
  return (
    <svg {...svg(p)}>
      <path d="M5 6h14v10H9l-4 3V6Z" />
    </svg>
  );
}

export function IconMark(p: IconProps) {
  return (
    <svg {...svg({ ...p, fill: "currentColor", stroke: "none" })}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <path d="M8 12h8M12 8v8" fill="none" stroke="#fff" strokeWidth="1.8" />
    </svg>
  );
}
