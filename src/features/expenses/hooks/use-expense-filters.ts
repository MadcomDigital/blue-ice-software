import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';

export const useExpenseFilters = () => {
  return useQueryStates({
    search: parseAsString.withDefault(''),
    category: parseAsString.withDefault(''),
    status: parseAsString.withDefault(''),
    from: parseAsString.withDefault(''),
    to: parseAsString.withDefault(''),
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(20),
  });
};
