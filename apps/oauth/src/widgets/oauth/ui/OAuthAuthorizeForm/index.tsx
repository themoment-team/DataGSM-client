'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useSearchParams } from 'next/navigation';

import { SignInFormType } from '@repo/shared/types';
import { SignInForm } from '@repo/shared/ui';
import { cn } from '@repo/shared/utils';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import { useGetOAuthSession } from '@/widgets/oauth';

const BUFFER_TIME_MS = 30000;
const STORAGE_KEY = 'oauth_session_timestamp';

const OAuthAuthorizeForm = () => {
  const [isPending, setIsPending] = useState(false);
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

  const handleSubmit = async (data: SignInFormType) => {
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
          email: data.email,
          password: data.password,
          token: token,
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

  return (
    <div className="max-w-180 relative flex w-full flex-col items-center gap-6">
      <SignInForm
        onSubmit={handleSubmit}
        isPending={isPending}
        signupHref="/signup"
        resetHref="/signin/reset-password"
        serviceName={serviceName || undefined}
        serviceScope={serviceScope}
        isLoadingServiceInfo={isLoadingServiceInfo}
        remainingTime={remainingTime}
      />

      {isExpired && (
        <div
          className={cn(
            'bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm',
          )}
        >
          <div className="border-destructive bg-background pixel-shadow flex max-w-md flex-col items-center gap-4 border-2 p-8 text-center">
            <div className="border-destructive border-2 p-3">
              <AlertCircle className="text-destructive h-8 w-8" />
            </div>
            <h2 className="text-foreground text-xl font-bold">인증 세션 만료</h2>
            <p className="text-muted-foreground text-sm">
              보안을 위해 인증 세션이 만료되었습니다.
              <br />이 창을 닫고 서비스에서 다시 로그인을 시도해주세요.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OAuthAuthorizeForm;
