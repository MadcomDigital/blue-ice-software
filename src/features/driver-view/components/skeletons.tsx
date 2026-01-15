import { Skeleton } from '@/components/ui/skeleton';

export const StatsSkeleton = () => (
  <div className="grid grid-cols-4 gap-2">
    {[...Array(4)].map((_, i) => (
      <Skeleton key={i} className="h-20 w-full rounded-lg" />
    ))}
  </div>
);

export const OrderCardSkeleton = () => (
  <div className="rounded-lg border bg-card p-4">
    <div className="mb-3 flex items-start justify-between">
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-6 w-16" />
    </div>
    <Skeleton className="mb-2 h-4 w-32" />
    <Skeleton className="mb-2 h-4 w-48" />
    <Skeleton className="h-4 w-40" />
    <div className="mt-4 flex gap-2">
      <Skeleton className="h-10 w-20" />
      <Skeleton className="h-10 w-20" />
      <Skeleton className="h-10 flex-1" />
    </div>
  </div>
);

export const OrderListSkeleton = () => (
  <div className="space-y-3">
    {[...Array(3)].map((_, i) => (
      <OrderCardSkeleton key={i} />
    ))}
  </div>
);

export const FinancialSummarySkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-48" />
    <div className="grid grid-cols-2 gap-3">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-lg" />
      ))}
    </div>
    <Skeleton className="h-32 rounded-lg" />
    <Skeleton className="h-14 rounded-lg" />
  </div>
);

export const DateSelectorSkeleton = () => (
  <div className="flex gap-2">
    <Skeleton className="h-9 w-16" />
    <Skeleton className="h-9 w-20" />
    <Skeleton className="h-9 w-24" />
  </div>
);
