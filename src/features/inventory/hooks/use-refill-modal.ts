import { parseAsBoolean, useQueryState } from 'nuqs';

export const useRefillModal = () => {
  const [isOpen, setIsOpen] = useQueryState('refill-form', parseAsBoolean);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(null);

  return {
    isOpen: !!isOpen,
    open,
    close,
  };
};
