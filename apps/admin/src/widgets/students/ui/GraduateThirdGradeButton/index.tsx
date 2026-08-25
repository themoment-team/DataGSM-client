'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  buttonVariants,
} from '@repo/shared/ui';
import { cn } from '@repo/shared/utils';
import { toast } from 'sonner';

import { useGraduateThirdGrade } from '@/views/students/model/useGraduateThirdGrade';

const GraduateThirdGradeButton = () => {
  const { mutate: graduate, isPending } = useGraduateThirdGrade();

  const handleGraduate = () => {
    graduate(undefined, {
      onSuccess: () => {
        toast.success('3학년 전체 졸업 처리가 완료되었습니다.');
      },
      onError: () => {
        toast.error('졸업 처리에 실패했습니다. 다시 시도해주세요.');
      },
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="pixel-destructive"
          className={cn('px-3')}
          disabled={isPending}
        >
          3학년 전체 졸업
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className={cn('gap-0 p-0 sm:max-w-[656px]')}>
        <div
          className={cn(
            'bg-foreground text-background flex items-center justify-between px-4 py-3',
          )}
        >
          <span className={cn('font-pixel text-[9px] leading-none')}>Alert</span>
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
            정말 3학년 전체 졸업 기능을 실행할까요?
          </AlertDialogTitle>
          <AlertDialogDescription className={cn('text-destructive text-[13px] leading-[1.6]')}>
            &gt; 중요: 이 작업은 되돌릴 수 없습니다!
          </AlertDialogDescription>
        </div>

        <div className={cn('flex items-center gap-2.5 p-5')}>
          <AlertDialogCancel
            className={cn(buttonVariants({ variant: 'pixel' }), 'h-9 flex-1 px-3')}
          >
            취소
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleGraduate}
            className={cn(buttonVariants({ variant: 'pixel-destructive' }), 'h-9 flex-1 px-3')}
          >
            확인
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default GraduateThirdGradeButton;
