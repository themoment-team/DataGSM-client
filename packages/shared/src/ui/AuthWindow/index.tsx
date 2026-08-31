import * as React from 'react';

import { cn } from '@repo/shared/utils';

interface AuthWindowProps {
  /** 타이틀바 오른쪽에 붙는 화면 이름. 시안과 동일하게 영문으로 전달한다. */
  windowLabel: string;
  /** 본문 상단 제목. */
  title: string;
  /** 제목 아래 안내 문구. */
  description?: React.ReactNode;
  /** 제출 중 상단 로딩 바와 본문 잠금 오버레이를 표시한다. */
  isPending?: boolean;
  children: React.ReactNode;
  className?: string;
}

/** 로그인·정보 변경 등 OAuth 화면이 공유하는 픽셀 창 셸. */
function AuthWindow({
  windowLabel,
  title,
  description,
  isPending = false,
  children,
  className,
}: AuthWindowProps) {
  return (
    <div
      className={cn(
        'border-foreground bg-background max-w-100 relative w-full border-2',
        className,
      )}
    >
      {isPending && (
        <div
          className={cn('absolute left-[-2px] right-[-2px] top-[-0.5rem] z-10 h-2 overflow-hidden')}
        >
          <div className={cn('animate-progress-bar-loading bg-foreground absolute h-full')} />
        </div>
      )}

      <div
        className={cn(
          'border-foreground bg-foreground flex items-center gap-3 border-b-2 px-4 py-3',
        )}
      >
        <div
          className={cn(
            'bg-background text-foreground font-pixel flex size-6 flex-shrink-0 items-center justify-center text-[8px]',
          )}
        >
          D
        </div>
        <span className={cn('text-background font-pixel text-[9px]')}>DataGSM</span>
        <span className={cn('text-background font-pixel text-[9px]')}>{windowLabel}</span>
      </div>

      <div className={cn('relative')}>
        {isPending && (
          <div className={cn('bg-background/50 absolute inset-0 z-20 cursor-not-allowed')} />
        )}

        <div className={cn('border-border/50 flex flex-col gap-2 border-b p-5')}>
          <h1 className={cn('text-foreground text-xl font-semibold leading-[1.45]')}>{title}</h1>
          {description && (
            <div className={cn('text-muted-foreground text-xs leading-[18px]')}>{description}</div>
          )}
        </div>

        {children}
      </div>
    </div>
  );
}

export { AuthWindow };
