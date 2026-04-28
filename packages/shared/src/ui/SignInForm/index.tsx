'use client';

import { useState } from 'react';

import Link from 'next/link';

import { zodResolver } from '@hookform/resolvers/zod';
import { EMAIL_DOMAIN } from '@repo/shared/constants';
import { ClientAvailableScope, SignInFormSchema, SignInFormType } from '@repo/shared/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  FormErrorMessage,
  Input,
  Label,
  Skeleton,
} from '@repo/shared/ui';
import { cn, formatEmailWithDomain } from '@repo/shared/utils';
import { Clock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
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
  const [isRequestScopeDialogOpen, setIsRequestScopeDialogOpen] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
    <>
      <div
        className={cn(
          'border-foreground bg-background pixel-shadow-lg relative w-full max-w-sm border-2',
        )}
      >
        {isPending && (
          <div className="absolute left-[-2px] right-[-2px] top-[-0.5rem] z-10 h-2 overflow-hidden">
            <div className="animate-progress-bar-loading absolute h-full bg-black" />
          </div>
        )}

        <div
          className={cn(
            'border-foreground bg-foreground flex items-center gap-3 border-b-2 px-5 py-3',
          )}
        >
          <div
            className={cn(
              'bg-background text-foreground font-pixel flex h-6 w-6 flex-shrink-0 items-center justify-center text-[8px]',
            )}
          >
            D
          </div>
          <span className={cn('text-background font-pixel text-[9px]')}>DataGSM</span>
        </div>

        <div className="relative">
          {isPending && (
            <div className="bg-background/50 absolute inset-0 z-20 flex cursor-not-allowed items-center justify-center" />
          )}

          {/* Header */}
          <div className={cn('border-border/50 border-b px-6 py-5')}>
            <h1 className={cn('text-foreground text-xl font-bold')}>로그인</h1>
            {isLoadingServiceInfo ? (
              <Skeleton className={cn('mt-2 h-4 w-48')} />
            ) : (
              <p className={cn('text-muted-foreground mt-1 text-sm')}>
                DataGSM 계정으로{' '}
                {serviceName ? (
                  <>
                    <strong className={cn('text-foreground font-semibold')}>{serviceName}</strong>
                    에{' '}
                  </>
                ) : (
                  ''
                )}
                로그인하세요
              </p>
            )}
          </div>

          {remainingTime !== null && remainingTime !== undefined && remainingTime <= 300 && (
            <div
              className={cn(
                'mx-6 mt-4 flex items-center gap-2 border px-3 py-2 font-mono text-xs font-medium',
                remainingTime <= 30
                  ? 'border-destructive text-destructive'
                  : 'border-amber-600 text-amber-600',
              )}
            >
              <Clock className={cn('h-3.5 w-3.5 flex-shrink-0')} />
              <span>세션만료: {formatTime(remainingTime)}</span>
            </div>
          )}

          <form onSubmit={handleFormSubmit}>
            <div className={cn('space-y-4 px-6 pt-5')}>
              <div className={cn('flex items-center gap-2')}>
                {isLoadingServiceInfo ? (
                  <Skeleton className={cn('mt-2 h-4 w-48')} />
                ) : (
                  <label
                    className={cn('cursor-pointer text-sm leading-none')}
                    onClick={(e) => {
                      e.preventDefault();
                      setIsRequestScopeDialogOpen(true);
                    }}
                  >
                    <span
                      className={cn('font-medium underline underline-offset-2 hover:opacity-70')}
                    >
                      {serviceName}
                    </span>
                    에서 다음과 같은{' '}
                    <span
                      className={cn('font-medium underline underline-offset-2 hover:opacity-70')}
                    >
                      권한
                    </span>
                    을 요청합니다
                  </label>
                )}
              </div>
              {/* Email */}
              <div className={cn('space-y-1.5')}>
                <Label
                  htmlFor="emailLocal"
                  className={cn(
                    'text-muted-foreground font-mono text-xs uppercase tracking-widest',
                  )}
                >
                  Email
                </Label>
                <div className={cn('flex')}>
                  <Input
                    id="emailLocal"
                    type="text"
                    placeholder="이메일을 입력하세요"
                    {...register('email')}
                    disabled={isPending}
                    className={cn(
                      'border-foreground focus-visible:border-foreground flex-1 rounded-none focus-visible:ring-0',
                    )}
                  />
                  <span
                    className={cn(
                      'border-foreground bg-muted text-muted-foreground flex items-center whitespace-nowrap border border-l-0 px-3 font-mono text-xs',
                    )}
                  >
                    {EMAIL_DOMAIN}
                  </span>
                </div>
                <FormErrorMessage error={errors.email} />
              </div>

              {/* Password */}
              <div className={cn('space-y-1.5')}>
                <Label
                  htmlFor="password"
                  className={cn(
                    'text-muted-foreground font-mono text-xs uppercase tracking-widest',
                  )}
                >
                  Password
                </Label>
                <div className={cn('relative')}>
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="비밀번호를 입력하세요"
                    {...register('password')}
                    disabled={isPending}
                    className={cn(
                      'border-foreground focus-visible:border-foreground rounded-none pr-10 focus-visible:ring-0',
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
                      <EyeOff className={cn('h-4 w-4')} />
                    ) : (
                      <Eye className={cn('h-4 w-4')} />
                    )}
                  </button>
                </div>
                <FormErrorMessage error={errors.password} />
              </div>
            </div>

            <div className={cn('space-y-3 px-6 pb-6 pt-5')}>
              <button
                type="submit"
                className={cn(
                  'border-foreground bg-foreground text-background hover:bg-background hover:text-foreground w-full cursor-pointer border-2 px-4 py-3 font-mono text-xs font-bold uppercase tracking-widest transition-all disabled:cursor-not-allowed disabled:opacity-60',
                )}
                disabled={isPending}
              >
                {isPending ? 'SIGNING IN...' : 'SIGN IN'}
              </button>

              {signupHref && (
                <div className={cn('space-y-1 pt-1 text-center text-xs')}>
                  <p className={cn('text-muted-foreground')}>
                    계정이 없으신가요?{' '}
                    <Link
                      href={signupHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn('text-foreground font-semibold underline underline-offset-2')}
                    >
                      회원가입
                    </Link>
                  </p>
                  <p>
                    <Link
                      href={resetHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        'text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors',
                      )}
                    >
                      비밀번호를 잊으셨나요?
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>

      <Dialog open={isRequestScopeDialogOpen} onOpenChange={setIsRequestScopeDialogOpen}>
        <DialogContent
          className={cn(
            'border-foreground pixel-shadow flex max-h-[80vh] max-w-md flex-col border-2',
          )}
        >
          <DialogHeader>
            <DialogTitle className={cn('text-base font-bold')}>요청된 권한</DialogTitle>
          </DialogHeader>
          {serviceScope && serviceScope.length > 0 && (
            <div className={cn('mx-4 space-y-2')}>
              <div className={cn('space-y-1.5')}>
                {serviceScope.map((x, index) => (
                  <div
                    key={x.scope + index}
                    className={cn('bg-muted/30 flex items-center gap-2 border border-dashed p-2')}
                  >
                    <ShieldCheck className={cn('text-foreground h-5 w-5 flex-shrink-0')} />
                    <div className={cn('flex items-baseline gap-2')}>
                      <p className={cn('text-foreground text-lg font-semibold')}>
                        {x.applicationName}
                      </p>
                      <p className={cn('text-muted-foreground text-sm')}>
                        {x.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SignInForm;
