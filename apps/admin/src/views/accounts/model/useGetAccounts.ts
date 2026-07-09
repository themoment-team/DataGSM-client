import { accountQueryKeys, accountUrl, get } from '@repo/shared/api';
import { AccountListResponse, AccountSortBy, UserRoleType } from '@repo/shared/types';
import { minutesToMs } from '@repo/shared/utils';
import { UseQueryOptions, useQuery } from '@tanstack/react-query';

interface UseGetAccountsParams {
  page?: number;
  size?: number;
  email?: string;
  role?: UserRoleType;
  isStudent?: boolean;
  sortBy?: AccountSortBy;
}

export const useGetAccounts = (
  params: UseGetAccountsParams,
  options?: Omit<UseQueryOptions<AccountListResponse>, 'queryKey' | 'queryFn'>,
) =>
  useQuery({
    queryKey: accountQueryKeys.getAccounts(params),
    queryFn: () => get<AccountListResponse>(accountUrl.getAccounts(params)),
    staleTime: minutesToMs(5),
    gcTime: minutesToMs(10),
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    ...options,
  });
