import { parseAsString, parseAsBoolean, useQueryStates } from 'nuqs';

export const useUserFilters = () => {
  return useQueryStates({
    search: parseAsString,
    suspended: parseAsBoolean,
  });
};
