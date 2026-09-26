import type { ReactNode } from "react";

export type AppIconName =
  | "dashboard" | "course" | "payment" | "settings" | "logout" | "admin" | "home" | "lock" | "check"
  | "video" | "audio" | "text" | "quiz" | "exam" | "menu" | "close" | "chevron" | "target" | "layers" | "help" | "arrow" | "bookmark" | "chat" | "mic";

const PATHS: Record<AppIconName, ReactNode> = {
  mic: (
    <>
      <rect x="9" y="3.5" width="6" height="11" rx="3" />
      <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v2.5M9 20.5h6" />
    </>
  ),
  dashboard: (
    <>
      <rect x="3.5" y="3.5" width="7" height="8" rx="1.8" />
      <rect x="13.5" y="3.5" width="7" height="5" rx="1.8" />
      <rect x="13.5" y="11.5" width="7" height="9" rx="1.8" />
      <rect x="3.5" y="14.5" width="7" height="6" rx="1.8" />
    </>
  ),
  course: <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v15H5.5A1.5 1.5 0 0 0 4 20.5zM20 5.5A1.5 1.5 0 0 0 18.5 4H13v15h5.5a1.5 1.5 0 0 1 1.5 1.5z" />,
  payment: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2.4" />
      <path d="M3 10h18M7 14.5h4" />
    </>
  ),
  settings: (
    <>
      <path d="M4 7h8M18 7h2M4 17h2M12 17h8" />
      <circle cx="15" cy="7" r="2.2" />
      <circle cx="9" cy="17" r="2.2" />
    </>
  ),
  logout: <path d="M9 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20H9M16 8l4 4-4 4M20 12H9" />,
  admin: <path d="M12 3l7 3v5.2c0 4.4-2.9 7.9-7 9.8-4.1-1.9-7-5.4-7-9.8V6z" />,
  home: <path d="M4 11l8-7 8 7M6 9.5V20h4.5v-5.5h3V20H18V9.5" />,
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="9.5" rx="2.2" />
      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  video: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M10.2 8.9v6.2l5-3.1z" />
    </>
  ),
  audio: <path d="M4 12v0M7.5 8v8M11 5v14M14.5 8.5v7M18 10.5v3M20.5 12v0" />,
  text: <path d="M6 3.5h8l4 4V20a.5.5 0 0 1-.5.5h-11A.5.5 0 0 1 6 20zM14 3.5V8h4M9 12.5h6M9 16h6" />,
  quiz: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.6 9.6a2.5 2.5 0 1 1 3.4 2.3c-.7.3-1 .8-1 1.5M12 16.6v.1" />
    </>
  ),
  exam: (
    <>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l3 2M9.5 2.5h5" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  chevron: <path d="M9 6l6 6-6 6" />,
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="0.8" />
    </>
  ),
  layers: <path d="M12 3.5l9 4.8-9 4.8-9-4.8zM3 12.3l9 4.8 9-4.8M3 16.3l9 4.8 9-4.8" />,
  help: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.6 9.6a2.5 2.5 0 1 1 3.4 2.3c-.7.3-1 .8-1 1.5M12 16.6v.1" />
    </>
  ),
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  bookmark: <path d="M7 4h10a1 1 0 0 1 1 1v15l-6-4-6 4V5a1 1 0 0 1 1-1z" />,
  chat: <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H11l-4.5 4v-4H6.5A2.5 2.5 0 0 1 4 13.5z" />,
};

export default function AppIcon({ name, size = 20 }: { name: AppIconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flex: "none" }}
    >
      {PATHS[name]}
    </svg>
  );
}
