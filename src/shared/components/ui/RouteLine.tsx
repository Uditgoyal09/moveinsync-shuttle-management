import React from 'react';
import { cn } from '@/shared/utils/cn';

interface StopInfo {
  id: string;
  name: string;
}

interface RouteLineProps {
  stops: StopInfo[];
  colorClass?: string; // e.g., 'text-route-green' or 'bg-route-green'
  pickupId?: string;
  dropoffId?: string;
}

export function RouteLine({ stops, colorClass = 'text-primary', pickupId, dropoffId }: RouteLineProps) {
  let inTransit = false;

  return (
    <div className="flex flex-col gap-0 py-2">
      {stops.map((stop, index) => {
        const isPickup = stop.id === pickupId;
        const isDropoff = stop.id === dropoffId;
        
        if (isPickup) inTransit = true;

        const isHighlighted = inTransit || isDropoff;
        
        // Stop highlighting after dropoff
        if (isDropoff) inTransit = false;

        const isLast = index === stops.length - 1;

        return (
          <div key={stop.id} className="flex gap-4 items-start">
            <div className="flex flex-col items-center mt-1">
              <div 
                className={cn(
                  "w-3 h-3 rounded-full border-2",
                  isHighlighted ? cn("bg-current border-current", colorClass) : "border-muted bg-surface"
                )}
              />
              {!isLast && (
                <div 
                  className={cn(
                    "w-0.5 h-6 my-1",
                    isHighlighted && !isDropoff ? cn("bg-current", colorClass) : "bg-border"
                  )}
                />
              )}
            </div>
            <div className={cn("text-sm font-medium", isHighlighted ? "text-foreground" : "text-muted")}>
              {stop.name}
              {isPickup && <span className="ml-2 text-xs uppercase bg-muted/20 px-1.5 py-0.5 rounded text-foreground">Pickup</span>}
              {isDropoff && <span className="ml-2 text-xs uppercase bg-muted/20 px-1.5 py-0.5 rounded text-foreground">Drop</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
