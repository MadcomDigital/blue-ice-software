import { parseAsBoolean, useQueryState } from 'nuqs';

export const useReturnSheetModal = () => {
  const [isOpen, setIsOpen] = useQueryState(
    'return-sheet-open',
    parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true })
  );

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return {
    isOpen,
    open,
    close,
    setIsOpen,
  };
};
