'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useGetProducts } from '@/features/products/api/use-get-products';

import { useRecordDamage } from '../api/use-record-damage';
import { type DamageInput, damageSchema } from '../schema';

export const DamageForm = () => {
  const router = useRouter();
  const { data: products, isLoading: isLoadingProducts } = useGetProducts();
  const { mutate: recordDamage, isPending } = useRecordDamage();

  const form = useForm<DamageInput>({
    resolver: zodResolver(damageSchema),
    defaultValues: {
      productId: '',
      quantity: 0,
      type: 'DAMAGE',
      reason: '',
      notes: '',
    },
  });

  const onSubmit = (data: DamageInput) => {
    recordDamage(data, {
      onSuccess: () => {
        form.reset();
        router.push('/inventory');
      },
    });
  };

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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingProducts}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products?.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} ({product.sku})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DAMAGE">Damage</SelectItem>
                        <SelectItem value="LOSS">Loss</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Damage: tracked separately. Loss: removed completely</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" placeholder="e.g. 5" {...field} />
                    </FormControl>
                    <FormDescription>Number of bottles affected</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Cracked during transport, Stolen, etc." {...field} />
                  </FormControl>
                  <FormDescription>Required: Explain what happened</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any additional details..." rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="ghost" onClick={() => router.push('/inventory')}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                <AlertTriangle className="mr-2 h-4 w-4" />
                Record {form.watch('type') === 'DAMAGE' ? 'Damage' : 'Loss'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
