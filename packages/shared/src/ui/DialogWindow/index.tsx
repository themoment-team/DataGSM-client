import * as React from 'react';

import { DialogClose, DialogContent, DialogDescription, DialogTitle } from '@repo/shared/ui';
import { cn } from '@repo/shared/utils';

interface DialogWindowProps extends Omit<React.ComponentProps<typeof DialogContent>, 'title'> {
  /** 타이틀바에 표시되는 이름. 접근성 제목으로도 사용된다. */
  windowTitle: string;
  /** 본문 상단 제목. 없으면 제목 블록을 그리지 않는다. */
  heading?: string;
  /** 본문 상단 설명. heading 없이 전달하면 스크린리더 전용으로만 제공된다. */
  description?: React.ReactNode;
  children: React.ReactNode;
}

function DialogWindow({
  windowTitle,
  heading,
  description,
  className,
  children,
  ...props
}: DialogWindowProps) {
  return (
    <DialogContent
      showCloseButton={false}
      className={cn(
        'border-foreground max-h-[90vh] gap-0 overflow-y-auto border-2 p-0 sm:max-w-[656px]',
        className,
      )}
      {...props}
    >
      <div
        className={cn('bg-foreground text-background flex items-center justify-between px-4 py-3')}
      >
        <DialogTitle className={cn('font-pixel text-[9px] font-normal leading-none')}>
          {windowTitle}
        </DialogTitle>
        <DialogClose
          className={cn(
            'flex h-6 cursor-pointer items-center justify-center px-2 font-mono text-xs leading-4 tracking-[0.1em] transition-opacity hover:opacity-70',
          )}
        >
          X<span className={cn('sr-only')}>닫기</span>
        </DialogClose>
      </div>

      {heading ? (
        <div className={cn('flex flex-col gap-1 px-5 pt-4')}>
          <p className={cn('text-foreground text-base font-semibold leading-[1.45]')}>{heading}</p>
          <DialogDescription className={cn('text-muted-foreground text-[13px] leading-[1.6]')}>
            {description}
          </DialogDescription>
        </div>
      ) : (
        <DialogDescription className={cn('sr-only')}>
          {description ?? windowTitle}
        </DialogDescription>
      )}

      {children}
    </DialogContent>
  );
}

export { DialogWindow };
