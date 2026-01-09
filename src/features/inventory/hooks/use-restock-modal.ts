import { parseAsBoolean, useQueryState } from 'nuqs';

export const useRestockModal = () => {
  const [isOpen, setIsOpen] = useQueryState('restock-form', parseAsBoolean);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(null);

  return {
    isOpen: !!isOpen,
    open,
    close,
  };
};
