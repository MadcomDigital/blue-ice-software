'use client';

import { format, startOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Suspense, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetDriverLedger } from '@/features/driver-view/api/use-get-driver-ledger';

type DateRange = 'today' | 'week' | 'month';

function HistoryContent() {
  const [dateRange, setDateRange] = useState<DateRange>('week');
  const { data: ledgerData, isLoading } = useGetDriverLedger();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-9 w-20" />
          ))}
        </div>
        <Skeleton className="h-24" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </div>
    );
  }

  // Calculate date range boundaries
  const today = new Date();
  let startDate: Date;
  let endDate = today;

  switch (dateRange) {
    case 'today':
      startDate = today;
      break;
    case 'week':
      startDate = startOfWeek(today, { weekStartsOn: 1 });
      break;
    case 'month':
      startDate = startOfMonth(today);
      endDate = endOfMonth(today);
      break;
    default:
      startDate = startOfWeek(today, { weekStartsOn: 1 });
  }

  // Get transactions from ledger data
  const transactions = ledgerData?.transactions || [];

  // Filter ledger entries by date range
  const filteredEntries = transactions.filter((entry: any) => {
    const entryDate = new Date(entry.createdAt);
    return entryDate >= startDate && entryDate <= endDate;
  });

  // Calculate summary
  const totalCredits = filteredEntries
    .filter((e: any) => parseFloat(e.amount) > 0)
    .reduce((sum: number, e: any) => sum + parseFloat(e.amount), 0);

  const totalDebits = filteredEntries
    .filter((e: any) => parseFloat(e.amount) < 0)
    .reduce((sum: number, e: any) => sum + Math.abs(parseFloat(e.amount)), 0);

  const netAmount = totalCredits - totalDebits;

  return (
    <div className="space-y-6">
      {/* Header with Back */}
      <div className="flex items-center gap-4">
        <Link href="/financials">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">Financial History</h1>
          <p className="text-sm text-muted-foreground">Your transaction records</p>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="flex gap-2">
        <Button
          variant={dateRange === 'today' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setDateRange('today')}
        >
          Today
        </Button>
        <Button
          variant={dateRange === 'week' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setDateRange('week')}
        >
          This Week
        </Button>
        <Button
          variant={dateRange === 'month' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setDateRange('month')}
        >
          This Month
        </Button>
      </div>

      {/* Period Summary */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {totalCredits.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Collected</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {totalDebits.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Expenses</p>
            </div>
            <div>
              <p className={`text-2xl font-bold ${netAmount >= 0 ? 'text-primary' : 'text-destructive'}`}>
                {netAmount.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Net</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction List */}
      <div className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground">Transactions</h2>
        {filteredEntries.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No transactions in this period
            </CardContent>
          </Card>
        ) : (
          filteredEntries.map((entry: any) => {
            const amount = parseFloat(entry.amount);
            const isCredit = amount > 0;

            return (
              <Card key={entry.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{entry.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(entry.createdAt), 'dd MMM, h:mm a')}
                      </p>
                    </div>
                    <div className={`text-right ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                      <p className="font-bold">
                        {isCredit ? '+' : '-'} PKR {Math.abs(amount).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Bal: {parseFloat(entry.balanceAfter).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function FinancialHistoryPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-24" />
        </div>
      }
    >
      <HistoryContent />
    </Suspense>
  );
}
