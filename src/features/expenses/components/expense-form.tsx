'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ExpenseCategory, ExpensePaymentMethod } from '@prisma/client';
import { Pencil, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCreateExpense } from '@/features/expenses/api/use-create-expense';
import { useUpdateExpense } from '@/features/expenses/api/use-update-expense';

import { createExpenseSchema } from '../schema';

interface ExpenseFormProps {
  expense?: any;
  mode?: 'create' | 'edit';
}

export const ExpenseForm = ({ expense, mode = 'create' }: ExpenseFormProps) => {
  const [open, setOpen] = useState(false);
  const { mutate: createExpense, isPending: isCreating } = useCreateExpense();
  const { mutate: updateExpense, isPending: isUpdating } = useUpdateExpense();

  const isPending = isCreating || isUpdating;

  const form = useForm<z.infer<typeof createExpenseSchema>>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: {
      amount: 0,
      date: new Date(),
      category: ExpenseCategory.FUEL,
      description: '',
      paymentMethod: ExpensePaymentMethod.CASH_ON_HAND,
    },
  });

  useEffect(() => {
    if (expense && mode === 'edit') {
      form.reset({
        amount: expense.amount,
        date: new Date(expense.date),
        category: expense.category,
        description: expense.description || '',
        paymentMethod: expense.paymentMethod,
      });
    }
  }, [expense, mode, form]);

  const onSubmit = (values: z.infer<typeof createExpenseSchema>) => {
    if (mode === 'edit' && expense) {
      updateExpense(
        {
          id: expense.id,
          data: {
            ...values,
            date: values.date,
          },
        },
        {
          onSuccess: () => {
            setOpen(false);
          },
        },
      );
    } else {
      createExpense(
        {
          ...values,
          date: values.date.toISOString(),
        },
        {
          onSuccess: () => {
            setOpen(false);
            form.reset();
          },
        },
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === 'edit' ? (
          <Button size="icon" variant="ghost" className="h-8 w-8">
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(ExpenseCategory).map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(ExpensePaymentMethod).map((method) => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Saving...' : mode === 'edit' ? 'Update Expense' : 'Save Expense'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
