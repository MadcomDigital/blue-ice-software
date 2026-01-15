'use client';

import { format, parseISO, subDays } from 'date-fns';
import { Suspense, useEffect, useState } from 'react';

import { PageLoader } from '@/components/page-loader';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCurrentDriver } from '@/features/driver-view/api/use-current-driver';
import { CalendarIcon, Map, List } from 'lucide-react';

import { StatsDashboard } from '@/features/driver-view/components/stats-dashboard';
import { EnhancedOrderCard } from '@/features/driver-view/components/enhanced-order-card';
import { IssueOrderCard } from '@/features/driver-view/components/issue-order-card';
import { LoadSheet } from '@/features/driver-view/components/load-sheet';
import { DeliveryMap } from '@/features/driver-view/components/delivery-map';
import { ExpenseForm } from '@/features/expenses/components/expense-form';
import { useGetOrders } from '@/features/orders/api/use-get-orders';
import { DriverLocationTracker } from '@/features/tracking/components/driver-location-tracker';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { cacheTodaysOrders, getCachedOrders } from '@/lib/offline-storage';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { getBusinessDate, getDateLabel, getYesterdayBusinessDate } from '@/lib/utils/business-date';
import { cn } from '@/lib/utils';

function DeliveriesContent() {
  const { data: driver, isLoading: isLoadingDriver } = useCurrentDriver();
  const isOnline = useOnlineStatus();
  const [selectedDate, setSelectedDate] = useState(getBusinessDate());
  const [cachedOrders, setCachedOrders] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const today = getBusinessDate();
  const yesterday = getYesterdayBusinessDate();

  const { data: ordersData, isLoading: isLoadingOrders } = useGetOrders({
    driverId: driver?.id,
    date: selectedDate,
  });

  // Cache orders when online
  useEffect(() => {
    if (isOnline && ordersData?.orders) {
      cacheTodaysOrders(ordersData.orders).catch((error) => {
        console.error('Failed to cache orders:', error);
      });
    }
  }, [isOnline, ordersData]);

  // Load cached orders when offline
  useEffect(() => {
    if (!isOnline) {
      getCachedOrders()
        .then((cached) => {
          setCachedOrders(cached);
        })
        .catch((error) => {
          console.error('Failed to load cached orders:', error);
        });
    }
  }, [isOnline]);

  if (isLoadingDriver || isLoadingOrders) return <PageLoader />;
  if (!driver) return <div className="p-4">You are not registered as a driver.</div>;

  // Use cached orders when offline, otherwise use fresh data
  const orders = isOnline ? ordersData?.orders || [] : cachedOrders;

  const pendingOrders = orders.filter((o: any) => o.status === 'PENDING' || o.status === 'IN_PROGRESS' || o.status === 'SCHEDULED');
  const completedOrders = orders.filter((o: any) => o.status === 'COMPLETED');
  const issueOrders = orders.filter((o: any) => o.status === 'CANCELLED' || o.status === 'RESCHEDULED');

  // We need current location for the map center
  // Since useLiveLocations is not available here easily without prop drilling or new hook context,
  // we'll rely on the Map component's default behavior or add a simple geolocation hook if needed.
  // For now, let's pass null and let the map center on orders.

  return (
    <div className="space-y-6">
      <StatsDashboard />
      <DriverLocationTracker />

      {/* Date Selector */}
      <div className="flex items-center gap-2">
        <Button
          variant={selectedDate === today ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setSelectedDate(today)}
        >
          Today
        </Button>
        <Button
          variant={selectedDate === yesterday ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setSelectedDate(yesterday)}
        >
          Yesterday
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(selectedDate !== today && selectedDate !== yesterday && 'border-primary text-primary')}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {getDateLabel(selectedDate)}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={parseISO(selectedDate)}
              onSelect={(date) => date && setSelectedDate(format(date, 'yyyy-MM-dd'))}
              disabled={(date) => date > new Date()}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <ExpenseForm />
          <LoadSheet orders={pendingOrders} />
        </div>

        <div className="bg-muted dark:bg-muted/50 rounded-lg p-1">
          <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as 'list' | 'map')}>
            <ToggleGroupItem value="list" aria-label="List View" size="sm" className="data-[state=on]:bg-background dark:data-[state=on]:bg-background/80">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="map" aria-label="Map View" size="sm" className="data-[state=on]:bg-background dark:data-[state=on]:bg-background/80">
              <Map className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">To Do ({pendingOrders.length})</TabsTrigger>
          <TabsTrigger value="completed">Done ({completedOrders.length})</TabsTrigger>
          <TabsTrigger value="issues">Issues ({issueOrders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4 space-y-4">
          {viewMode === 'map' ? (
            <DeliveryMap orders={pendingOrders} height="500px" />
          ) : (
            <>
              {pendingOrders.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">No pending deliveries</p>
              ) : (
                pendingOrders.map((order: any, index: number) => <EnhancedOrderCard key={order.id} order={order} index={index} />)
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-4 space-y-4">
          {completedOrders.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No completed deliveries today</p>
          ) : (
            completedOrders.map((order: any) => <EnhancedOrderCard key={order.id} order={order} />)
          )}
        </TabsContent>

        <TabsContent value="issues" className="mt-4 space-y-4">
          {issueOrders.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No issues today</p>
          ) : (
            issueOrders.map((order: any) => <IssueOrderCard key={order.id} order={order} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function DeliveriesPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <DeliveriesContent />
    </Suspense>
  );
}
