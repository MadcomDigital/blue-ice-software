'use client';

import { AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DamageForm } from '@/features/inventory/components/damage-form';

const DamagePage = () => {
  const router = useRouter();

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Record Damage or Loss
        </CardTitle>
        <CardDescription>Record damaged or lost bottles to reduce inventory</CardDescription>
      </CardHeader>
      <CardContent>
        <DamageForm onCancel={() => router.push('/inventory')} />
      </CardContent>
    </Card>
  );
};

export default DamagePage;
