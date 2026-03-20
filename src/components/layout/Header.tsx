import Link from "next/link";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  backHref?: string;
  action?: React.ReactNode;
  className?: string;
  transparent?: boolean;
}

export default function Header({
  title,
  subtitle,
  showBack = false,
  backHref = "/",
  action,
  className,
  transparent = false,
}: HeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 px-4 py-3",
        !transparent && "glass border-b border-gray-100/80",
        className
      )}
    >
      <div className="max-w-lg mx-auto flex items-center gap-3">
        {showBack && (
          <Link
            href={backHref}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors flex-shrink-0"
          >
            <svg
              className="w-5 h-5 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
        )}

        <div className="flex-1 min-w-0">
          {title && (
            <h1 className="text-lg font-bold text-gray-900 truncate leading-tight">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-sm text-gray-500 truncate leading-tight">{subtitle}</p>
          )}
        </div>

        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </header>
  );
}
