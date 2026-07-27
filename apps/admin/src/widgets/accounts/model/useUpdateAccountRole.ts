import { accountQueryKeys, accountUrl, patch } from '@repo/shared/api';
import { ModifyAccountRoleRequest } from '@repo/shared/types';
import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

interface UpdateAccountRoleVariables extends ModifyAccountRoleRequest {
  accountId: number;
}

export const useUpdateAccountRole = (
  options?: Omit<
    UseMutationOptions<void, AxiosError, UpdateAccountRoleVariables>,
    'mutationKey' | 'mutationFn'
  >,
) =>
  useMutation({
    mutationKey: accountQueryKeys.patchAccountRole(),
    mutationFn: ({ accountId, role }: UpdateAccountRoleVariables) =>
      patch<void>(accountUrl.patchAccountRole(accountId), { role }),
    ...options,
  });
