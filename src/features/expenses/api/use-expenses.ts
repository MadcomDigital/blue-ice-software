'use client';

import { ExpenseCategory, ExpenseStatus } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';

import { client } from '@/lib/hono';

interface UseGetExpensesParams {
  category?: string;
  status?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export const useGetExpenses = (params?: UseGetExpensesParams) => {
  return useQuery({
    queryKey: ['expenses', params],
    queryFn: async () => {
      const query: Record<string, string> = {};

      if (params?.category && params.category !== '') {
        query.category = params.category;
      }
      if (params?.status && params.status !== '') {
        query.status = params.status;
      }
      if (params?.from && params.from !== '') {
        query.startDate = params.from;
      }
      if (params?.to && params.to !== '') {
        query.endDate = params.to;
      }
      if (params?.page) {
        query.page = params.page.toString();
      }
      if (params?.limit) {
        query.limit = params.limit.toString();
      }

      const response = await client.api.expenses.$get({
        query,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch expenses');
      }

      const data = await response.json();
      return data;
    },
  });
};

export const useCreateExpense = () => {
  return {
    mutate: async (data: any) => {
      const response = await client.api.expenses.$post({
        json: data,
      });
      if (!response.ok) {
        throw new Error('Failed to create expense');
      }
      return await response.json();
    },
  };
};
