import { cn } from "../lib/cn";

const Pulse = ({ className }: { className: string }) => (
  <div className={cn("animate-pulse rounded bg-white/[0.06]", className)} />
);

interface SkeletonCardProps {
  className?: string;
}

export const SkeletonCard = ({ className }: SkeletonCardProps) => (
  <div className={cn("flex flex-col gap-4", className)}>
    <Pulse className="aspect-[3/4] w-full rounded-lg" />
    <div className="space-y-2 px-1">
      <Pulse className="h-3 w-1/3" />
      <Pulse className="h-4 w-full" />
      <Pulse className="h-4 w-4/5" />
      <div className="flex items-center justify-between pt-1">
        <Pulse className="h-3 w-1/4" />
        <Pulse className="h-7 w-7 rounded-full" />
      </div>
    </div>
  </div>
);

export const SkeletonRow = ({ className }: { className?: string }) => (
  <div
    className={cn(
      "flex items-center gap-4 rounded-xl bg-surface-container-low p-4",
      className,
    )}
  >
    <Pulse className="h-10 w-10 flex-shrink-0 rounded-full" />
    <div className="flex flex-1 flex-col gap-2">
      <Pulse className="h-4 w-1/3" />
      <Pulse className="h-3 w-1/2" />
    </div>
    <Pulse className="h-8 w-20 rounded-lg" />
  </div>
);

export const SkeletonText = ({
  lines = 3,
  className,
}: {
  lines?: number
  className?: string
}) => (
  <div className={cn('space-y-2', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Pulse
        key={i}
        className={cn('h-4', i === lines - 1 ? 'w-2/3' : 'w-full')}
      />
    ))}
  </div>
)

export const SkeletonBookDetail = () => (
  <div className="grid grid-cols-1 gap-12 py-8 lg:grid-cols-12">
    <div className="lg:col-span-5">
      <Pulse className="aspect-[3/4] w-full rounded-xl" />
      <div className="mt-6 flex justify-center gap-4">
        <Pulse className="h-12 w-28 rounded-full" />
        <Pulse className="h-12 w-24 rounded-full" />
      </div>
    </div>
    <div className="space-y-8 lg:col-span-7">
      <div className="space-y-4">
        <div className="flex gap-3">
          <Pulse className="h-6 w-24 rounded-full" />
          <Pulse className="h-6 w-20 rounded-full" />
        </div>
        <Pulse className="h-12 w-3/4 rounded" />
        <Pulse className="h-12 w-1/2 rounded" />
        <SkeletonText lines={4} />
      </div>
      <Pulse className="h-48 w-full rounded-2xl" />
      <div className="flex gap-4">
        <Pulse className="h-14 flex-1 rounded-lg" />
        <Pulse className="h-14 w-40 rounded-lg" />
        <Pulse className="h-14 w-14 rounded-lg" />
      </div>
    </div>
  </div>
);
