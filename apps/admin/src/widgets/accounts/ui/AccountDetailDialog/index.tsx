'use client';

import { useEffect, useState } from 'react';

import { AccountListItem } from '@repo/shared/types';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/shared/ui';
import { cn } from '@repo/shared/utils';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { getAccountRoleBadgeStyle, getAccountRoleLabel } from '@/entities/account';
import { useGetMyAccountId } from '@/entities/signin';
import { getMajorLabel, getRoleBadgeStyle, getRoleLabel, getSexLabel } from '@/entities/student';
import { useUpdateAccountRole } from '@/widgets/accounts';

interface AccountDetailDialogProps {
  account: AccountListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AccountDetailDialog = ({ account, open, onOpenChange }: AccountDetailDialogProps) => {
  const queryClient = useQueryClient();
  const { data: myAccountId } = useGetMyAccountId();
  const [selectedRole, setSelectedRole] = useState<'ADMIN' | 'USER'>('USER');

  useEffect(() => {
    if (open && account && (account.role === 'ADMIN' || account.role === 'USER')) {
      setSelectedRole(account.role);
    }
  }, [account, open]);

  const { mutate: updateRole, isPending } = useUpdateAccountRole({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('계정 권한이 변경되었습니다.');
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('계정 권한 변경 실패:', error);
      toast.error('계정 권한 변경에 실패했습니다.');
    },
  });

  if (!account) return null;

  const student = account.student;
  const isRoleChangeDisabled = account.role === 'ROOT' || account.id === myAccountId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('max-h-[90vh] max-w-lg overflow-y-auto p-0')}>
        <DialogHeader className={cn('border-foreground border-b-2 px-6 py-5')}>
          <DialogTitle className={cn('font-pixel text-[14px] leading-none')}>ACCOUNT DETAIL</DialogTitle>
        </DialogHeader>

        <div className={cn('space-y-6 px-6 py-6')}>
          <div className={cn('space-y-2')}>
            <div className={cn('flex items-center justify-between')}>
              <span className={cn('text-muted-foreground font-mono text-xs uppercase tracking-widest')}>
                이메일
              </span>
              <span className={cn('font-mono text-sm')}>{account.email}</span>
            </div>
            <div className={cn('flex items-center justify-between')}>
              <span className={cn('text-muted-foreground font-mono text-xs uppercase tracking-widest')}>
                현재 역할
              </span>
              <span
                className={cn(
                  'border px-1.5 py-0.5 text-xs font-mono uppercase',
                  getAccountRoleBadgeStyle(account.role),
                )}
              >
                {getAccountRoleLabel(account.role)}
              </span>
            </div>
            <div className={cn('flex items-center justify-between')}>
              <span className={cn('text-muted-foreground font-mono text-xs uppercase tracking-widest')}>
                생성일
              </span>
              <span className={cn('font-mono text-sm')}>
                {new Date(account.createdAt).toLocaleString('ko-KR')}
              </span>
            </div>
          </div>

          <div className={cn('border-foreground/20 border-t pt-4')}>
            <p className={cn('text-muted-foreground mb-2 font-mono text-xs uppercase tracking-widest')}>
              연동된 학생 정보
            </p>
            {student ? (
              <div
                className={cn(
                  'border-foreground grid grid-cols-2 gap-x-4 gap-y-2 border p-4 font-mono text-sm',
                )}
              >
                <span>이름: {student.name}</span>
                <span>성별: {getSexLabel(student.sex)}</span>
                <span>학번: {student.studentNumber}</span>
                <span>학과: {getMajorLabel(student.major)}</span>
                <span className={cn('col-span-2')}>
                  구분:{' '}
                  <span
                    className={cn(
                      'border px-1.5 py-0.5 text-xs font-mono uppercase',
                      getRoleBadgeStyle(student.role),
                    )}
                  >
                    {getRoleLabel(student.role)}
                  </span>
                </span>
                <span>기숙사: {student.dormitoryRoom ? `${student.dormitoryRoom}호` : '없음'}</span>
                <span>전공 동아리: {student.majorClub?.name ?? '없음'}</span>
                <span>자율 동아리: {student.autonomousClub?.name ?? '없음'}</span>
              </div>
            ) : (
              <div
                className={cn(
                  'border-foreground/25 text-muted-foreground border border-dashed p-4 text-center font-mono text-sm',
                )}
              >
                연동된 학생 정보가 없습니다.
              </div>
            )}
          </div>

          <div className={cn('border-foreground/20 border-t pt-4')}>
            <p className={cn('text-muted-foreground mb-2 font-mono text-xs uppercase tracking-widest')}>
              권한 변경
            </p>
            {isRoleChangeDisabled ? (
              <p className={cn('text-muted-foreground font-mono text-xs')}>
                {account.role === 'ROOT'
                  ? '루트 계정의 권한은 변경할 수 없습니다.'
                  : '본인의 권한은 변경할 수 없습니다.'}
              </p>
            ) : (
              <div className={cn('flex items-center gap-2')}>
                <Select
                  value={selectedRole}
                  onValueChange={(v) => setSelectedRole(v as 'ADMIN' | 'USER')}
                >
                  <SelectTrigger className={cn('border-foreground w-32 rounded-none')}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">유저</SelectItem>
                    <SelectItem value="ADMIN">어드민</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  disabled={isPending || selectedRole === account.role}
                  onClick={() => updateRole({ accountId: account.id, role: selectedRole })}
                >
                  {isPending ? '변경 중...' : '변경'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AccountDetailDialog;
