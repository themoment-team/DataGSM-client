'use client';

import { useEffect, useState } from 'react';

import {
  STUDENT_DATA_EDIT_FIELDS,
  STUDENT_DATA_EDIT_FIELD_LABEL,
  StudentDataEditField,
} from '@repo/shared/constants';
import { Student } from '@repo/shared/types';
import {
  Button,
  Checkbox,
  ConfirmDialog,
  Dialog,
  DialogWindow,
  GradeMemberPicker,
} from '@repo/shared/ui';
import { cn } from '@repo/shared/utils';

/** 대상 학생을 확인한 뒤 초기화할 컬럼을 고른다. */
type ColumnRefreshStep = 'students' | 'fields';

interface ColumnRefreshDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 초기화 대상으로 고른 학생. 페이지를 넘겨가며 고른 학생까지 모두 담긴다. */
  students: Student[];
  onConfirm: (fields: StudentDataEditField[]) => void;
}

const ColumnRefreshDialog = ({
  open,
  onOpenChange,
  students,
  onConfirm,
}: ColumnRefreshDialogProps) => {
  const [step, setStep] = useState<ColumnRefreshStep>('students');
  const [selectedFields, setSelectedFields] = useState<StudentDataEditField[]>([]);

  // X·ESC·바깥 클릭 어느 쪽으로 닫혀도 다음에 열 때는 첫 단계부터 시작한다.
  useEffect(() => {
    if (open) return;

    setStep('students');
    setSelectedFields([]);
  }, [open]);

  const toggleField = (field: StudentDataEditField) => {
    setSelectedFields((previous) =>
      previous.includes(field)
        ? previous.filter((selected) => selected !== field)
        : [...previous, field],
    );
  };

  // 고른 순서가 아니라 화면에 놓인 순서로 읽히도록 정렬한다.
  const selectedLabels = STUDENT_DATA_EDIT_FIELDS.filter((field) =>
    selectedFields.includes(field),
  ).map((field) => STUDENT_DATA_EDIT_FIELD_LABEL[field]);

  /** 컬럼을 고르는 단계에서는 무엇이 초기화되는지 설명 문구에 드러낸다. */
  const description =
    step === 'fields' && selectedLabels.length ? (
      <>
        선택한 학생들의{' '}
        <strong className={cn('text-foreground font-bold')}>{selectedLabels.join(', ')}</strong>{' '}
        컬럼을 초기화하고 로그인 과정 때 정보를 받도록 설정합니다.
      </>
    ) : (
      '선택한 학생들의 컬럼을 초기화하고 로그인 과정 때 정보를 받도록 설정합니다.'
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogWindow windowTitle="Column Refresh" heading="컬럼 초기화" description={description}>
        {step === 'students' ? (
          <div className={cn('flex flex-col gap-1.5 p-5')}>
            <p className={cn('text-foreground text-sm font-medium')}>선택된 학생</p>
            {/* 확인 화면이라 제거 버튼 없이 읽기 전용으로 보여준다. */}
            <GradeMemberPicker students={students} selectedIds={students.map(({ id }) => id)} />
          </div>
        ) : (
          <div className={cn('flex flex-col gap-2 p-5')}>
            <p className={cn('text-foreground text-sm font-medium')}>컬럼 선택</p>
            <div className={cn('grid grid-cols-2 gap-1')}>
              {STUDENT_DATA_EDIT_FIELDS.map((field) => {
                const label = STUDENT_DATA_EDIT_FIELD_LABEL[field];
                const isSelected = selectedFields.includes(field);

                return (
                  <label
                    key={field}
                    htmlFor={field}
                    className={cn(
                      'flex cursor-pointer items-center gap-6 px-4 py-3 transition-colors',
                      // 고른 항목은 명암을 뒤집어 표시한다.
                      isSelected && 'bg-foreground',
                    )}
                  >
                    <Checkbox
                      id={field}
                      checked={isSelected}
                      onCheckedChange={() => toggleField(field)}
                      className={cn('size-6', isSelected && 'border-background')}
                    />
                    <span className={cn('flex flex-col gap-2')}>
                      <span
                        className={cn(
                          'text-sm font-medium',
                          isSelected ? 'text-background' : 'text-foreground',
                        )}
                      >
                        {label}
                      </span>
                      <span
                        className={cn(
                          'text-xs',
                          isSelected ? 'text-background/70' : 'text-muted-foreground',
                        )}
                      >
                        {label} 정보를 null로 변경
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        <div className={cn('flex gap-1 p-5')}>
          <Button
            type="button"
            variant="pixel"
            size="lg"
            className={cn('flex-1')}
            onClick={() => (step === 'students' ? onOpenChange(false) : setStep('students'))}
          >
            이전으로
          </Button>
          {step === 'students' ? (
            <Button
              type="button"
              variant="pixel-solid"
              size="lg"
              className={cn('flex-1')}
              onClick={() => setStep('fields')}
            >
              Column Refresh
            </Button>
          ) : (
            /* 되돌릴 수 없는 작업이라 실행 직전에 한 번 더 확인받는다. */
            <ConfirmDialog
              trigger={
                <Button
                  type="button"
                  variant="pixel-solid"
                  size="lg"
                  className={cn('flex-1')}
                  disabled={!selectedFields.length}
                >
                  Next
                </Button>
              }
              title="선택된 학생들의 컬럼 초기화를 진행할까요?"
              warning="> 중요: 이 작업은 되돌릴 수 없습니다! 학생과 컬럼을 제대로 선택했는지 다시 한 번 확인하세요."
              onConfirm={() => onConfirm(selectedFields)}
            />
          )}
        </div>
      </DialogWindow>
    </Dialog>
  );
};

export default ColumnRefreshDialog;
