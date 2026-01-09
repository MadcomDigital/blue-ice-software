'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useGetProducts } from '@/features/products/api/use-get-products';

import { useRestock } from '../api/use-restock';
import { type RestockInput, restockSchema } from '../schema';

export const RestockForm = () => {
  const router = useRouter();
  const { data: products, isLoading: isLoadingProducts } = useGetProducts();
  const { mutate: restock, isPending } = useRestock();

  const form = useForm<RestockInput>({
    resolver: zodResolver(restockSchema),
    defaultValues: {
      productId: '',
      quantity: 0,
      notes: '',
    },
  });

  const onSubmit = (data: RestockInput) => {
    restock(data, {
      onSuccess: () => {
        form.reset();
        router.push('/inventory');
      },
    });
  };

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>Record Restock</CardTitle>
        <CardDescription>Add filled bottles to your inventory</CardDescription>
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

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity (Filled Bottles)</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" placeholder="e.g. 50" {...field} />
                  </FormControl>
                  <FormDescription>Number of filled bottles to add to inventory</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g. Batch number, supplier details, etc." rows={3} {...field} />
                  </FormControl>
                  <FormDescription>Any additional information about this restock</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="ghost" onClick={() => router.push('/inventory')}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                <Plus className="mr-2 h-4 w-4" />
                Add to Stock
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
