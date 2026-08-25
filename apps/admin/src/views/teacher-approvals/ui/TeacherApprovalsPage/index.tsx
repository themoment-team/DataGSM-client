'use client';

import { useMemo } from 'react';

import { useSearchParams } from 'next/navigation';

import { useURLFilters } from '@repo/shared/hooks';
import { CommonPagination } from '@repo/shared/ui';
import { cn } from '@repo/shared/utils';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useGetAccounts } from '@/views/accounts';
import { TeacherApprovalList, useApproveTeacherAccount } from '@/widgets/teacher-approvals';

const PAGE_SIZE = 10;

const TeacherApprovalsPage = () => {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { updateURL } = useURLFilters<Record<string, never>>();

  const currentPage = useMemo(() => Number(searchParams.get('page')) || 0, [searchParams]);

  const {
    data: accountsData,
    isLoading,
    isFetching,
  } = useGetAccounts({
    page: currentPage,
    size: PAGE_SIZE,
    objectType: 'TEACHER',
    status: 'PENDING',
  });

  const { mutate: approveTeacher, isPending: isApproving } = useApproveTeacherAccount({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('선생님 계정을 승인했습니다.');
    },
    onError: (error) => {
      if (error.response?.status === 409) {
        queryClient.invalidateQueries({ queryKey: ['accounts'] });
        toast.info('이미 승인된 계정입니다.');
        return;
      }
      console.error('선생님 계정 승인 실패:', error);
      toast.error('선생님 계정 승인에 실패했습니다.');
    },
  });

  const accounts = accountsData?.data.accounts;
  const totalPages = accountsData?.data.totalPages ?? 0;

  return (
    <div className={cn('bg-background min-h-[calc(100vh-3.5rem)]')}>
      <main className={cn('container mx-auto px-4 py-8')}>
        {/* Page header */}
        <div className={cn('mb-4 flex items-start justify-end gap-2')}>
          <div className={cn('flex flex-1 flex-col gap-1')}>
            <h1 className={cn('text-foreground text-base font-semibold leading-[1.45]')}>
              선생님 역할 승인
            </h1>
            <p className={cn('text-muted-foreground text-[13px] leading-[1.6]')}>
              선생님 역할이 요청된 계정들을 관리하세요
            </p>
          </div>
        </div>

        {/* Table */}
        <div className={cn('border-foreground border-2')}>
          <TeacherApprovalList
            accounts={accounts}
            isLoading={isLoading}
            isApproving={isApproving || isFetching}
            onApprove={(accountId) => approveTeacher({ accountId })}
          />
        </div>

        <div className={cn('mt-5')}>
          <CommonPagination
            isLoading={isLoading}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => updateURL({}, page)}
          />
        </div>
      </main>
    </div>
  );
};

export default TeacherApprovalsPage;
