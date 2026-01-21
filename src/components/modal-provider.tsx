'use client';

import { useEffect, useState } from 'react';

import { LoadSheetModal } from '@/features/inventory/components/load-sheet-modal';
import { ReturnSheetModal } from '@/features/inventory/components/return-sheet-modal';
import { InvoiceModal } from '@/features/orders/components/invoice-modal';
import { OrderFormModal } from '@/features/orders/components/order-form-modal';

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <>
      <OrderFormModal />
      <InvoiceModal />
      <LoadSheetModal />
      <ReturnSheetModal />
    </>
  );
};
