'use client';

import { ResponsiveModal } from '@/components/responsive-modal';
import { LoadSheetForm } from '@/features/inventory/components/load-sheet-form';
import { useLoadSheetModal } from '@/features/inventory/hooks/use-load-sheet-modal';

export const LoadSheetModal = () => {
  const { isOpen, setIsOpen, close } = useLoadSheetModal();

  return (
    <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}>
      <LoadSheetForm onSuccess={close} />
    </ResponsiveModal>
  );
};
