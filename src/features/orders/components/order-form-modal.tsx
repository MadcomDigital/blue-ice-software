'use client';

import { useOrderModal } from '../hooks/use-order-modal';
import { OrderForm } from './order-form';
import { ResponsiveModal } from '@/components/responsive-modal';

export const OrderFormModal = () => {
  const { isOpen, isEdit, orderId, close } = useOrderModal();

  return (
    <ResponsiveModal title={isEdit ? 'Edit Order' : 'Create New Order'} description="" open={isOpen} onOpenChange={(open) => !open && close()}>
      <OrderForm key={orderId || 'new'} orderId={isEdit ? orderId! : undefined} onCancel={close} />
    </ResponsiveModal>
  );
};
