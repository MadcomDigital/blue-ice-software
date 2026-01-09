'use client';

import { ResponsiveModal } from '@/components/responsive-modal';

import { useDamageModal } from '../hooks/use-damage-modal';
import { DamageForm } from './damage-form';

export const DamageFormModal = () => {
  const { isOpen, close } = useDamageModal();

  return (
    <ResponsiveModal title="Record Damage or Loss" description="Record damaged or lost bottles to reduce inventory" open={isOpen} onOpenChange={(open) => !open && close()}>
      <DamageForm onCancel={close} />
    </ResponsiveModal>
  );
};
