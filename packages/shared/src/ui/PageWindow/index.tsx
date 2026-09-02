import * as React from 'react';

import { cn } from '@repo/shared/utils';

interface PageWindowProps {
  windowTitle: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

function PageWindow({
  windowTitle,
  title,
  description,
  action,
  children,
  className,
}: PageWindowProps) {
  return (
    <div className={cn('bg-background border-foreground flex flex-col border-2', className)}>
      <div className={cn('bg-foreground text-background flex items-center px-4 py-3')}>
        <span className={cn('font-pixel text-[9px] leading-none')}>{windowTitle}</span>
      </div>

      <div className={cn('flex items-start justify-end gap-2 px-5 pt-4')}>
        <div className={cn('flex flex-1 flex-col gap-1')}>
          <h1 className={cn('text-foreground text-base font-semibold leading-[1.45]')}>{title}</h1>
          {description && (
            <p className={cn('text-muted-foreground text-[13px] leading-[1.6]')}>{description}</p>
          )}
        </div>
        {action && (
          <div className={cn('flex flex-wrap items-center justify-end gap-2')}>{action}</div>
        )}
      </div>

      <div className={cn('p-5')}>{children}</div>
    </div>
  );
}

export { PageWindow };
