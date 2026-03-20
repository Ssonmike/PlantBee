import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "green" | "yellow" | "red" | "gray" | "blue";
  size?: "sm" | "md";
  className?: string;
}

export default function Badge({
  children,
  variant = "gray",
  size = "sm",
  className,
}: BadgeProps) {
  const variants = {
    green: "bg-brand-100 text-brand-700",
    yellow: "bg-honey-100 text-honey-700",
    red: "bg-red-100 text-red-700",
    gray: "bg-gray-100 text-gray-700",
    blue: "bg-blue-100 text-blue-700",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-semibold",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}
