'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, Trash, Wand2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { PageError } from '@/components/page-error';
import { PageLoader } from '@/components/page-loader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetDrivers } from '@/features/drivers/api/use-get-drivers';
import { useCreateLoadHandover } from '@/features/inventory/api/use-create-load-handover';
import { useGetDriverScheduledStock } from '@/features/inventory/api/use-get-driver-scheduled-stock';
import { loadHandoverSchema } from '@/features/inventory/schema';
import { useGetProducts } from '@/features/products/api/use-get-products';

// Extend schema for form usage (date as string)
const formSchema = loadHandoverSchema;

type FormValues = z.infer<typeof formSchema>;

interface LoadSheetFormProps {
  onSuccess?: () => void;
}

export const LoadSheetForm = ({ onSuccess }: LoadSheetFormProps) => {
  const router = useRouter();
  const { mutate, isPending } = useCreateLoadHandover();
  const { data: drivers, isLoading: isLoadingDrivers } = useGetDrivers();
  const { data: products, isLoading: isLoadingProducts } = useGetProducts();

  const [shouldFetchStock, setShouldFetchStock] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      driverId: '',
      date: new Date().toISOString().split('T')[0],
      items: [{ productId: '', quantity: 0 }],
    },
  });

  const selectedDriverId = form.watch('driverId');
  const selectedDate = form.watch('date');

  const { data: scheduledStock, isLoading: isLoadingStock, refetch: refetchStock } = useGetDriverScheduledStock({
    driverId: selectedDriverId,
    date: selectedDate,
    enabled: false, // Only fetch on button click
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  // Handle "Auto-Fill" Logic
  const handleAutoFill = () => {
    if (!selectedDriverId || !selectedDate) {
      toast.error('Please select a driver and date first');
      return;
    }
    refetchStock();
  };

  useEffect(() => {
    if (scheduledStock) {
      if (scheduledStock.length === 0) {
        toast.info('No scheduled orders found for this driver/date');
        return;
      }

      // Map stock to form fields
      // Note: scheduledStock is [{ productId: string, quantity: number }]
      // But query returns { success: true, data: [...] } if json structure,
      // hook returns just the array part based on my implementation.
      // Need to cast properly if TS complains, but let's assume hook is correct.

      const formItems = scheduledStock.map((item: any) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      replace(formItems);
      toast.success('Load sheet pre-filled from scheduled orders');
    }
  }, [scheduledStock, replace]);


  const onSubmit = (values: FormValues) => {
    mutate(
      { json: values },
      {
        onSuccess: () => {
          if (onSuccess) {
            onSuccess();
          } else {
            router.push('/truck-inventory');
          }
        },
      }
    );
  };

  if (isLoadingDrivers || isLoadingProducts) return <PageLoader />;
  if (!drivers || !products) return <PageError message="Failed to load data" />;

  return (
    <Card className="w-full border-none shadow-none">
      <CardHeader className="px-0 pt-0">
        <CardTitle>Create Load Sheet (Morning)</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="driverId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Driver</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a driver" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {drivers?.data?.map((driver: any) => (
                          <SelectItem key={driver.id} value={driver.id}>
                            {driver.user.name} ({driver.vehicleNo})
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
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel className="text-base font-semibold">Inventory Items</FormLabel>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleAutoFill}
                    disabled={isLoadingStock || !selectedDriverId}
                  >
                    {isLoadingStock ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Wand2 className="mr-2 h-4 w-4" />
                    )}
                    Auto-Fill from Orders
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ productId: '', quantity: 0 })}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </div>
              </div>

              {fields.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground text-sm">
                  No items added. Use "Auto-Fill" or click "Add Item".
                </div>
              )}

              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-4 items-end">
                  <FormField
                    control={form.control}
                    name={`items.${index}.productId`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className={index !== 0 ? 'sr-only' : ''}>Product</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {products?.data?.map((product: any) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name} (Stock: {product.stockFilled})
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
                    name={`items.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem className="w-32">
                        <FormLabel className={index !== 0 ? 'sr-only' : ''}>Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mb-[2px]"
                    onClick={() => remove(index)}
                  >
                    <Trash className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-4">
              {/* Note: Cancel logic handled by modal usually */}
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm Load
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
