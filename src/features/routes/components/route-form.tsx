'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Route, UserCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { PageError } from '@/components/page-error';
import { PageLoader } from '@/components/page-loader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useGetDrivers } from '@/features/drivers/api/use-get-drivers';

import { useCreateRoute } from '../api/use-create-route';
import { useGetRoute } from '../api/use-get-route';
import { useOptimizeRoute } from '../api/use-optimize-route';
import { useUpdateRoute } from '../api/use-update-route';
import { type CreateRouteInput, createRouteSchema } from '../schema';

interface RouteFormProps {
  routeId?: string;
  onCancel?: () => void;
}

export const RouteForm = ({ routeId, onCancel }: RouteFormProps) => {
  const router = useRouter();
  const isEdit = !!routeId;

  const { data: route, isLoading: isLoadingRoute } = useGetRoute(routeId || '');
  const { mutate: createRoute, isPending: isCreating } = useCreateRoute();
  const { mutate: updateRoute, isPending: isUpdating } = useUpdateRoute();
  const { mutate: optimizeRoute, isPending: isOptimizing } = useOptimizeRoute();
  const { data: driversData, isLoading: isLoadingDrivers } = useGetDrivers({ limit: 100 });

  const isPending = isCreating || isUpdating;
  const drivers = driversData?.drivers || [];

  const form = useForm<CreateRouteInput>({
    resolver: zodResolver(createRouteSchema),
    defaultValues: {
      name: '',
      description: '',
      defaultDriverId: null,
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (route) {
      form.reset({
        name: route.name,
        description: route.description || '',
        defaultDriverId: route.defaultDriverId || null,
      });
    }
  }, [route, form]);

  const handleOptimize = () => {
    if (routeId) {
      optimizeRoute({ param: { id: routeId }, json: {} });
    }
  };

  const onSubmit = (data: CreateRouteInput) => {
    if (isEdit && routeId) {
      updateRoute(
        { param: { id: routeId }, json: data },
        {
          onSuccess: () => router.push('/routes'),
        },
      );
    } else {
      createRoute(data, {
        onSuccess: () => router.push('/routes'),
      });
    }
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    else router.push('/routes');
  };

  if (isEdit && isLoadingRoute) return <PageLoader />;
  if (isEdit && !route) return <PageError message="Route not found" />;

  return (
    <Card className="mx-auto">
      <CardHeader>
        <CardTitle>{isEdit ? 'Edit Route' : 'Create New Route'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Route Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Morning - DHA Phase 6" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Details about the route..." className="resize-none" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="defaultDriverId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <UserCircle className="size-4" />
                    Default Driver
                  </FormLabel>
                  <Select
                    value={field.value || 'none'}
                    onValueChange={(value) => field.onChange(value === 'none' ? null : value)}
                    disabled={isLoadingDrivers}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a driver..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No default driver</SelectItem>
                      {drivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id}>
                          {driver.user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Orders generated for customers in this route will be automatically assigned to this driver.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isEdit && (
              <Card className="bg-muted/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Route className="size-4" />
                    Route Optimization
                  </CardTitle>
                  <CardDescription>
                    Automatically reorder customers based on their geo-location for optimal delivery sequencing.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button type="button" variant="secondary" onClick={handleOptimize} disabled={isOptimizing}>
                    {isOptimizing && <Loader2 className="mr-2 size-4 animate-spin" />}
                    Optimize Customer Sequence
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="ghost" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                {isEdit ? 'Save Changes' : 'Create Route'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
