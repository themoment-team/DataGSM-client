import { AccountListItem } from '@repo/shared/types';
import {
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

const HEAD_ROW_STYLE =
  '[&>th]:px-5 [&>th]:py-1.5 [&>th]:font-sans [&>th]:text-[13px] [&>th]:font-normal [&>th]:normal-case [&>th]:tracking-normal';

const BODY_ROW_STYLE =
  'border-foreground [&>td]:px-5 [&>td]:py-3.5 [&>td]:font-mono [&>td]:text-xs [&>td]:text-muted-foreground';

const BADGE_STYLE =
  'inline-flex h-6 items-center border px-2 font-mono text-[11px] font-medium tracking-[0.1em]';

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
        <TableRow className={cn(HEAD_ROW_STYLE)}>
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
              <TableRow key={index} className={cn(BODY_ROW_STYLE)}>
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
              <TableRow key={account.id} className={cn(BODY_ROW_STYLE)}>
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
                    className={cn(
                      BADGE_STYLE,
                      'gap-1.5',
                      getAccountStatusBadgeStyle(account.status),
                    )}
                  >
                    <span className={cn('size-[6px] shrink-0 rounded-full bg-current')} />
                    {getAccountStatusLabel(account.status)}
                  </span>
                </TableCell>
                <TableCell>
                  {new Date(account.createdAt).toLocaleDateString('ko-KR', {
                    timeZone: 'Asia/Seoul',
                  })}
                </TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="pixel"
                    className={cn('h-6 border px-2')}
                    onClick={() => onSelect?.(account)}
                  >
                    Detail
                  </Button>
                </TableCell>
              </TableRow>
            ))}
      </TableBody>
    </Table>
  );
};

export default AccountList;
