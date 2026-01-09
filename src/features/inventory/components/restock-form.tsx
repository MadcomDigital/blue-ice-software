'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useGetProducts } from '@/features/products/api/use-get-products';

import { useRestock } from '../api/use-restock';
import { type RestockInput, restockSchema } from '../schema';

interface RestockFormProps {
  onCancel?: () => void;
}

export const RestockForm = ({ onCancel }: RestockFormProps) => {
  const { data: products, isLoading: isLoadingProducts } = useGetProducts();
  const { mutate: restock, isPending } = useRestock();

  const form = useForm<RestockInput>({
    resolver: zodResolver(restockSchema),
    defaultValues: {
      productId: '',
      filledQuantity: 0,
      emptyQuantity: 0,
      notes: '',
    },
  });

  const onSubmit = (data: RestockInput) => {
    restock(data, {
      onSuccess: () => {
        form.reset();
        onCancel?.();
      },
    });
  };

  return (
    <Card className="mx-auto max-w-4xl">
      <CardHeader>
        <CardTitle>Record Restock</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormLabel>Product</FormLabel>
            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
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
                name="filledQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Filled Bottles</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" placeholder="e.g. 50" {...field} />
                    </FormControl>
                    <FormDescription>Number of filled bottles from supplier</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emptyQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Empty Bottles</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" placeholder="e.g. 25" {...field} />
                    </FormControl>
                    <FormDescription>Number of empty bottles from supplier</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
              {onCancel && (
                <Button type="button" variant="ghost" onClick={onCancel}>
                  Cancel
                </Button>
              )}
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
