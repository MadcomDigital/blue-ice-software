'use client';

import { ResponsiveModal } from '@/components/responsive-modal';

import { useRefillModal } from '../hooks/use-refill-modal';
import { RefillForm } from './refill-form';

export const RefillFormModal = () => {
  const { isOpen, close } = useRefillModal();

  return (
    <ResponsiveModal title="Refill Bottles" description="Convert empty bottles to filled bottles" open={isOpen} onOpenChange={(open) => !open && close()}>
      <RefillForm onCancel={close} />
    </ResponsiveModal>
  );
};
