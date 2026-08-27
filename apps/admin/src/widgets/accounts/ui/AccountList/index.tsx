import { AccountListItem } from '@repo/shared/types';
import {
  Button,
  Skeleton,
  TABLE_BODY_ROW_STYLE,
  TABLE_HEAD_ROW_STYLE,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/shared/ui';
import { cn } from '@repo/shared/utils';

import {
  getAccountObjectTypeLabel,
  getAccountRoleBadgeStyle,
  getAccountRoleLabel,
  getAccountStatusBadgeStyle,
  getAccountStatusDotStyle,
  getAccountStatusLabel,
} from '@/entities/account';

interface AccountListProps {
  accounts?: AccountListItem[];
  isLoading?: boolean;
  onSelect?: (account: AccountListItem) => void;
}

const BADGE_STYLE =
  'inline-flex h-6 items-center border px-2 font-mono text-[11px] font-medium tracking-[0.1em]';

const STATUS_BADGE_STYLE =
  'inline-flex h-6 items-center gap-1.5 border px-2 font-sans text-xs font-medium';

const formatCreatedAt = (value: string | Date) => {
  const [year, month, day] = new Date(value)
    .toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' })
    .split('-');

  return `${year}.${month}.${day}`;
};

const AccountList = ({ accounts, isLoading, onSelect }: AccountListProps) => {
  if (!isLoading && !accounts?.length) {
    return (
      <p className={cn('text-muted-foreground py-12 text-center font-mono text-xs')}>
        조건에 맞는 계정이 없습니다.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className={cn(TABLE_HEAD_ROW_STYLE)}>
          <TableHead className={cn('w-[100px]')}>ID</TableHead>
          <TableHead className={cn('w-[320px]')}>이메일</TableHead>
          <TableHead className={cn('w-[140px]')}>역할</TableHead>
          <TableHead className={cn('w-[140px]')}>종류</TableHead>
          <TableHead className={cn('w-[140px]')}>상태</TableHead>
          <TableHead>생성일</TableHead>
          <TableHead className={cn('w-[100px]')}>
            <span className={cn('sr-only')}>작업</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading
          ? Array.from({ length: 10 }).map((_, index) => (
              <TableRow key={index} className={cn(TABLE_BODY_ROW_STYLE)}>
                <TableCell>
                  <Skeleton className={cn('h-4 w-8')} />
                </TableCell>
                <TableCell>
                  <Skeleton className={cn('h-4 w-40')} />
                </TableCell>
                <TableCell>
                  <Skeleton className={cn('h-6 w-16')} />
                </TableCell>
                <TableCell>
                  <Skeleton className={cn('h-4 w-12')} />
                </TableCell>
                <TableCell>
                  <Skeleton className={cn('h-6 w-16')} />
                </TableCell>
                <TableCell>
                  <Skeleton className={cn('h-4 w-24')} />
                </TableCell>
                <TableCell>
                  <Skeleton className={cn('h-6 w-14')} />
                </TableCell>
              </TableRow>
            ))
          : accounts?.map((account) => (
              <TableRow key={account.id} className={cn(TABLE_BODY_ROW_STYLE)}>
                <TableCell>{account.id}</TableCell>
                <TableCell>{account.email}</TableCell>
                <TableCell>
                  <span className={cn(BADGE_STYLE, getAccountRoleBadgeStyle(account.role))}>
                    {getAccountRoleLabel(account.role)}
                  </span>
                </TableCell>
                <TableCell>{getAccountObjectTypeLabel(account.objectType)}</TableCell>
                <TableCell>
                  <span
                    className={cn(STATUS_BADGE_STYLE, getAccountStatusBadgeStyle(account.status))}
                  >
                    <span
                      className={cn(
                        'size-2.5 shrink-0 rounded-full',
                        getAccountStatusDotStyle(account.status),
                      )}
                    />
                    {getAccountStatusLabel(account.status)}
                  </span>
                </TableCell>
                <TableCell>{formatCreatedAt(account.createdAt)}</TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="pixel"
                    className={cn('h-6 border px-2')}
                    onClick={() => onSelect?.(account)}
                  >
                    detail
                  </Button>
                </TableCell>
              </TableRow>
            ))}
      </TableBody>
    </Table>
  );
};

export default AccountList;
