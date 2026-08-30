'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useSearchParams } from 'next/navigation';

import { SignInFormType } from '@repo/shared/types';
import { SignInForm } from '@repo/shared/ui';
import { cn } from '@repo/shared/utils';
import { toast } from 'sonner';

import {
  DataEditFieldSpec,
  DataEditPayload,
  DataEditRequirementsResponse,
} from '@/entities/data-edit';
import { DataEditForm, useGetOAuthSession } from '@/widgets/oauth';

const BUFFER_TIME_MS = 30000;
const STORAGE_KEY = 'oauth_session_timestamp';

const OAuthAuthorizeForm = () => {
  const [isPending, setIsPending] = useState(false);
  const [credentials, setCredentials] = useState<SignInFormType | null>(null);
  const [dataEditFields, setDataEditFields] = useState<DataEditFieldSpec[] | null>(null);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const sessionExpiresAt = useRef<number | null>(null);
  const hasShownExpiredToast = useRef(false);
  const { data: sessionResponse, isLoading: isLoadingServiceInfo } = useGetOAuthSession(token);
  const sessionData = sessionResponse?.data;
  const serviceName = sessionData?.serviceName;
  const serviceScope = sessionData?.requestedScopes;

  const updateRemainingTime = useCallback(() => {
    if (!sessionExpiresAt.current) return false;

    const now = Date.now();
    const clientExpiresAt = sessionExpiresAt.current - BUFFER_TIME_MS;
    const remaining = Math.max(0, Math.ceil((clientExpiresAt - now) / 1000));

    setRemainingTime(remaining);

    if (remaining <= 0) {
      setIsExpired(true);
      if (!hasShownExpiredToast.current) {
        hasShownExpiredToast.current = true;
        toast.error('인증 세션이 만료되었습니다. 처음부터 다시 시도해주세요.');
      }
      return true;
    }

    return false;
  }, []);

  useEffect(() => {
    if (
      !sessionData?.expiresAt ||
      !sessionData?.serviceName ||
      !sessionData?.requestedScopes ||
      !token
    )
      return;

    const { expiresAt, serviceName, requestedScopes } = sessionData;
    sessionExpiresAt.current = expiresAt;

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        token,
        expiresAt,
        serviceName,
        requestedScopes,
      }),
    );

    updateRemainingTime();
  }, [
    sessionData,
    sessionData?.expiresAt,
    sessionData?.serviceName,
    sessionData?.requestedScopes,
    token,
    updateRemainingTime,
  ]);

  useEffect(() => {
    if (isExpired) return;

    const timer = setInterval(() => {
      const expired = updateRemainingTime();
      if (expired) clearInterval(timer);
    }, 1000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateRemainingTime();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isExpired, updateRemainingTime]);

  /** authorize 제출. 정보 수정 값이 있으면 함께 실어 보낸다. */
  const submitAuthorize = async (credentials: SignInFormType, dataEdit?: DataEditPayload) => {
    if (isExpired) {
      toast.error('세션이 만료되었습니다. 다시 시도해주세요.');
      return;
    }

    setIsPending(true);

    if (!token) {
      toast.error('인증 토큰이 없습니다. 다시 시도해주세요.');
      setIsPending(false);
      return;
    }

    try {
      const response = await fetch('/api/oauth/authorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          token: token,
          ...dataEdit,
        }),
        credentials: 'same-origin',
      });

      if (response.ok) {
        const responseData = await response.json();
        localStorage.removeItem(STORAGE_KEY);

        if (responseData.redirect_url) {
          window.location.href = responseData.redirect_url;
          return;
        }
      }

      if (!response.ok) {
        // 미해소된 정보 수정 요청이 있으면 서버가 422로 로그인을 막는다.
        if (response.status === 422) {
          await enterDataEditStep(credentials);
          return;
        }

        setIsPending(false);
        switch (response.status) {
          case 400:
            toast.error('세션이 만료되었습니다. 다시 시도해주세요.');
            setIsExpired(true);
            break;
          case 401:
            toast.error('이메일 또는 비밀번호가 일치하지 않습니다.');
            break;
          case 403:
            toast.error('승인 대기 중인 계정입니다. 관리자 승인 후 로그인할 수 있습니다.');
            break;
          default:
            toast.error('로그인에 실패했습니다.');
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || '네트워크 오류가 발생했습니다.');
      } else {
        toast.error('알 수 없는 네트워크 오류가 발생했습니다.');
      }
      setIsPending(false);
    }
  };

  /** 입력받아야 할 필드를 조회하고 정보 변경 단계로 넘어간다. */
  const enterDataEditStep = async (credentials: SignInFormType) => {
    const response = await fetch('/api/oauth/data-edit-requirements', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: credentials.email, password: credentials.password }),
      credentials: 'same-origin',
    });

    setIsPending(false);

    if (!response.ok) {
      toast.error('정보 변경 항목을 불러오지 못했습니다. 다시 시도해주세요.');
      return;
    }

    const { fields } = (await response.json()) as Partial<DataEditRequirementsResponse>;

    if (!fields?.length) {
      toast.error('정보 변경 항목을 불러오지 못했습니다. 다시 시도해주세요.');
      return;
    }

    // 비밀번호는 재제출에 필요해 메모리로만 들고 간다. 새로고침하면 로그인부터 다시 한다.
    setCredentials(credentials);
    setDataEditFields(fields);
  };

  return (
    <div className="max-w-180 relative flex w-full flex-col items-center gap-6">
      {dataEditFields && credentials ? (
        <DataEditForm
          fields={dataEditFields}
          isPending={isPending}
          onSubmit={(payload) => submitAuthorize(credentials, payload)}
        />
      ) : (
        <SignInForm
          onSubmit={(data) => submitAuthorize(data)}
          isPending={isPending}
          signupHref="/signup"
          resetHref="/signin/reset-password"
          serviceName={serviceName || undefined}
          serviceScope={serviceScope}
          isLoadingServiceInfo={isLoadingServiceInfo}
          remainingTime={remainingTime}
        />
      )}

      {isExpired && (
        <div
          className={cn(
            'bg-background fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm',
          )}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="session-expired-title"
            aria-describedby="session-expired-description"
            className={cn('border-destructive bg-background max-w-100 w-full border-2')}
          >
            <div className={cn('bg-destructive flex items-center gap-3 px-4 py-3')}>
              <div
                className={cn(
                  'bg-background text-destructive font-pixel flex size-6 flex-shrink-0 items-center justify-center text-[8px]',
                )}
              >
                D
              </div>
              <span className={cn('text-background font-pixel text-[9px]')}>DataGSM</span>
              <span className={cn('text-background font-pixel text-[9px]')}>Session</span>
              <span className={cn('text-background font-pixel text-[9px]')}>Expiration</span>
            </div>

            <div className={cn('flex flex-col items-center gap-2 p-5 text-center')}>
              <h2
                id="session-expired-title"
                className={cn('text-destructive text-xl font-semibold leading-[1.45]')}
              >
                인증 세션 만료
              </h2>
              <p
                id="session-expired-description"
                className={cn('text-muted-foreground text-xs leading-[18px]')}
              >
                보안을 위해 인증 세션이 만료되었습니다.
                <br />이 창을 닫고 서비스에서 다시 로그인을 시도하세요.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OAuthAuthorizeForm;
