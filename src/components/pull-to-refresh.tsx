'use client';

import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  isRefreshing?: boolean;
  children: React.ReactNode;
  className?: string;
  threshold?: number;
}

export const PullToRefresh = ({
  onRefresh,
  isRefreshing = false,
  children,
  className,
  threshold = 80,
}: PullToRefreshProps) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const isRefreshingRef = useRef(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (containerRef.current?.scrollTop === 0 && !isRefreshingRef.current) {
      startYRef.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isPulling || isRefreshingRef.current) return;

      const currentY = e.touches[0].clientY;
      const distance = Math.max(0, currentY - startYRef.current);

      // Apply resistance for a natural feel
      const resistance = 0.5;
      const adjustedDistance = Math.min(distance * resistance, threshold * 1.5);

      setPullDistance(adjustedDistance);

      // Prevent scroll when pulling
      if (adjustedDistance > 0) {
        e.preventDefault();
      }
    },
    [isPulling, threshold]
  );

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling || isRefreshingRef.current) return;

    if (pullDistance >= threshold) {
      isRefreshingRef.current = true;
      try {
        await onRefresh();
      } finally {
        isRefreshingRef.current = false;
      }
    }

    setIsPulling(false);
    setPullDistance(0);
  }, [isPulling, pullDistance, threshold, onRefresh]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const showIndicator = pullDistance > 10 || isRefreshing;
  const indicatorOpacity = Math.min(pullDistance / threshold, 1);
  const indicatorRotation = (pullDistance / threshold) * 180;

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Pull indicator */}
      <div
        className={cn(
          'absolute left-1/2 -translate-x-1/2 flex items-center justify-center transition-all duration-200 z-10',
          showIndicator ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          top: Math.min(pullDistance - 40, 20),
          transform: `translateX(-50%) rotate(${isRefreshing ? 0 : indicatorRotation}deg)`,
        }}
      >
        <div
          className={cn(
            'rounded-full bg-background shadow-md p-2',
            isRefreshing && 'animate-bounce'
          )}
        >
          <Loader2
            className={cn('h-5 w-5 text-primary', isRefreshing && 'animate-spin')}
            style={{ opacity: isRefreshing ? 1 : indicatorOpacity }}
          />
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isPulling ? 'none' : 'transform 0.2s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  );
};
