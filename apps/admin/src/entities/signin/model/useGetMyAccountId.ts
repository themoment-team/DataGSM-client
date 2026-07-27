import { accountQueryKeys, accountUrl, get } from '@repo/shared/api';
import { AccountResponse } from '@repo/shared/types';
import { useQuery } from '@tanstack/react-query';

export const useGetMyAccountId = () => {
  return useQuery({
    queryKey: accountQueryKeys.getMy(),
    queryFn: () => get<AccountResponse>(accountUrl.getMy()),
    select: (data) => data.data.id,
    staleTime: 0,
    gcTime: 0,
    retry: false,
  });
};
