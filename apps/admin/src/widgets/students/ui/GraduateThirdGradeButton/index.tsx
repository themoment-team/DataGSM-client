'use client';

import { Button, ConfirmDialog } from '@repo/shared/ui';
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
    <ConfirmDialog
      trigger={
        <Button
          type="button"
          variant="pixel-destructive"
          className={cn('px-3')}
          disabled={isPending}
        >
          3학년 전체 졸업
        </Button>
      }
      title="정말 3학년 전체 졸업 기능을 실행할까요?"
      warning="> 중요: 이 작업은 되돌릴 수 없습니다!"
      onConfirm={handleGraduate}
    />
  );
};

export default GraduateThirdGradeButton;
