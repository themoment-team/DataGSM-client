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

const TeacherApprovalList = ({
  accounts,
  isLoading,
  isApproving,
  onApprove,
}: TeacherApprovalListProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>이메일</TableHead>
          <TableHead>성함</TableHead>
          <TableHead>소속 부서</TableHead>
          <TableHead>설명</TableHead>
          <TableHead>신청일</TableHead>
          <TableHead className={cn('w-30')}>작업</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          Array.from({ length: 10 }).map((_, index) => (
            <TableRow key={index}>
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
                <Skeleton className={cn('h-8 w-16')} />
              </TableCell>
            </TableRow>
          ))
        ) : !accounts?.length ? (
          <TableRow>
            <TableCell
              colSpan={6}
              className={cn('text-muted-foreground py-12 text-center font-mono text-sm')}
            >
              승인 대기 중인 선생님 계정이 없습니다.
            </TableCell>
          </TableRow>
        ) : (
          accounts.map((account) => (
            <TableRow key={account.id}>
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
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" disabled={isApproving}>
                      승인
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
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default TeacherApprovalList;
