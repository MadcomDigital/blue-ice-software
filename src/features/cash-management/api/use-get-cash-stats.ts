import { useQuery } from '@tanstack/react-query';

import { client } from '@/lib/hono';

type CashStatsOptions = {
    startDate?: string;
    endDate?: string;
};

export const useGetCashStats = ({ startDate, endDate }: CashStatsOptions = {}) => {
    return useQuery({
        queryKey: ['cash-dashboard-stats', { startDate, endDate }],
        queryFn: async () => {
            const response = await client.api['cash-management'].stats.$get({
                query: {
                    startDate: startDate || '',
                    endDate: endDate || '',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch cash statistics');
            }

            const data = await response.json();
            return data.data;
        },
        refetchInterval: 30000, // Refetch every 30 seconds
    });
};
