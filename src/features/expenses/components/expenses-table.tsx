'use client';

import { ExpenseCategory, ExpenseStatus, UserRole } from '@prisma/client';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Check, Loader2, Trash2, X } from 'lucide-react';
import * as React from 'react';
import { DateRange } from 'react-day-picker';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useCurrent } from '@/features/auth/api/use-current';
import { useConfirm } from '@/hooks/use-confirm';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';

import { useDeleteExpense } from '../api/use-delete-expense';
import { useGetExpenses } from '../api/use-expenses';
import { useUpdateExpense } from '../api/use-update-expense';
import { useExpenseFilters } from '../hooks/use-expense-filters';
import { ExpenseForm } from './expense-form';

export const ExpensesTable = () => {
  const [filters, setFilters] = useExpenseFilters();
  const [searchValue, setSearchValue] = React.useState(filters.search || '');
  const debouncedSearch = useDebounce(searchValue, 500);

  const { data: currentUser } = useCurrent();
  const isAdmin = currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.SUPER_ADMIN;

  const [ConfirmDialog, confirm] = useConfirm(
    'Delete Expense',
    'Are you sure you want to delete this expense? This action cannot be undone.',
    'destructive',
  );

  // Local state for calendar selection to handle intermediate "from-only" state
  const [localDateRange, setLocalDateRange] = React.useState<DateRange | undefined>(
    filters.from && filters.to
      ? {
          from: new Date(filters.from),
          to: new Date(filters.to),
        }
      : undefined,
  );

  React.useEffect(() => {
    if (debouncedSearch !== filters.search) {
      setFilters({ search: debouncedSearch || null, page: 1 });
    }
  }, [debouncedSearch, filters.search, setFilters]);

  const setDateRange = (range: DateRange | undefined) => {
    setLocalDateRange(range); // Update UI immediately showing selection

    if (range?.from && range?.to) {
      setFilters({
        from: format(range.from, 'yyyy-MM-dd'),
        to: format(range.to, 'yyyy-MM-dd'),
        page: 1,
      });
    } else if (!range) {
      setFilters({ from: null, to: null, page: 1 });
    }
  };

  const { data, isLoading } = useGetExpenses({
    category: filters.category || undefined,
    status: filters.status || undefined,
    from: filters.from || undefined,
    to: filters.to || undefined,
    page: filters.page,
    limit: filters.limit,
  });

  const { mutate: updateExpense, isPending: isUpdating } = useUpdateExpense();
  const { mutate: deleteExpense, isPending: isDeleting } = useDeleteExpense();

  const expenses = data?.expenses || [];
  const pagination = data?.pagination;

  const handleApprove = (id: string) => {
    updateExpense({
      id,
      data: { status: ExpenseStatus.APPROVED },
    });
  };

  const handleReject = (id: string) => {
    updateExpense({
      id,
      data: { status: ExpenseStatus.REJECTED },
    });
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm();
    if (ok) {
      deleteExpense(id);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-2 py-4">
        <div className="min-w-[130px]">
          <Select
            value={filters.category || 'all'}
            onValueChange={(val) => setFilters({ category: val === 'all' ? null : val, page: 1 })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.values(ExpenseCategory).map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-[130px]">
          <Select
            value={filters.status || 'all'}
            onValueChange={(val) => setFilters({ status: val === 'all' ? null : val, page: 1 })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.values(ExpenseStatus).map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={'outline'}
                className={cn('w-[260px] justify-start text-left font-normal', !localDateRange && 'text-muted-foreground')}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {localDateRange?.from ? (
                  localDateRange.to ? (
                    <>
                      {format(localDateRange.from, 'LLL dd, y')} - {format(localDateRange.to, 'LLL dd, y')}
                    </>
                  ) : (
                    format(localDateRange.from, 'LLL dd, y')
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={localDateRange?.from}
                selected={localDateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="rounded-md border overflow-x-auto custom-scrollbar">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Spent By</TableHead>
              <TableHead className="text-right sticky right-0 bg-background shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.1)] z-10">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    Loading...
                  </div>
                </TableCell>
              </TableRow>
            ) : expenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No expenses found
                </TableCell>
              </TableRow>
            ) : (
              expenses.map((expense: any) => (
                <TableRow key={expense.id}>
                  <TableCell>{format(new Date(expense.date), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{expense.category}</Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate" title={expense.description}>
                    {expense.description}
                  </TableCell>
                  <TableCell>PKR {expense.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{expense.paymentMethod}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        expense.status === ExpenseStatus.APPROVED
                          ? 'default'
                          : expense.status === ExpenseStatus.REJECTED
                            ? 'destructive'
                            : 'secondary'
                      }
                    >
                      {expense.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{expense.spentByUser?.name}</TableCell>
                  <TableCell className="text-right sticky right-0 bg-background shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.1)] z-10">
                    <div className="flex justify-end gap-2">
                      {isAdmin && expense.status === ExpenseStatus.PENDING && (
                        <>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-8 w-8 text-green-600 hover:bg-green-50 hover:text-green-700"
                                  onClick={() => handleApprove(expense.id)}
                                  disabled={isUpdating}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Approve</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                                  onClick={() => handleReject(expense.id)}
                                  disabled={isUpdating}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Reject</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </>
                      )}

                      {isAdmin && (
                        <>
                          <ExpenseForm expense={expense} mode="edit" />

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                                  onClick={() => handleDelete(expense.id)}
                                  disabled={isDeleting}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="glass-card sticky bottom-4 z-20 border-white/40 flex items-center justify-end space-x-2 px-2 py-1 mt-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {pagination ? (
            <>
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} expenses
              <div className="inline-block ml-4">
                <Select
                  value={filters.limit?.toString() || '20'}
                  onValueChange={(val) => setFilters({ limit: parseInt(val), page: 1 })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Per page" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20">20 per page</SelectItem>
                    <SelectItem value="50">50 per page</SelectItem>
                    <SelectItem value="100">100 per page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : null}
        </div>
        <div className="flex items-center space-x-2">
          {pagination && (
            <span className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilters({ page: filters.page - 1 })}
            disabled={!pagination || pagination.page <= 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilters({ page: filters.page + 1 })}
            disabled={!pagination || pagination.page >= pagination.totalPages}
          >
            Next
          </Button>
        </div>
      </div>

      <ConfirmDialog />
    </div>
  );
};
