'use client';

import { AlertCircle, Banknote, CheckCircle, Clock, Loader2 } from 'lucide-react';
import Link from 'next/link';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

import { useGetDriverStats } from '../api/use-get-driver-stats';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'red' | 'emerald';
  href?: string;
}

const colorVariants = {
  blue: 'text-blue-600 dark:text-blue-400',
  green: 'text-green-600 dark:text-green-400',
  red: 'text-red-600 dark:text-red-400',
  emerald: 'text-emerald-600 dark:text-emerald-400',
};

const bgVariants = {
  blue: 'bg-blue-50 dark:bg-blue-950/30',
  green: 'bg-green-50 dark:bg-green-950/30',
  red: 'bg-red-50 dark:bg-red-950/30',
  emerald: 'bg-emerald-50 dark:bg-emerald-950/30',
};

const StatCard = ({ label, value, icon, color, href }: StatCardProps) => {
  const content = (
    <Card className={cn('transition-all hover:shadow-md', bgVariants[color])}>
      <CardContent className="flex flex-col items-center justify-center p-3 text-center">
        <div className={cn('mb-1', colorVariants[color])}>{icon}</div>
        <span className={cn('text-xl font-bold', colorVariants[color])}>{value}</span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</span>
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
};


export const StatsDashboard = ({ date }: { date?: string }) => {
  const { data: stats, isLoading, isRefetching } = useGetDriverStats(date);

  if (isLoading) return <StatsSkeleton />;
  if (!stats) return null;

  const issueCount = (stats.cancelledOrders || 0) + (stats.rescheduledOrders || 0);
  const formattedCash = new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(stats.cashCollected || 0));

  return (
    <div className="relative">
      <div className="grid grid-cols-4 gap-2">
        <StatCard label="To Do" value={stats.pendingOrders || 0} icon={<Clock className="h-5 w-5" />} color="blue" />
        <StatCard label="Done" value={stats.completedOrders || 0} icon={<CheckCircle className="h-5 w-5" />} color="green" />
        <StatCard label="Issues" value={issueCount} icon={<AlertCircle className="h-5 w-5" />} color="red" />
        <StatCard label="Cash" value={formattedCash} icon={<Banknote className="h-5 w-5" />} color="emerald" href="/cash-handover" />
      </div>

      {/* Refresh indicator */}
      {isRefetching && (
        <div className="absolute -top-1 -right-1">
          <div className="rounded-full bg-primary/10 p-1">
            <Loader2 className="h-3 w-3 animate-spin text-primary" />
          </div>
        </div>
      )}
    </div>
  );
};

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-2">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-20 w-full rounded-lg" />
      ))}
    </div>
  );
}
