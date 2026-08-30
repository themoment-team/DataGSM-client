import { post, studentQueryKeys, studentUrl } from '@repo/shared/api';
import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { RequestStudentDataEditType } from '@/entities/student';

export const useRequestStudentDataEdit = (
  options?: Omit<
    UseMutationOptions<void, AxiosError, RequestStudentDataEditType>,
    'mutationKey' | 'mutationFn'
  >,
) => {
  return useMutation({
    mutationKey: studentQueryKeys.postStudentDataEditRequests(),
    mutationFn: (data: RequestStudentDataEditType) =>
      post<void>(studentUrl.postStudentDataEditRequests(), data),
    ...options,
  });
};
