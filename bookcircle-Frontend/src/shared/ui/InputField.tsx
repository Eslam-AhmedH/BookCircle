import { useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
}

export const InputField = ({
  label,
  className,
  id,
  icon,
  ...props
}: InputFieldProps) => {
  const generatedId = useId();
  const customId = id ?? generatedId;

  return (
    <div className="flex w-full flex-col gap-2">
      {label ? (
        <label
          htmlFor={customId}
          className="px-1 text-label font-bold uppercase tracking-[0.18em] text-on-surface-variant"
        >
          {label}
        </label>
      ) : null}
      <div className="group relative">
        {icon ? (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-outline">
            {icon}
          </span>
        ) : null}
        <input
          id={customId}
          className={cn(
            "h-12 w-full rounded-lg bg-surface-container-lowest border border-outline-variant/20 px-4 text-on-surface placeholder:text-outline transition-all duration-200",
            "focus:border-primary focus:shadow-glow focus:outline-none focus:ring-0",
            icon ? "pl-11" : "",
            className,
          )}
          {...props}
        />
      </div>
    </div>
  );
};
