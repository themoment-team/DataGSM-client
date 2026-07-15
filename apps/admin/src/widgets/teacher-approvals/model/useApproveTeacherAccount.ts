import { accountQueryKeys, accountUrl, patch } from '@repo/shared/api';
import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

interface ApproveTeacherAccountVariables {
  accountId: number;
}

export const useApproveTeacherAccount = (
  options?: Omit<
    UseMutationOptions<void, AxiosError, ApproveTeacherAccountVariables>,
    'mutationKey' | 'mutationFn'
  >,
) =>
  useMutation({
    mutationKey: accountQueryKeys.patchAccountApproval(),
    mutationFn: ({ accountId }: ApproveTeacherAccountVariables) =>
      patch<void>(accountUrl.patchAccountApproval(accountId)),
    ...options,
  });
