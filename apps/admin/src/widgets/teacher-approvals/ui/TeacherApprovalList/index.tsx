import { AccountListItem } from '@repo/shared/types';
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
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/shared/ui';
import { cn } from '@repo/shared/utils';

import { getTeacherDepartmentLabel } from '@/entities/account';

interface TeacherApprovalListProps {
  accounts?: AccountListItem[];
  isLoading?: boolean;
  isApproving?: boolean;
  onApprove?: (accountId: number) => void;
}

const HEAD_ROW_STYLE =
  '[&>th]:px-5 [&>th]:py-1.5 [&>th]:font-sans [&>th]:text-[13px] [&>th]:font-normal [&>th]:normal-case [&>th]:tracking-normal';

const BODY_ROW_STYLE =
  'border-foreground [&>td]:px-5 [&>td]:py-3.5 [&>td]:font-mono [&>td]:text-xs [&>td]:text-muted-foreground';

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
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          type="button"
                          variant="pixel"
                          className={cn('h-6 border px-2')}
                          disabled={isApproving}
                        >
                          Allow
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>선생님 계정 승인</AlertDialogTitle>
                          <AlertDialogDescription>
                            {account.teacher?.name ?? account.email} 님의 선생님 계정을
                            승인하시겠습니까? 승인 후에는 되돌릴 수 없습니다.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>취소</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onApprove?.(account.id)}>
                            승인
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    {/* TODO: 선생님 역할 신청 거절(계정 삭제) API 연동 (현재는 시안 반영용 UI) */}
                    <Button
                      type="button"
                      variant="pixel-destructive"
                      className={cn('h-6 border px-2')}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
      </TableBody>
    </Table>
  );
};

export default TeacherApprovalList;
