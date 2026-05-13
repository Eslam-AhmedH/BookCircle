import { cn } from "../lib/cn";

interface SectionHeaderProps {
  label?: string;
  title: string;
  description?: string;
  className?: string;
}

export const SectionHeader = ({
  label,
  title,
  description,
  className,
}: SectionHeaderProps) => {
  return (
    <div className={cn("space-y-3", className)}>
      {label ? (
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80">
          {label}
        </p>
      ) : null}
      <h1 className="text-4xl font-extrabold tracking-tight text-on-surface md:text-5xl">
        {title}
      </h1>
      {description ? (
        <p className="max-w-2xl text-body text-on-surface-variant">
          {description}
        </p>
      ) : null}
    </div>
  );
};
