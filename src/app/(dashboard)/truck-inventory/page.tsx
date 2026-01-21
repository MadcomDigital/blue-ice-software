'use client';

import { ArrowDownToLine, ArrowUpFromLine, ClipboardList } from 'lucide-react';
import { format } from 'date-fns';

import { PageLoader } from '@/components/page-loader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useGetInventoryHandovers } from '@/features/inventory/api/use-get-inventory-handovers';
import { useLoadSheetModal } from '@/features/inventory/hooks/use-load-sheet-modal';
import { useReturnSheetModal } from '@/features/inventory/hooks/use-return-sheet-modal';

export default function TruckInventoryDashboard() {
  const { open: openLoadSheet } = useLoadSheetModal();
  const { open: openReturnSheet } = useReturnSheetModal();
  const { data: handovers, isLoading } = useGetInventoryHandovers();

  const actions = [
    {
      title: 'Create Load Sheet',
      description: 'Morning: Record stock moving from Warehouse to Truck.',
      icon: ArrowUpFromLine,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      onClick: openLoadSheet,
    },
    {
      title: 'Create Return Sheet',
      description: 'Evening: Record unsold stock and empties returning to Warehouse.',
      icon: ArrowDownToLine,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      onClick: openReturnSheet,
    },
  ];

  if (isLoading) return <PageLoader />;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <ClipboardList className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Truck Inventory</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {actions.map((action) => (
          <Card
            key={action.title}
            className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
            onClick={action.onClick}
          >
            <CardHeader className="pb-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-2 ${action.bgColor}`}>
                <action.icon className={`h-6 w-6 ${action.color}`} />
              </div>
              <CardTitle>{action.title}</CardTitle>
              <CardDescription>{action.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Recent Handovers</h2>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {handovers?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                    No recent inventory movements found.
                  </TableCell>
                </TableRow>
              ) : (
                handovers?.map((handover: any) => (
                  <TableRow key={handover.id}>
                    <TableCell>
                      <Badge variant={handover.type === 'LOAD' ? 'default' : 'secondary'}>
                        {handover.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{handover.driverName}</div>
                      <div className="text-xs text-muted-foreground">{handover.vehicleNo}</div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(handover.date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      {handover.itemCount} items
                    </TableCell>
                    <TableCell>{handover.managerName}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline">{handover.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
