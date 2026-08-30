'use client';

import { Student } from '@repo/shared/types';
import { Button, Dialog, DialogWindow, GradeMemberPicker } from '@repo/shared/ui';
import { cn } from '@repo/shared/utils';

interface ColumnRefreshDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 초기화 대상으로 고른 학생. 페이지를 넘겨가며 고른 학생까지 모두 담긴다. */
  students: Student[];
  onConfirm: () => void;
}

/** 컬럼 초기화 대상을 학년별로 다시 보여주고 확인받는다. */
const ColumnRefreshDialog = ({
  open,
  onOpenChange,
  students,
  onConfirm,
}: ColumnRefreshDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogWindow
      windowTitle="Column Refresh"
      heading="컬럼 초기화"
      description="선택한 학생들의 컬럼을 초기화하고 로그인 과정 때 정보를 받도록 설정합니다."
    >
      <div className={cn('flex flex-col gap-1.5 p-5')}>
        <p className={cn('text-foreground text-sm font-medium')}>선택된 학생</p>
        {/* 확인 화면이라 제거 버튼 없이 읽기 전용으로 보여준다. */}
        <GradeMemberPicker students={students} selectedIds={students.map(({ id }) => id)} />
      </div>

      <div className={cn('flex gap-1 p-5')}>
        <Button
          type="button"
          variant="pixel"
          size="lg"
          className={cn('flex-1')}
          onClick={() => onOpenChange(false)}
        >
          이전으로
        </Button>
        <Button
          type="button"
          variant="pixel-solid"
          size="lg"
          className={cn('flex-1')}
          onClick={onConfirm}
        >
          Column Refresh
        </Button>
      </div>
    </DialogWindow>
  </Dialog>
);

export default ColumnRefreshDialog;
