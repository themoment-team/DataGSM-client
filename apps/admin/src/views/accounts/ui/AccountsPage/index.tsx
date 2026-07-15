'use client';

import { useEffect, useMemo, useState } from 'react';

import { useSearchParams } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { useDebounce, useURLFilters } from '@repo/shared/hooks';
import {
  AccountListItem,
  AccountObjectType,
  AccountSortBy,
  AccountStatus,
  UserRoleType,
} from '@repo/shared/types';
import { CommonPagination, PageHeader } from '@repo/shared/ui';
import { cn } from '@repo/shared/utils';

import { useForm, useWatch } from 'react-hook-form';

import { AccountFilterSchema, AccountFilterType } from '@/entities/account';
import { useGetAccounts } from '@/views/accounts';
import { AccountDetailDialog, AccountFilter, AccountList } from '@/widgets/accounts';

const PAGE_SIZE = 10;

const AccountsPage = () => {
  const searchParams = useSearchParams();
  const { updateURL } = useURLFilters<AccountFilterType>();

  const [selectedAccount, setSelectedAccount] = useState<AccountListItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleSelectAccount = (account: AccountListItem) => {
    setSelectedAccount(account);
    setIsDetailOpen(true);
  };

  const initialValues = useMemo(
    (): AccountFilterType & { page: number } => ({
      email: searchParams.get('email') || 'all',
      role: searchParams.get('role') || 'all',
      objectType: searchParams.get('objectType') || 'all',
      status: searchParams.get('status') || 'all',
      sortBy: searchParams.get('sortBy') || 'all',
      page: Number(searchParams.get('page')) || 0,
    }),
    [searchParams],
  );

  const form = useForm<AccountFilterType>({
    resolver: zodResolver(AccountFilterSchema),
    defaultValues: {
      email: initialValues.email,
      role: initialValues.role,
      objectType: initialValues.objectType,
      status: initialValues.status,
      sortBy: initialValues.sortBy,
    },
  });

  const { control, reset } = form;

  const filters = useWatch({ control });
  const { email, role, objectType, status, sortBy } = filters;

  const debouncedEmail = useDebounce(email);

  const currentPage = initialValues.page;

  useEffect(() => {
    reset({
      email: initialValues.email,
      role: initialValues.role,
      objectType: initialValues.objectType,
      status: initialValues.status,
      sortBy: initialValues.sortBy,
    });
  }, [initialValues, reset]);

  useEffect(() => {
    const hasChanged =
      debouncedEmail !== initialValues.email ||
      role !== initialValues.role ||
      objectType !== initialValues.objectType ||
      status !== initialValues.status ||
      sortBy !== initialValues.sortBy;

    if (hasChanged) {
      updateURL(
        {
          email: debouncedEmail,
          role,
          objectType,
          status,
          sortBy,
        },
        0,
      );
    }
  }, [
    debouncedEmail,
    role,
    objectType,
    status,
    sortBy,
    initialValues.email,
    initialValues.role,
    initialValues.objectType,
    initialValues.status,
    initialValues.sortBy,
    updateURL,
  ]);

  const handlePageChange = (page: number) => {
    updateURL(
      {
        email: debouncedEmail,
        role,
        objectType,
        status,
        sortBy,
      },
      page,
    );
  };

  const queryParams = {
    page: currentPage,
    size: PAGE_SIZE,
    email: debouncedEmail !== 'all' ? debouncedEmail : undefined,
    role: role !== 'all' ? (role as UserRoleType) : undefined,
    objectType: objectType !== 'all' ? (objectType as AccountObjectType) : undefined,
    status: status !== 'all' ? (status as AccountStatus) : undefined,
    sortBy: sortBy !== 'all' ? (sortBy as AccountSortBy) : undefined,
  };

  const { data: accountsData, isLoading: isLoadingAccounts } = useGetAccounts(queryParams);

  const accounts = accountsData?.data.accounts;
  const totalPages = accountsData?.data.totalPages ?? 0;

  return (
    <div className={cn('bg-background min-h-[calc(100vh-3.5rem)]')}>
      <main className={cn('container mx-auto px-4 py-8')}>
        <PageHeader breadcrumb="DATAGSM / Admin" title="계정 관리" />

        <div className={cn('mb-4')}>
          <AccountFilter control={control} />
        </div>

        <div className={cn('border-2 border-foreground pixel-shadow')}>
          <AccountList
            accounts={accounts}
            isLoading={isLoadingAccounts}
            onSelect={handleSelectAccount}
          />
        </div>

        <div className={cn('mt-5')}>
          <CommonPagination
            isLoading={isLoadingAccounts}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>

        <AccountDetailDialog
          account={selectedAccount}
          open={isDetailOpen}
          onOpenChange={setIsDetailOpen}
        />
      </main>
    </div>
  );
};

export default AccountsPage;
