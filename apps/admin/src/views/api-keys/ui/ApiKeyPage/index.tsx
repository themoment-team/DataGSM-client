'use client';

import { useEffect, useMemo } from 'react';

import { useSearchParams } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { useURLFilters } from '@repo/shared/hooks';
import { ApiKeyFormDialog, Button, CommonPagination, PageWindow } from '@repo/shared/ui';
import { cn } from '@repo/shared/utils';
import { useForm, useWatch } from 'react-hook-form';

import { ApiKeyFilterSchema, ApiKeyFilterType } from '@/entities/api-key';
import { useGetApiKeys } from '@/views/api-keys';
import { ApiKeyFilter, ApiKeyList } from '@/widgets/api-keys';

const PAGE_SIZE = 10;

const ApiKeyPage = () => {
  const searchParams = useSearchParams();
  const { updateURL } = useURLFilters<ApiKeyFilterType>();

  const initialValues = useMemo(
    (): ApiKeyFilterType & { page: number } => ({
      id: searchParams.get('id') || '',
      accountId: searchParams.get('accountId') || '',
      scope: searchParams.get('scope') || '',
      isExpired: (searchParams.get('isExpired') as ApiKeyFilterType['isExpired']) || 'all',
      isRenewable: (searchParams.get('isRenewable') as ApiKeyFilterType['isRenewable']) || 'all',
      page: Number(searchParams.get('page')) || 0,
    }),
    [searchParams],
  );

  const form = useForm<ApiKeyFilterType>({
    resolver: zodResolver(ApiKeyFilterSchema),
    defaultValues: {
      id: initialValues.id,
      accountId: initialValues.accountId,
      scope: initialValues.scope,
      isExpired: initialValues.isExpired,
      isRenewable: initialValues.isRenewable,
    },
  });

  const {
    control,
    reset,
    formState: { isDirty },
  } = form;

  const filters = useWatch({
    control,
  });

  const currentPage = initialValues.page;

  useEffect(() => {
    reset({
      id: initialValues.id,
      accountId: initialValues.accountId,
      scope: initialValues.scope,
      isExpired: initialValues.isExpired,
      isRenewable: initialValues.isRenewable,
    });
  }, [initialValues, reset]);

  useEffect(() => {
    if (!isDirty) return;

    const timer = setTimeout(() => {
      const hasChanged =
        filters.id !== initialValues.id ||
        filters.accountId !== initialValues.accountId ||
        filters.scope !== initialValues.scope ||
        filters.isExpired !== initialValues.isExpired ||
        filters.isRenewable !== initialValues.isRenewable;

      if (hasChanged) {
        updateURL(filters, 0);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [filters, initialValues, updateURL, isDirty]);

  const handlePageChange = (page: number) => {
    updateURL(filters, page);
  };

  const queryParams = {
    page: currentPage,
    size: PAGE_SIZE,
    id: filters.id ? Number(filters.id) : undefined,
    accountId: filters.accountId ? Number(filters.accountId) : undefined,
    scope: filters.scope || undefined,
    isExpired: filters.isExpired === 'all' ? undefined : filters.isExpired === 'true',
    isRenewable: filters.isRenewable === 'all' ? undefined : filters.isRenewable === 'true',
  };

  const { data: apiKeysData, isLoading: isLoadingApiKeys } = useGetApiKeys(queryParams);

  const apiKeys = apiKeysData?.data.apiKeys;
  const totalPages = apiKeysData?.data.totalPages ?? 0;
  const isEmpty = !isLoadingApiKeys && !apiKeys?.length;

  return (
    <div className={cn('bg-background min-h-[calc(100vh-3.5rem)]')}>
      <main className={cn('container mx-auto px-4 py-8')}>
        <PageWindow
          windowTitle="API Key Management"
          title="API Key 관리"
          description="발급된 API Key를 확인하거나 관리하세요."
          action={
            <ApiKeyFormDialog
              userRole="ADMIN"
              trigger={
                <Button type="button" variant="pixel-primary" className={cn('px-3')}>
                  + API 키 관리
                </Button>
              }
            />
          }
        >
          {/* Filters */}
          <div className={cn('mb-2')}>
            <ApiKeyFilter control={control} />
          </div>

          {/* Table */}
          <div className={cn(!isEmpty && 'border-foreground border')}>
            <ApiKeyList apiKeys={apiKeys} isLoading={isLoadingApiKeys} />
          </div>

          <div className={cn('mt-5')}>
            <CommonPagination
              isLoading={isLoadingApiKeys}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </PageWindow>
      </main>
    </div>
  );
};

export default ApiKeyPage;
