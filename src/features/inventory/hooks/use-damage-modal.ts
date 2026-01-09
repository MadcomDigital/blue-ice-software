import { parseAsBoolean, useQueryState } from 'nuqs';

export const useDamageModal = () => {
  const [isOpen, setIsOpen] = useQueryState('damage-form', parseAsBoolean);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(null);

  return {
    isOpen: !!isOpen,
    open,
    close,
  };
};
