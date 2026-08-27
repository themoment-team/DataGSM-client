import { oauthGet, oauthPatch, oauthQueryKeys, oauthUrl } from '@repo/shared/api';
import { ApiResponse } from '@repo/shared/types';
import { useMutation, useQuery } from '@tanstack/react-query';

import { ProfileUpdateFieldSpec, ProfileUpdateRequest } from '@/entities/profile-update';

// NOTE: 서버 이슈 themoment-team/datagsm-server#375 계약 확정 전 임시 정의.
// 엔드포인트 모양이 바뀌면 이 파일만 고치면 된다.
interface ProfileUpdateTicketData {
  fields: ProfileUpdateFieldSpec[];
}

type ProfileUpdateTicketResponse = ApiResponse<ProfileUpdateTicketData>;

/** 티켓으로 "무엇을 고쳐야 하는지"를 조회한다. 새로고침해도 이 조회로 폼이 복구된다. */
export const useGetProfileUpdateTicket = (ticket: string | null) =>
  useQuery({
    queryKey: oauthQueryKeys.getProfileUpdate(ticket ?? ''),
    queryFn: () =>
      oauthGet<ProfileUpdateTicketResponse>(oauthUrl.getProfileUpdate(ticket as string)),
    enabled: !!ticket,
    retry: false,
  });

/** 수정 값을 제출한다. 성공하면 서버가 보류했던 authorize를 재개해 이동할 주소를 준다. */
export const useSubmitProfileUpdate = (ticket: string | null) =>
  useMutation({
    mutationFn: (request: ProfileUpdateRequest) =>
      oauthPatch<ApiResponse<{ redirectUrl: string }>>(
        oauthUrl.patchProfileUpdate(ticket as string),
        request,
      ),
  });
