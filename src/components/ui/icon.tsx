import type { SVGProps } from "react";

export type IconName =
  | "arrow-left"
  | "arrow-right"
  | "book"
  | "brain"
  | "check"
  | "chevron-right"
  | "clock"
  | "cloud"
  | "document"
  | "home"
  | "info"
  | "lock"
  | "logout"
  | "menu"
  | "play"
  | "progress"
  | "refresh"
  | "shield"
  | "sparkles"
  | "target"
  | "user"
  | "wifi-off"
  | "x";

const iconPaths: Record<IconName, React.ReactNode> = {
  "arrow-left": <path d="m15 18-6-6 6-6" />,
  "arrow-right": <path d="m9 18 6-6-6-6" />,
  book: (
    <>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
    </>
  ),
  brain: (
    <>
      <path d="M9.5 4.5A3 3 0 0 0 6 7.46V8a3 3 0 0 0-1 5.83V15a3 3 0 0 0 4.5 2.6" />
      <path d="M14.5 4.5A3 3 0 0 1 18 7.46V8a3 3 0 0 1 1 5.83V15a3 3 0 0 1-4.5 2.6" />
      <path d="M9.5 4.5a2.5 2.5lv0 15a2.5 2.5 0 0 0 5 0v-15a2.5 2.5 0 0 0-5 0Z" />
      <path d="M9.5 9H7.8M14.5 9h1.7M9.5 14H7.8M14.5 14h1.7" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  "chevron-right": <path d="m9 18 6-6-6-6" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  cloud: (
    <>
      <path d="M17.5 19H7a5 5 0 1 1 1.4-9.8A6 6 0 0 1 20 11.5 3.5 3.5 0 0 1 17.5 19Z" />
      <path d="m9 14 2 2 4-4" />
    </>
  ),
  document: (
    <>
      <path d="M6 2h9l4 4v16H6Z" />
      <path d="M14 2v5h5M9 12h6M9 16h6" />
    </>
  ),
  home: (
    <>
      <path d="m3 11 9-8 9 8" />
      <path d="M5 10v10h14V10M9 20v-6h6v6" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
  logout: (
    <>
      <path d="M10 17l5-5-5-5M15 12H3M21 19V5a2 2 0 0 0-2-2h-6" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  play: <path d="m9 7 8 5-8 5Z" />,
  progress: (
    <>
      <path d="M4 19V9M10 19V5M16 19v-7M22 19H2" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 11a8 8 0 1 0-2.34 5.66" />
      <path d="M20 5v6h-6" />
    </>
  ),
  shield: (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  sparkles: (
    <>
      <path d="m12 3-1 3.2A6 6 0 0 1 7.2 10L4 11l3.2 1a6 6 0 0 1 3.8 3.8l1 3.2 1-3.2a6 6 0 0 1 3.8-3.8l3.2-1-3.2-1A6 6 0 0 1 13 6.2Z" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  "wifi-off": (
    <>
      <path d="m2 2 20 20M8.5 8.5A10 10 0 0 1 21 10M3 10a14 14 0 0 1 2.5-1.7M6.5 14a8 8 0 0 1 6.5-2M18 14a8 8 0 0 0-1-.8M9.5 18a4 4 0 0 1 5 0M12 21h.01" />
    </>
  ),
  x: <path d="M18 6 6 18M6 6l12 12" />,
};

export function Icon({
  name,
  ...props
}: SVGProps<SVGSVGElement> & { name: IconName }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      width="24"
      {...props}
    >
      {iconPaths[name]}
    </svg>
  );
}
