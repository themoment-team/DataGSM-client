import * as React from 'react';

import { cn } from '@repo/shared/utils';

interface PageTitleBarProps {
  /** 페이지 이름. 시안과 동일하게 대문자로 전달한다. */
  title: string;
  description: string;
  className?: string;
}

function PageTitleBar({ title, description, className }: PageTitleBarProps) {
  return (
    <div
      className={cn(
        'flex min-h-[72px] flex-wrap items-center gap-x-6 gap-y-1 font-mono',
        className,
      )}
    >
      <p className={cn('text-foreground text-2xl leading-none')}>{title}</p>
      <p className={cn('text-muted-foreground text-[13px] leading-[2]')}>{description}</p>
    </div>
  );
}

export { PageTitleBar };
