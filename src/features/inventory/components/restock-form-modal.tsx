'use client';

import { ResponsiveModal } from '@/components/responsive-modal';

import { useRestockModal } from '../hooks/use-restock-modal';
import { RestockForm } from './restock-form';

export const RestockFormModal = () => {
  const { isOpen, close } = useRestockModal();

  return (
    <ResponsiveModal title="Record Restock" description="Add filled bottles to your inventory" open={isOpen} onOpenChange={(open) => !open && close()}>
      <RestockForm onCancel={close} />
    </ResponsiveModal>
  );
};
