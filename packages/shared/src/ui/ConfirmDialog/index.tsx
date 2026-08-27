'use client';

import * as React from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
  buttonVariants,
} from '@repo/shared/ui';
import { cn } from '@repo/shared/utils';

interface ConfirmDialogProps {
  trigger: React.ReactNode;
  /** 타이틀바에 표시되는 이름. */
  windowTitle?: string;
  title: string;
  /** 시안에 경고 문구가 있는 경우에만 노출한다. 없으면 description이 스크린리더 전용으로 제공된다. */
  warning?: string;
  description?: string;
  cancelLabel?: string;
  confirmLabel?: string;
  confirmVariant?: 'pixel-primary' | 'pixel-destructive';
  onConfirm?: () => void;
  onOpenChange?: (open: boolean) => void;
  /** 제목 아래에 들어가는 추가 입력 영역. */
  children?: React.ReactNode;
  className?: string;
}

function ConfirmDialog({
  trigger,
  windowTitle = 'Alert',
  title,
  warning,
  description,
  cancelLabel = '취소',
  confirmLabel = '확인',
  confirmVariant = 'pixel-destructive',
  onConfirm,
  onOpenChange,
  children,
  className,
}: ConfirmDialogProps) {
  return (
    <AlertDialog onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className={cn('gap-0 p-0 sm:max-w-[656px]', className)}>
        <div
          className={cn(
            'bg-foreground text-background flex items-center justify-between px-4 py-3',
          )}
        >
          <span className={cn('font-pixel text-[9px] leading-none')}>{windowTitle}</span>
          <AlertDialogCancel
            className={cn(
              buttonVariants({ variant: 'pixel-primary' }),
              'text-background h-6 border-0 px-2',
            )}
          >
            X<span className={cn('sr-only')}>닫기</span>
          </AlertDialogCancel>
        </div>

        <div className={cn('flex flex-col gap-1 px-5 pt-5')}>
          <AlertDialogTitle className={cn('text-foreground text-xl font-semibold leading-[1.45]')}>
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription
            className={cn(warning ? 'text-destructive text-[13px] leading-[1.6]' : 'sr-only')}
          >
            {warning ?? description ?? title}
          </AlertDialogDescription>
        </div>

        {children && <div className={cn('flex flex-col gap-1.5 px-5 pt-4')}>{children}</div>}

        <div className={cn('flex items-center gap-2.5 p-5')}>
          <AlertDialogCancel
            className={cn(buttonVariants({ variant: 'pixel' }), 'h-9 flex-1 px-3')}
          >
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={cn(buttonVariants({ variant: confirmVariant }), 'h-9 flex-1 px-3')}
          >
            {confirmLabel}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { ConfirmDialog };
