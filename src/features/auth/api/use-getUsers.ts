import { useQuery } from '@tanstack/react-query';

import { client } from '@/lib/hono';

interface useGetUsersProps {
  search?: string | null;
  suspended?: boolean | null;
}

export const useGetUsers = ({ search, suspended }: useGetUsersProps) => {
  const query = useQuery({
    queryKey: ['users', search, suspended],
    queryFn: async () => {
      const response = await client.api.auth.users.$get({
        query: {
          search: search ?? undefined,
          suspended: suspended !== null ? String(suspended) : undefined,
        },
      });

      if (!response.ok) return null;

      const { data } = await response.json();

      return data;
    },
  });

  return query;
};
