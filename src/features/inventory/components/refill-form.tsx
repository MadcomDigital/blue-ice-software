'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRightLeft, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useGetProducts } from '@/features/products/api/use-get-products';

import { useRefill } from '../api/use-refill';
import { type RefillInput, refillSchema } from '../schema';
import { useGetInventoryStats } from '../api/use-get-inventory-stats';

interface RefillFormProps {
  onCancel?: () => void;
}

export const RefillForm = ({ onCancel }: RefillFormProps) => {
  const { data: products, isLoading: isLoadingProducts } = useGetProducts();
  const { data: inventoryStats } = useGetInventoryStats();
  const { mutate: refill, isPending } = useRefill();

  const form = useForm<RefillInput>({
    resolver: zodResolver(refillSchema),
    defaultValues: {
      productId: '',
      quantity: 0,
      notes: '',
    },
  });

  const selectedProductId = form.watch('productId');
  const selectedProduct = inventoryStats?.products.find((p) => p.id === selectedProductId);

  const onSubmit = (data: RefillInput) => {
    refill(data, {
      onSuccess: () => {
        form.reset();
        onCancel?.();
      },
    });
  };

  return (
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

        {selectedProduct && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Available Empty Bottles:</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">{selectedProduct.stockEmpty}</span>
            </div>
          </div>
        )}

        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity to Refill</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  max={selectedProduct?.stockEmpty || undefined}
                  placeholder="e.g. 25"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Convert empty bottles to filled (max: {selectedProduct?.stockEmpty || 0})
              </FormDescription>
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
                <Textarea placeholder="e.g. Refill batch details, operator name, etc." rows={3} {...field} />
              </FormControl>
              <FormDescription>Any additional information about this refill operation</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isPending || !selectedProduct || selectedProduct.stockEmpty === 0}>
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            <ArrowRightLeft className="mr-2 h-4 w-4" />
            Refill Bottles
          </Button>
        </div>
      </form>
    </Form>
  );
};
