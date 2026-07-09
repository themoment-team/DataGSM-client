import { AccountListItem } from '@repo/shared/types';
import {
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/shared/ui';
import { cn } from '@repo/shared/utils';

import { getAccountRoleBadgeStyle, getAccountRoleLabel } from '@/entities/account';

interface AccountListProps {
  accounts?: AccountListItem[];
  isLoading?: boolean;
  onSelect?: (account: AccountListItem) => void;
}

const AccountList = ({ accounts, isLoading, onSelect }: AccountListProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>이메일</TableHead>
          <TableHead>역할</TableHead>
          <TableHead>학생 연동</TableHead>
          <TableHead>생성일</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading
          ? Array.from({ length: 10 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className={cn('h-4 w-8')} />
                </TableCell>
                <TableCell>
                  <Skeleton className={cn('h-4 w-40')} />
                </TableCell>
                <TableCell>
                  <Skeleton className={cn('h-5 w-16')} />
                </TableCell>
                <TableCell>
                  <Skeleton className={cn('h-4 w-12')} />
                </TableCell>
                <TableCell>
                  <Skeleton className={cn('h-4 w-24')} />
                </TableCell>
              </TableRow>
            ))
          : accounts?.map((account) => (
              <TableRow
                key={account.id}
                className={cn('cursor-pointer')}
                onClick={() => onSelect?.(account)}
              >
                <TableCell>{account.id}</TableCell>
                <TableCell>{account.email}</TableCell>
                <TableCell>
                  <span
                    className={cn(
                      'border px-1.5 py-0.5 text-xs font-mono uppercase',
                      getAccountRoleBadgeStyle(account.role),
                    )}
                  >
                    {getAccountRoleLabel(account.role)}
                  </span>
                </TableCell>
                <TableCell>{account.isStudent ? '연동됨' : '미연동'}</TableCell>
                <TableCell>
                  {new Date(account.createdAt).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' })}
                </TableCell>
              </TableRow>
            ))}
      </TableBody>
    </Table>
  );
};

export default AccountList;
