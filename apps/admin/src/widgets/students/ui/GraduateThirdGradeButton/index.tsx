'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
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
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>3학년 전체 졸업 처리</AlertDialogTitle>
          <AlertDialogDescription>
            정말로 3학년 전체 학생을 졸업 처리하시겠습니까? 이 작업은 되돌릴 수 없으며, 모든 3학년
            학생의 상태가 졸업으로 변경됩니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleGraduate}
            className={cn('bg-red-600 hover:bg-red-700 focus:ring-red-600')}
          >
            졸업 처리
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default GraduateThirdGradeButton;
