'use client';

import { MapPin } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { DriverLocationTracker } from '@/features/tracking/components/driver-location-tracker';

export const LocationTrackingModal = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="relative flex flex-col items-center gap-1 px-6 py-2 transition-colors text-muted-foreground hover:text-foreground cursor-pointer">
          <MapPin className="h-5 w-5" />
          <span className="text-xs font-medium">Tracking</span>
        </div>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[425px]">
        <DriverLocationTracker />
      </DialogContent>
    </Dialog>
  );
};
