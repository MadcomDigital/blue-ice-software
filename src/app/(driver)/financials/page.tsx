'use client';

import { Banknote, CreditCard, History, Receipt, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDriverDaySummary } from '@/features/cash-management/api/use-driver-day-summary';
import { ExpenseForm } from '@/features/expenses/components/expense-form';

interface CollectionCardProps {
  icon: React.ReactNode;
  label: string;
  amount: number | string;
  count: number;
  color: 'green' | 'blue' | 'amber' | 'purple';
}

const colorVariants = {
  green: {
    bg: 'bg-green-50 dark:bg-green-950/30',
    text: 'text-green-600 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800',
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800',
  },
};

const CollectionCard = ({ icon, label, amount, count, color }: CollectionCardProps) => {
  const colors = colorVariants[color];
  const formattedAmount = typeof amount === 'number' ? amount.toLocaleString() : amount;

  return (
    <Card className={`${colors.bg} ${colors.border}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className={`text-xs font-medium ${colors.text}`}>{label}</p>
            <p className={`text-xl font-bold mt-1 ${colors.text}`}>PKR {formattedAmount}</p>
            <p className="text-xs text-muted-foreground mt-1">{count} orders</p>
          </div>
          <div className={colors.text}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
};

function FinancialsContent() {
  const router = useRouter();
  const { data: summary, isLoading } = useDriverDaySummary();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-32" />
        <Skeleton className="h-14" />
      </div>
    );
  }

  const cashCollected = parseFloat(summary?.grossCash || '0');
  const expenses = parseFloat(summary?.expensesAmount || '0');
  const netCash = parseFloat(summary?.expectedCash || '0');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Today's Money</h1>
          <p className="text-sm text-muted-foreground">Financial summary for today</p>
        </div>
        <ExpenseForm />
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-2 gap-3">
        <CollectionCard
          icon={<Banknote className="h-5 w-5" />}
          label="Cash"
          amount={cashCollected}
          count={Array.isArray(summary?.cashOrders) ? summary.cashOrders.length : 0}
          color="green"
        />
        <CollectionCard
          icon={<CreditCard className="h-5 w-5" />}
          label="Online"
          amount={0}
          count={0}
          color="blue"
        />
        <CollectionCard
          icon={<Wallet className="h-5 w-5" />}
          label="Credit"
          amount={0}
          count={0}
          color="amber"
        />
        <CollectionCard
          icon={<Receipt className="h-5 w-5" />}
          label="Prepaid"
          amount={0}
          count={0}
          color="purple"
        />
      </div>

      {/* Expenses Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                - PKR {expenses.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                expenses today
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Net Cash Card */}
      <Card className="bg-primary text-primary-foreground">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-sm opacity-80">Net Cash to Handover</p>
            <p className="text-3xl font-bold mt-1">
              PKR {netCash.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs opacity-70 mt-2">Cash Collected - Approved Expenses</p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button className="w-full h-14" onClick={() => router.push('/cash-handover')}>
          <Banknote className="mr-2 h-5 w-5" />
          Submit Cash Handover
        </Button>

        <Link href="/financials/history" className="block">
          <Button variant="outline" className="w-full">
            <History className="mr-2 h-4 w-4" />
            View History
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function FinancialsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </div>
      }
    >
      <FinancialsContent />
    </Suspense>
  );
}
