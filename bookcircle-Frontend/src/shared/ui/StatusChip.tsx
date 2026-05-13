import { cn } from "../lib/cn";

type Status = "Available" | "Borrowed" | "Pending" | "Accepted" | "Rejected";

interface StatusChipProps {
  status: Status;
  className?: string;
}

const statusStyles: Record<Status, string> = {
  Available: "bg-primary-fixed/15 text-primary-fixed",
  Borrowed: "bg-tertiary-container/25 text-on-tertiary-container",
  Pending: "bg-tertiary-container/20 text-tertiary",
  Accepted: "bg-primary-fixed/20 text-primary-fixed",
  Rejected: "bg-error/20 text-error",
};

export const StatusChip = ({ status, className }: StatusChipProps) => {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em]",
        statusStyles[status],
        className,
      )}
    >
      {status}
    </span>
  );
};
