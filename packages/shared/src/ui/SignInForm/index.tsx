'use client';

import { useState } from 'react';

import Link from 'next/link';

import { zodResolver } from '@hookform/resolvers/zod';
import { EMAIL_DOMAIN } from '@repo/shared/constants';
import { ClientAvailableScope, SignInFormSchema, SignInFormType } from '@repo/shared/types';
import { AuthWindow, Button, FormErrorMessage, Input, Skeleton } from '@repo/shared/ui';
import { cn, formatEmailWithDomain } from '@repo/shared/utils';
import { Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

type SignInLocalFormType = z.infer<typeof SignInFormSchema>;

interface SignInFormProps {
  onSubmit: (data: SignInFormType) => void;
  isPending?: boolean;
  signupHref: string;
  resetHref: string;
  serviceName?: string;
  serviceScope?: ClientAvailableScope[];
  isLoadingServiceInfo?: boolean;
  remainingTime?: number | null;
}

const SignInForm = ({
  onSubmit,
  isPending = false,
  signupHref,
  resetHref,
  serviceName,
  serviceScope,
  isLoadingServiceInfo = false,
  remainingTime,
}: SignInFormProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInLocalFormType>({
    resolver: zodResolver(SignInFormSchema),
  });

  const handleFormSubmit = handleSubmit((data) => {
    onSubmit({ email: formatEmailWithDomain(data.email), password: data.password });
  });

  return (
    <AuthWindow
      windowLabel="Sign In"
      title="로그인"
      isPending={isPending}
      description={
        isLoadingServiceInfo ? (
          <Skeleton className={cn('h-4 w-48')} />
        ) : (
          <div className={cn('flex flex-col gap-1')}>
            <p className={cn('text-muted-foreground text-xs leading-[18px]')}>
              <strong className={cn('font-semibold')}>{serviceName || 'DataGSM'}</strong> 로그인을
              위해 다음 권한을 요청합니다.
            </p>
            {serviceScope && serviceScope.length > 0 && (
              <ul className={cn('flex flex-col gap-1')}>
                {serviceScope.map((scope) => (
                  <li
                    key={scope.scope}
                    className={cn(
                      'text-muted-foreground flex items-center gap-2.5 text-xs leading-4',
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn('bg-muted-foreground size-0.5 flex-shrink-0 rounded-full')}
                    />
                    {scope.description}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      }
    >
      <form onSubmit={handleFormSubmit}>
        <div className={cn('flex flex-col gap-4 px-5 pt-5')}>
          {remainingTime !== null && remainingTime !== undefined && (
            <div
              className={cn(
                'border-warning text-warning flex h-6 items-center border px-2 text-xs font-medium',
              )}
              role="status"
              aria-live="polite"
            >
              세션 만료까지: {formatTime(remainingTime)}
            </div>
          )}

          <div className={cn('flex flex-col gap-2')}>
            {/* Email */}
            <div className={cn('space-y-1.5')}>
              <div className={cn('flex')}>
                <Input
                  id="emailLocal"
                  type="text"
                  aria-label="이메일"
                  aria-invalid={!!errors.email}
                  placeholder="이메일을 입력하세요"
                  {...register('email')}
                  disabled={isPending}
                  className={cn(
                    'border-foreground focus-visible:border-foreground aria-invalid:border-destructive aria-invalid:text-destructive flex-1 rounded-none focus-visible:ring-0',
                  )}
                />
                <span
                  className={cn(
                    'border-foreground bg-muted text-muted-foreground flex items-center whitespace-nowrap border border-l-0 px-3 font-mono text-sm',
                  )}
                >
                  {EMAIL_DOMAIN}
                </span>
              </div>
              <FormErrorMessage
                error={errors.email}
                className={cn(
                  "text-destructive text-xs leading-4 before:mr-1 before:content-['>']",
                )}
              />
            </div>

            {/* Password */}
            <div className={cn('space-y-1.5')}>
              <div className={cn('relative')}>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  aria-label="비밀번호"
                  aria-invalid={!!errors.password}
                  placeholder="비밀번호를 입력하세요"
                  {...register('password')}
                  disabled={isPending}
                  className={cn(
                    'border-foreground focus-visible:border-foreground aria-invalid:border-destructive aria-invalid:text-destructive rounded-none pr-10 focus-visible:ring-0',
                  )}
                />
                <button
                  type="button"
                  aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                  onClick={() => setShowPassword(!showPassword)}
                  className={cn(
                    'text-muted-foreground hover:text-foreground absolute right-3 top-1/2 -translate-y-1/2 transition-colors',
                    isPending && 'cursor-not-allowed opacity-50',
                  )}
                  disabled={isPending}
                >
                  {showPassword ? (
                    <EyeOff className={cn('size-4')} />
                  ) : (
                    <Eye className={cn('size-4')} />
                  )}
                </button>
              </div>
              <FormErrorMessage
                error={errors.password}
                className={cn(
                  "text-destructive text-xs leading-4 before:mr-1 before:content-['>']",
                )}
              />
            </div>
          </div>
        </div>

        <div className={cn('flex flex-col items-center gap-4 p-5')}>
          <Button
            type="submit"
            variant="pixel-solid"
            size="lg"
            className={cn('w-full')}
            disabled={isPending}
          >
            {isPending ? 'SIGNING IN...' : 'SIGN IN'}
          </Button>

          {signupHref && (
            <div className={cn('flex items-center justify-center gap-2 text-xs')}>
              <Link
                href={signupHref}
                target="_blank"
                rel="noopener noreferrer"
                className={cn('text-foreground underline underline-offset-2')}
              >
                회원가입
              </Link>
              <Link
                href={resetHref}
                target="_blank"
                rel="noopener noreferrer"
                className={cn('text-foreground underline underline-offset-2')}
              >
                비밀번호 찾기
              </Link>
            </div>
          )}
        </div>
      </form>
    </AuthWindow>
  );
};

export default SignInForm;
