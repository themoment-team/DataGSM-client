import { AccountListItem } from '@repo/shared/types';
import {
  PixelIconButton,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/shared/ui';
import { cn } from '@repo/shared/utils';
import { Pencil } from 'lucide-react';

import {
  getAccountObjectTypeLabel,
  getAccountRoleBadgeStyle,
  getAccountRoleLabel,
  getAccountStatusBadgeStyle,
  getAccountStatusLabel,
} from '@/entities/account';

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
          <TableHead>종류</TableHead>
          <TableHead>상태</TableHead>
          <TableHead>생성일</TableHead>
          <TableHead className={cn('w-30')}>작업</TableHead>
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
                  <Skeleton className={cn('h-5 w-16')} />
                </TableCell>
                <TableCell>
                  <Skeleton className={cn('h-4 w-24')} />
                </TableCell>
                <TableCell>
                  <Skeleton className={cn('h-8 w-8')} />
                </TableCell>
              </TableRow>
            ))
          : accounts?.map((account) => (
              <TableRow key={account.id}>
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
                <TableCell>{getAccountObjectTypeLabel(account.objectType)}</TableCell>
                <TableCell>
                  <span
                    className={cn(
                      'border px-1.5 py-0.5 text-xs font-mono uppercase',
                      getAccountStatusBadgeStyle(account.status),
                    )}
                  >
                    {getAccountStatusLabel(account.status)}
                  </span>
                </TableCell>
                <TableCell>
                  {new Date(account.createdAt).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' })}
                </TableCell>
                <TableCell>
                  <PixelIconButton onClick={() => onSelect?.(account)}>
                    <Pencil className={cn('h-3.5 w-3.5')} />
                  </PixelIconButton>
                </TableCell>
              </TableRow>
            ))}
      </TableBody>
    </Table>
  );
};

export default AccountList;
