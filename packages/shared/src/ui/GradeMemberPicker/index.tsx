'use client';

import { Student } from '@repo/shared/types';
import { cn } from '@repo/shared/utils';

const GRADES = [1, 2, 3];

interface GradeMemberPickerProps {
  students?: Student[];
  selectedIds: number[];
  /** 넘기지 않으면 제거 버튼 없이 읽기 전용 명단이 된다. */
  onRemove?: (studentId: number) => void;
  className?: string;
}

/** 선택된 학생을 학년별 카드로 나눠 보여준다. onRemove를 주면 개별 제거도 지원한다. */
const GradeMemberPicker = ({
  students,
  selectedIds,
  onRemove,
  className,
}: GradeMemberPickerProps) => {
  const selectedStudents = students?.filter((student) => selectedIds.includes(student.id)) || [];

  return (
    <div className={cn('flex items-stretch gap-2', className)}>
      {GRADES.map((grade) => (
        <div
          key={grade}
          className={cn('border-foreground bg-background flex flex-1 flex-col border')}
        >
          <div className={cn('bg-foreground flex items-center px-4 py-3')}>
            <span className={cn('text-background font-pixel text-[9px] leading-none')}>
              Grade {grade}
            </span>
          </div>
          <div
            className={cn(
              'bg-foreground text-background flex items-center px-5 py-1.5 text-[13px] leading-[1.6]',
            )}
          >
            <span className={cn('w-[60px] shrink-0')}>학번</span>
            <span className={cn('flex-1')}>이름</span>
          </div>
          <div className={cn('max-h-[160px] min-h-[80px] overflow-y-auto')}>
            {selectedStudents
              .filter((student) => student.grade === grade)
              .map((student) => (
                <div
                  key={student.id}
                  className={cn(
                    'border-foreground -mt-px flex items-center gap-2 border px-5 py-2 first:mt-0',
                  )}
                >
                  <span
                    className={cn(
                      'text-muted-foreground w-[60px] shrink-0 truncate font-mono text-xs leading-6',
                    )}
                  >
                    {student.studentNumber}
                  </span>
                  <span
                    className={cn(
                      'text-muted-foreground min-w-0 flex-1 truncate font-mono text-xs leading-6',
                    )}
                  >
                    {student.name}
                  </span>
                  {onRemove && (
                    <button
                      type="button"
                      className={cn(
                        'text-foreground shrink-0 cursor-pointer px-2 font-mono text-xs leading-4 tracking-[0.1em] transition-opacity hover:opacity-60',
                      )}
                      onClick={() => onRemove(student.id)}
                    >
                      X<span className={cn('sr-only')}>{student.name} 제외</span>
                    </button>
                  )}
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export { GradeMemberPicker };
export type { GradeMemberPickerProps };
