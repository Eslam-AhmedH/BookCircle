import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const Card = ({ children, className, ...props }: CardProps) => {
  return (
    <div
      className={cn(
        "rounded-xl bg-surface-container-high shadow-soft transition-all duration-300",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};
