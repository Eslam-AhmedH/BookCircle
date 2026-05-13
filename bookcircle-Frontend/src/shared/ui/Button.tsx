import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

type ButtonVariant = "primary" | "secondary" | "tertiary";
type ButtonSize = "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-br from-primary-container to-secondary-container text-on-primary-container shadow-ambient hover:scale-[1.02] active:scale-[0.98]",
  secondary:
    "bg-transparent text-primary border border-outline-variant/20 hover:bg-surface-container-high",
  tertiary: "bg-transparent text-on-surface-variant hover:text-on-surface",
};

const sizeClasses: Record<ButtonSize, string> = {
  md: "h-12 px-6 text-sm font-bold",
  lg: "h-14 px-8 text-base font-bold",
  icon: "h-10 w-10 p-0",
};

export const Button = ({
  children,
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) => {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};
