'use client';

import { useRouter } from 'next/navigation';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RestockForm } from '@/features/inventory/components/restock-form';

const RestockPage = () => {
  const router = useRouter();

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>Record Restock</CardTitle>
        <CardDescription>Add filled bottles to your inventory</CardDescription>
      </CardHeader>
      <CardContent>
        <RestockForm onCancel={() => router.push('/inventory')} />
      </CardContent>
    </Card>
  );
};

export default RestockPage;
