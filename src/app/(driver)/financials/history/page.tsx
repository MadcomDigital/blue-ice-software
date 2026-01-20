'use client';

import { format, startOfWeek, startOfMonth, endOfMonth, subDays } from 'date-fns';
import { ArrowLeft, Banknote, Calendar, CheckCircle, Clock, FileText, Receipt, XCircle } from 'lucide-react';
import Link from 'next/link';
import { Suspense, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useDriverFinancialHistory } from '@/features/cash-management/api/use-driver-financial-history';

type DateRange = 'today' | 'week' | 'month' | 'custom';

function HistoryContent() {
  const [dateRange, setDateRange] = useState<DateRange>('month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

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
    case 'custom':
      startDate = customStartDate ? new Date(customStartDate) : subDays(today, 30);
      endDate = customEndDate ? new Date(customEndDate) : today;
      break;
    default:
      startDate = startOfMonth(today);
  }

  const { data: historyData, isLoading } = useDriverFinancialHistory({
    startDate: format(startDate, 'yyyy-MM-dd'),
    endDate: format(endDate, 'yyyy-MM-dd'),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => (
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

  const summary = historyData?.summary;
  const events = historyData?.events || [];

  const totalCollected = parseFloat(summary?.totalCashCollected || '0');
  const totalExpenses = parseFloat(summary?.totalExpenses || '0');
  const totalHandedOver = parseFloat(summary?.totalHandedOver || '0');
  const netCash = parseFloat(summary?.netCash || '0');
  const pendingHandovers = summary?.pendingHandovers || 0;

  // Helper function to render event icon
  const getEventIcon = (type: string, status?: string) => {
    switch (type) {
      case 'handover':
        if (status === 'VERIFIED') return <CheckCircle className="h-4 w-4 text-green-600" />;
        if (status === 'REJECTED') return <XCircle className="h-4 w-4 text-red-600" />;
        return <Clock className="h-4 w-4 text-amber-600" />;
      case 'expense':
        return <Receipt className="h-4 w-4 text-red-500" />;
      case 'collection':
        return <Banknote className="h-4 w-4 text-green-600" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Helper function to render event status badge
  const getStatusBadge = (type: string, status?: string) => {
    if (type === 'handover') {
      switch (status) {
        case 'VERIFIED':
          return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Verified</Badge>;
        case 'PENDING':
          return <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Pending</Badge>;
        case 'REJECTED':
          return <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">Rejected</Badge>;
        case 'ADJUSTED':
          return <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">Adjusted</Badge>;
      }
    }
    if (type === 'expense') {
      switch (status) {
        case 'APPROVED':
          return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Approved</Badge>;
        case 'PENDING':
          return <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Pending</Badge>;
        case 'REJECTED':
          return <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">Rejected</Badge>;
      }
    }
    if (type === 'collection') {
      return <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Not Handed Over</Badge>;
    }
    return null;
  };

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
          <p className="text-sm text-muted-foreground">Complete transaction records</p>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
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
          <Button
            variant={dateRange === 'custom' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setDateRange('custom')}
          >
            <Calendar className="h-4 w-4 mr-1" />
            Custom
          </Button>
        </div>

        {/* Custom Date Range Inputs */}
        {dateRange === 'custom' && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="startDate" className="text-xs">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="endDate" className="text-xs">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="h-9"
              />
            </div>
          </div>
        )}

        {/* Date Range Display */}
        <p className="text-xs text-muted-foreground">
          Showing: {format(startDate, 'dd MMM yyyy')} - {format(endDate, 'dd MMM yyyy')}
        </p>
      </div>

      {/* Period Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Period Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950/30">
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                {totalCollected.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Cash Collected</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-950/30">
              <p className="text-xl font-bold text-red-600 dark:text-red-400">
                {totalExpenses.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Expenses</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30">
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {totalHandedOver.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Handed Over (Verified)</p>
            </div>
            <div className={`text-center p-3 rounded-lg ${netCash >= 0 ? 'bg-primary/10' : 'bg-destructive/10'}`}>
              <p className={`text-xl font-bold ${netCash >= 0 ? 'text-primary' : 'text-destructive'}`}>
                {netCash.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Net Cash</p>
            </div>
          </div>

          {/* Pending Handovers Warning */}
          {pendingHandovers > 0 && (
            <div className="mt-3 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
              <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {pendingHandovers} handover(s) pending verification
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction List */}
      <div className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground">
          Transactions ({events.length})
        </h2>
        {events.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No transactions in this period
            </CardContent>
          </Card>
        ) : (
          events.map((event: any) => {
            const amount = parseFloat(event.amount);
            const isPositive = amount >= 0;

            return (
              <Card key={event.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getEventIcon(event.type, event.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm capitalize">
                          {event.type === 'handover' && 'Cash Handover'}
                          {event.type === 'expense' && `Expense: ${event.details?.category || 'Other'}`}
                          {event.type === 'collection' && `Cash Collection (${event.details?.orderCount} orders)`}
                        </p>
                        {getStatusBadge(event.type, event.status)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(new Date(event.date), 'dd MMM yyyy')}
                        {event.details?.description && ` - ${event.details.description}`}
                      </p>
                      {event.type === 'handover' && event.details && (
                        <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                          <p>Expected: PKR {parseFloat(event.details.expectedCash).toLocaleString()}</p>
                          {parseFloat(event.details.discrepancy) !== 0 && (
                            <p className={parseFloat(event.details.discrepancy) > 0 ? 'text-amber-600' : 'text-red-600'}>
                              Discrepancy: PKR {Math.abs(parseFloat(event.details.discrepancy)).toLocaleString()}
                              {parseFloat(event.details.discrepancy) > 0 ? ' short' : ' excess'}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className={`text-right ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      <p className="font-bold">
                        {isPositive ? '+' : ''} PKR {Math.abs(amount).toLocaleString()}
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
