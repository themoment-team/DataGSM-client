import type { ReactNode } from 'react';

import { AccountListItem } from '@repo/shared/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  buttonVariants,
} from '@repo/shared/ui';
import { cn } from '@repo/shared/utils';

import { getTeacherDepartmentLabel } from '@/entities/account';

interface TeacherApprovalListProps {
  accounts?: AccountListItem[];
  isLoading?: boolean;
  isApproving?: boolean;
  onApprove?: (accountId: number) => void;
}

interface TeacherApprovalConfirmDialogProps {
  trigger: ReactNode;
  title: string;
  /** 시안에 경고 문구가 있는 경우에만 노출한다. 없으면 스크린리더용으로만 제공한다. */
  warning?: string;
  description: string;
  confirmLabel: string;
  confirmVariant: 'pixel-primary' | 'pixel-destructive';
  onConfirm?: () => void;
}

const HEAD_ROW_STYLE =
  '[&>th]:px-5 [&>th]:py-1.5 [&>th]:font-sans [&>th]:text-[13px] [&>th]:font-normal [&>th]:normal-case [&>th]:tracking-normal';

const BODY_ROW_STYLE =
  'border-foreground [&>td]:px-5 [&>td]:py-3.5 [&>td]:font-mono [&>td]:text-xs [&>td]:text-muted-foreground';

const TeacherApprovalConfirmDialog = ({
  trigger,
  title,
  warning,
  description,
  confirmLabel,
  confirmVariant,
  onConfirm,
}: TeacherApprovalConfirmDialogProps) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
    <AlertDialogContent className={cn('gap-0 p-0 sm:max-w-[656px]')}>
      <div
        className={cn('bg-foreground text-background flex items-center justify-between px-4 py-3')}
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
          {title}
        </AlertDialogTitle>
        <AlertDialogDescription
          className={cn(warning ? 'text-destructive text-[13px] leading-[1.6]' : 'sr-only')}
        >
          {warning ?? description}
        </AlertDialogDescription>
      </div>

      <div className={cn('flex items-center gap-2.5 p-5')}>
        <AlertDialogCancel className={cn(buttonVariants({ variant: 'pixel' }), 'h-9 flex-1 px-3')}>
          취소
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

const TeacherApprovalList = ({
  accounts,
  isLoading,
  isApproving,
  onApprove,
}: TeacherApprovalListProps) => {
  if (!isLoading && !accounts?.length) {
    return (
      <p className={cn('text-muted-foreground py-12 text-center font-mono text-xs')}>
        승인 대기 중인 선생님 계정이 없습니다.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className={cn(HEAD_ROW_STYLE)}>
          <TableHead className={cn('w-[240px]')}>이메일</TableHead>
          <TableHead className={cn('w-[120px]')}>성함</TableHead>
          <TableHead className={cn('w-[120px]')}>소속부서</TableHead>
          <TableHead>설명</TableHead>
          <TableHead className={cn('w-[160px]')}>신청일</TableHead>
          <TableHead className={cn('w-[170px]')}>
            <span className={cn('sr-only')}>작업</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading
          ? Array.from({ length: 10 }).map((_, index) => (
              <TableRow key={index} className={cn(BODY_ROW_STYLE)}>
                <TableCell>
                  <Skeleton className={cn('h-4 w-40')} />
                </TableCell>
                <TableCell>
                  <Skeleton className={cn('h-4 w-16')} />
                </TableCell>
                <TableCell>
                  <Skeleton className={cn('h-4 w-20')} />
                </TableCell>
                <TableCell>
                  <Skeleton className={cn('h-4 w-32')} />
                </TableCell>
                <TableCell>
                  <Skeleton className={cn('h-4 w-24')} />
                </TableCell>
                <TableCell>
                  <Skeleton className={cn('h-6 w-32')} />
                </TableCell>
              </TableRow>
            ))
          : accounts?.map((account) => (
              <TableRow key={account.id} className={cn(BODY_ROW_STYLE)}>
                <TableCell>{account.email}</TableCell>
                <TableCell>{account.teacher?.name ?? '-'}</TableCell>
                <TableCell>
                  {account.teacher ? getTeacherDepartmentLabel(account.teacher.department) : '-'}
                </TableCell>
                <TableCell>{account.teacher?.description || '-'}</TableCell>
                <TableCell>
                  {new Date(account.createdAt).toLocaleDateString('ko-KR', {
                    timeZone: 'Asia/Seoul',
                  })}
                </TableCell>
                <TableCell>
                  <div className={cn('flex items-center gap-2')}>
                    <TeacherApprovalConfirmDialog
                      trigger={
                        <Button
                          type="button"
                          variant="pixel"
                          className={cn('h-6 border px-2')}
                          disabled={isApproving}
                        >
                          Allow
                        </Button>
                      }
                      title={`“${account.email}”의 요청을 허락할까요?`}
                      description="승인 후에는 되돌릴 수 없습니다."
                      confirmLabel="확인"
                      confirmVariant="pixel-primary"
                      onConfirm={() => onApprove?.(account.id)}
                    />

                    {/* TODO: 선생님 역할 신청 거절(계정 삭제) API 연동 (현재는 시안 반영용 UI) */}
                    <TeacherApprovalConfirmDialog
                      trigger={
                        <Button
                          type="button"
                          variant="pixel-destructive"
                          className={cn('h-6 border px-2')}
                        >
                          Delete
                        </Button>
                      }
                      title={`“${account.email}”의 요청을 거절할까요?`}
                      warning="> 중요: 거절하면 해당 계정은 삭제되며 되돌릴 수 없습니다!"
                      description="거절하면 해당 계정은 삭제되며 되돌릴 수 없습니다."
                      confirmLabel="확인"
                      confirmVariant="pixel-destructive"
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
      </TableBody>
    </Table>
  );
};

export default TeacherApprovalList;
