'use client';

import { useEffect, useState } from 'react';

import { AccountListItem } from '@repo/shared/types';
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/shared/ui';
import { cn } from '@repo/shared/utils';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  getAccountRoleBadgeStyle,
  getAccountRoleLabel,
  getAccountStatusBadgeStyle,
  getAccountStatusDotStyle,
  getAccountStatusLabel,
  getTeacherDepartmentLabel,
} from '@/entities/account';
import { useGetMyAccountId } from '@/entities/signin';
import { getMajorLabel, getRoleBadgeStyle, getRoleLabel } from '@/entities/student';
import { useUpdateAccountRole } from '@/widgets/accounts';

const HEAD_ROW_STYLE =
  '[&>th]:px-5 [&>th]:py-1.5 [&>th]:font-sans [&>th]:text-[13px] [&>th]:font-normal [&>th]:normal-case [&>th]:tracking-normal';

const BODY_ROW_STYLE =
  'border-foreground border hover:bg-transparent [&>td]:px-5 [&>td]:py-3.5 [&>td]:font-mono [&>td]:text-xs [&>td]:text-muted-foreground';

const BADGE_STYLE =
  'inline-flex h-6 items-center border px-2 font-mono text-[11px] font-medium tracking-[0.1em]';

const STATUS_BADGE_STYLE =
  'inline-flex h-6 items-center gap-1.5 border px-2 font-sans text-xs font-medium';

const SECTION_TITLE_STYLE = 'text-foreground text-base font-semibold leading-[1.45]';

const SECTION_DESCRIPTION_STYLE = 'text-muted-foreground text-[13px] leading-[1.6]';

const EMPTY_STYLE =
  'border-foreground/25 text-muted-foreground border border-dashed p-4 text-center font-mono text-xs';

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

  const { student, teacher, objectType } = account;
  const isTeacherAccount = objectType === 'TEACHER';
  const isRoleChangeDisabled = account.role === 'ROOT' || account.id === myAccountId;

  const linkedTitle = isTeacherAccount ? '연동된 선생님 정보' : '연동된 학생 정보';
  const linkedDescription = isTeacherAccount
    ? '계정에 연결된 선생님 정보를 확인하세요.'
    : '계정에 연결된 학생 정보를 확인하세요.';

  const renderLinkedInfo = () => {
    if (isTeacherAccount) {
      if (!teacher) {
        return <div className={cn(EMPTY_STYLE)}>연동된 선생님 정보가 없습니다.</div>;
      }

      return (
        <Table>
          <TableHeader>
            <TableRow className={cn(HEAD_ROW_STYLE)}>
              <TableHead className={cn('w-[180px]')}>이름</TableHead>
              <TableHead className={cn('w-[200px]')}>소속 부서</TableHead>
              <TableHead>설명</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className={cn(BODY_ROW_STYLE)}>
              <TableCell>{teacher.name}</TableCell>
              <TableCell>{getTeacherDepartmentLabel(teacher.department)}</TableCell>
              <TableCell className={cn('whitespace-normal')}>
                {teacher.description || '없음'}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
    }

    if (!student) {
      return <div className={cn(EMPTY_STYLE)}>연동된 학생 정보가 없습니다.</div>;
    }

    return (
      <div className={cn('flex flex-col')}>
        <Table>
          <TableHeader>
            <TableRow className={cn(HEAD_ROW_STYLE)}>
              <TableHead className={cn('w-[120px]')}>이름</TableHead>
              <TableHead className={cn('w-[80px]')}>학년</TableHead>
              <TableHead className={cn('w-[80px]')}>반</TableHead>
              <TableHead className={cn('w-[80px]')}>번호</TableHead>
              <TableHead>학과</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className={cn(BODY_ROW_STYLE)}>
              <TableCell>{student.name}</TableCell>
              <TableCell>{student.grade}학년</TableCell>
              <TableCell>{student.classNum}반</TableCell>
              <TableCell>{student.number}번</TableCell>
              <TableCell>{getMajorLabel(student.major)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <Table className={cn('-mt-px')}>
          <TableHeader>
            <TableRow className={cn(HEAD_ROW_STYLE)}>
              <TableHead className={cn('w-[200px]')}>기숙사</TableHead>
              <TableHead className={cn('w-[180px]')}>전공동아리</TableHead>
              <TableHead className={cn('w-[180px]')}>자율동아리</TableHead>
              <TableHead>구분</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className={cn(BODY_ROW_STYLE)}>
              <TableCell>
                {student.dormitoryRoom
                  ? `${student.dormitoryFloor}층 ${student.dormitoryRoom}호`
                  : '없음'}
              </TableCell>
              <TableCell>{student.majorClub?.name ?? '없음'}</TableCell>
              <TableCell>{student.autonomousClub?.name ?? '없음'}</TableCell>
              <TableCell>
                <span className={cn(BADGE_STYLE, getRoleBadgeStyle(student.role))}>
                  {getRoleLabel(student.role)}
                </span>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          'border-foreground max-h-[90vh] gap-0 overflow-y-auto border-2 p-0 sm:max-w-[860px]',
        )}
      >
        <div
          className={cn(
            'bg-foreground text-background flex items-center justify-between px-4 py-3',
          )}
        >
          <DialogTitle className={cn('font-pixel text-[9px] font-normal leading-none')}>
            Account Detail
          </DialogTitle>
          <DialogClose
            className={cn(
              'flex h-6 cursor-pointer items-center justify-center px-2 font-mono text-xs leading-4 tracking-[0.1em] transition-opacity hover:opacity-70',
            )}
          >
            X<span className={cn('sr-only')}>닫기</span>
          </DialogClose>
        </div>

        <div className={cn('flex flex-col gap-4 px-5 pt-4')}>
          <div className={cn('flex flex-col gap-1')}>
            <p className={cn(SECTION_TITLE_STYLE)}>계정 정보</p>
            <DialogDescription className={cn(SECTION_DESCRIPTION_STYLE)}>
              계정에 연결된 정보를 확인하고 권한을 관리하세요.
            </DialogDescription>
          </div>

          <Table>
            <TableHeader>
              <TableRow className={cn(HEAD_ROW_STYLE)}>
                <TableHead className={cn('w-[260px]')}>이메일</TableHead>
                <TableHead className={cn('w-[160px]')}>현재 역할</TableHead>
                <TableHead className={cn('w-[160px]')}>상태</TableHead>
                <TableHead>생성일</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className={cn(BODY_ROW_STYLE)}>
                <TableCell>{account.email}</TableCell>
                <TableCell>
                  <span className={cn(BADGE_STYLE, getAccountRoleBadgeStyle(account.role))}>
                    {getAccountRoleLabel(account.role)}
                  </span>
                </TableCell>
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
                <TableCell>
                  {new Date(account.createdAt).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <div className={cn('flex flex-col gap-4 px-5 pt-5')}>
          <div className={cn('flex flex-col gap-1')}>
            <p className={cn(SECTION_TITLE_STYLE)}>{linkedTitle}</p>
            <p className={cn(SECTION_DESCRIPTION_STYLE)}>{linkedDescription}</p>
          </div>

          {renderLinkedInfo()}

          <div className={cn('flex w-[300px] flex-col gap-1.5')}>
            <Label htmlFor="account-role" className={cn('text-foreground text-sm font-medium')}>
              권한 변경
            </Label>
            {isRoleChangeDisabled ? (
              <p className={cn('text-muted-foreground font-mono text-xs leading-9')}>
                {account.role === 'ROOT'
                  ? '루트 계정의 권한은 변경할 수 없습니다.'
                  : '본인의 권한은 변경할 수 없습니다.'}
              </p>
            ) : (
              <Select
                value={selectedRole}
                onValueChange={(v) => setSelectedRole(v as 'ADMIN' | 'USER')}
              >
                <SelectTrigger
                  id="account-role"
                  className={cn('border-foreground h-9 w-full justify-between px-3 text-sm')}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">유저</SelectItem>
                  <SelectItem value="ADMIN">어드민</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <div className={cn('flex flex-col items-end justify-center p-5')}>
          <Button
            type="button"
            variant="pixel-primary"
            className={cn('h-10 w-full px-3')}
            disabled={isPending || isRoleChangeDisabled || selectedRole === account.role}
            onClick={() => updateRole({ accountId: account.id, role: selectedRole })}
          >
            {isPending ? '변경 중...' : 'Confirm'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AccountDetailDialog;
