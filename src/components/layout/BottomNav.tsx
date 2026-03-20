"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/dashboard",
    label: "Inicio",
    icon: (active: boolean) => (
      <svg
        className={cn("w-6 h-6", active ? "text-brand-600" : "text-gray-400")}
        fill={active ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={active ? 0 : 1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    href: "/garden",
    label: "Mi Jardín",
    icon: (active: boolean) => (
      <svg
        className={cn("w-6 h-6", active ? "text-brand-600" : "text-gray-400")}
        fill={active ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={active ? 0 : 1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
  },
  {
    href: "/scan",
    label: "Escanear",
    icon: (_active: boolean) => (
      <div className="w-14 h-14 -mt-5 gradient-brand rounded-2xl flex items-center justify-center shadow-lg shadow-brand-300/50">
        <svg
          className="w-7 h-7 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </div>
    ),
  },
  {
    href: "/calendar",
    label: "Calendario",
    icon: (active: boolean) => (
      <svg
        className={cn("w-6 h-6", active ? "text-brand-600" : "text-gray-400")}
        fill={active ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={active ? 0 : 1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "Perfil",
    icon: (active: boolean) => (
      <svg
        className={cn("w-6 h-6", active ? "text-brand-600" : "text-gray-400")}
        fill={active ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={active ? 0 : 1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-gray-100"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="max-w-lg mx-auto flex items-end justify-around px-2 h-16">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 py-1 rounded-xl transition-all duration-150",
                item.href === "/scan" ? "relative" : ""
              )}
            >
              {item.icon(isActive)}
              {item.href !== "/scan" && (
                <span
                  className={cn(
                    "text-[10px] font-semibold transition-colors",
                    isActive ? "text-brand-600" : "text-gray-400"
                  )}
                >
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
