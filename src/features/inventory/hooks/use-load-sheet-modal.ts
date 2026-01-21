import { parseAsBoolean, useQueryState } from 'nuqs';

export const useLoadSheetModal = () => {
  const [isOpen, setIsOpen] = useQueryState(
    'load-sheet-open',
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
