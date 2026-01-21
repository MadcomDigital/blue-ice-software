'use client';

import { ResponsiveModal } from '@/components/responsive-modal';
import { ReturnSheetForm } from '@/features/inventory/components/return-sheet-form';
import { useReturnSheetModal } from '@/features/inventory/hooks/use-return-sheet-modal';

export const ReturnSheetModal = () => {
  const { isOpen, setIsOpen, close } = useReturnSheetModal();

  return (
    <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}>
      <ReturnSheetForm onSuccess={close} />
    </ResponsiveModal>
  );
};
