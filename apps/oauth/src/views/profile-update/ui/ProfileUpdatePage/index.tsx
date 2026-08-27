'use client';

import { useSearchParams } from 'next/navigation';

import { cn } from '@repo/shared/utils';
import { toast } from 'sonner';

import {
  ProfileUpdateForm,
  useGetProfileUpdateTicket,
  useSubmitProfileUpdate,
} from '@/widgets/profile-update';

const ProfileUpdatePage = () => {
  const searchParams = useSearchParams();
  const ticket = searchParams.get('ticket');

  const { data, isLoading } = useGetProfileUpdateTicket(ticket);
  const { mutate, isPending } = useSubmitProfileUpdate(ticket);

  const fields = data?.data.fields ?? [];

  return (
    <div className={cn('bg-background flex min-h-screen items-center justify-center px-4')}>
      {!isLoading && fields.length > 0 && (
        <ProfileUpdateForm
          fields={fields}
          isPending={isPending}
          onSubmit={(request) =>
            mutate(request, {
              // 수정이 끝나면 서버가 보류했던 인가 코드를 발급해 원래 서비스로 돌려보낸다.
              onSuccess: (response) => {
                window.location.href = response.data.redirectUrl;
              },
              onError: () => toast.error('정보 변경에 실패했습니다. 다시 시도해주세요.'),
            })
          }
        />
      )}
    </div>
  );
};

export default ProfileUpdatePage;
