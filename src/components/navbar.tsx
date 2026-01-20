'use client';

import { usePathname } from 'next/navigation';

import { UserButton } from '@/features/auth/components/user-button';

import { NotificationSheet } from '@/features/notifications/components/notification-sheet';

import { MobileSidebar } from './mobile-sidebar';
import { ModeToggle } from './toggle-btn';

const pathnameMap: Record<string, { title: string; description: string }> = {
  dashboard: {
    title: 'Dashboard',
    description: 'Overview of your business performance.',
  },
  drivers: {
    title: 'Drivers',
    description: 'Manage your fleet and driver details.',
  },
  routes: {
    title: 'Routes',
    description: 'Manage delivery routes and assignments.',
  },
  customers: {
    title: 'Customers',
    description: 'View and manage customer profiles.',
  },
  orders: {
    title: 'Orders',
    description: 'Track and manage customer orders.',
  },
  'cash-management': {
    title: 'Cash Management',
    description: 'Track cash handovers and discrepancies.',
  },
  expenses: {
    title: 'Expenses',
    description: 'Manage operational expenses.',
  },
  inventory: {
    title: 'Inventory',
    description: 'Monitor product stock and inventory.',
  },
  settings: {
    title: 'Settings',
    description: 'Manage application settings.',
  },
};

const defaultMap = {
  title: 'Home',
  description: 'Monitor all of your projects and tasks here.',
};

export const Navbar = () => {
  const pathname = usePathname();
  const pathnameParts = pathname.split('/');
  const pathnameKey = pathnameParts[1] || 'dashboard';

  const { title, description } = pathnameMap[pathnameKey] || defaultMap;

  return (
    <nav className="flex items-center justify-between px-4 py-2 lg:px-6 lg:pt-4">
      <div className="hidden flex-col lg:flex">
        <h1 className="text-lg font-semibold lg:text-2xl">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <MobileSidebar />

      <div className="flex items-center gap-x-2.5">
        <NotificationSheet />
        <ModeToggle />
        <UserButton />
      </div>
    </nav>
  );
};
