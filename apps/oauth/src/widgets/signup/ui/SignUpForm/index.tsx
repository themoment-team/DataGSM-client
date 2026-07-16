'use client';

import { useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { EMAIL_DOMAIN } from '@repo/shared/constants';
import { useDebounce } from '@repo/shared/hooks';
import {
  Checkbox,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  FormErrorMessage,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@repo/shared/ui';
import { cn, formatEmailWithDomain, getApiErrorCode, minutesToMs } from '@repo/shared/utils';
import { Eye, EyeOff } from 'lucide-react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import {
  SignUpFormSchema,
  SignUpFormType,
  TEACHER_DEPARTMENT_OPTIONS,
  getTeacherDepartmentLabel,
} from '@/entities/signup';
import { useCheckEmailCode, useSendEmailCode, useSignUp } from '@/widgets/signup';

import { PRIVACY_POLICY } from '../../constants/privacyPolicy';

const RESEND_COOLDOWN_MS = minutesToMs(5);
const STORAGE_KEY = 'email_verification_timestamp';

const SignUpForm = () => {
  const [codeSent, setCodeSent] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [isPrivacyDialogOpen, setIsPrivacyDialogOpen] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    trigger,
    watch,
    setValue,
    control,
    resetField,
  } = useForm<SignUpFormType>({
    resolver: zodResolver(SignUpFormSchema),
    defaultValues: {
      objectType: 'STUDENT',
      email: '',
      password: '',
      confirmPassword: '',
      code: '',
      privacyAgreed: false,
    },
  });

  const objectTypeValue = watch('objectType');
  const codeValue = watch('code');
  const emailValue = watch('email');
  const debouncedCode = useDebounce(codeValue, 1000);
  const lastCheckedCode = useRef('');
  const hasShownExpiredToast = useRef(false);

  const isTeacher = objectTypeValue === 'TEACHER';

  const handleObjectTypeChange = (nextType: SignUpFormType['objectType']) => {
    if (nextType === objectTypeValue) return;
    setValue('objectType', nextType);
    resetField('name');
    resetField('department');
    resetField('description');
  };

  const handlePrivacyCheckboxClick = () => {
    const isAgreed = getValues('privacyAgreed');
    if (!isAgreed) {
      setHasScrolledToBottom(false);
      setIsPrivacyDialogOpen(true);
    } else {
      setValue('privacyAgreed', false);
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 10) {
        setHasScrolledToBottom(true);
      }
    }
  };

  const handlePrivacyAgree = () => {
    setValue('privacyAgreed', true);
    setIsPrivacyDialogOpen(false);
    setHasScrolledToBottom(false);
  };

  useEffect(() => {
    if (isPrivacyDialogOpen && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [isPrivacyDialogOpen]);

  useEffect(() => {
    const lastSentTime = localStorage.getItem(STORAGE_KEY);
    if (lastSentTime) {
      const elapsed = Date.now() - parseInt(lastSentTime, 10);
      if (elapsed < RESEND_COOLDOWN_MS) {
        setCodeSent(true);
        setRemainingTime(Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (remainingTime > 0) {
      const timer = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev === 1) {
            localStorage.removeItem(STORAGE_KEY);
            setCodeSent(false);
            if (!isCodeVerified) {
              setIsCodeVerified(false);
              lastCheckedCode.current = '';
              setValue('code', '');
              if (!hasShownExpiredToast.current) {
                hasShownExpiredToast.current = true;
                toast.error('인증 시간이 만료되었습니다. 다시 인증해주세요.');
              }
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [remainingTime, setValue, isCodeVerified]);

  const { mutate: sendEmailCode, isPending: isSendingCode } = useSendEmailCode({
    onSuccess: () => {
      const timestamp = Date.now();
      localStorage.setItem(STORAGE_KEY, timestamp.toString());
      setCodeSent(true);
      setRemainingTime(RESEND_COOLDOWN_MS / 1000);
      hasShownExpiredToast.current = false;
      toast.success('인증 코드가 이메일로 전송되었습니다.');
    },
    onError: (error: unknown) => {
      const statusCode = getApiErrorCode(error);
      switch (statusCode) {
        case 400:
          toast.error('이메일 형식을 확인해주세요.');
          break;
        case 409:
          toast.error('이미 해당 이메일을 가진 계정이 존재합니다.');
          break;
        default:
          toast.error('인증 코드 전송에 실패했습니다.');
      }
    },
  });

  const { mutate: checkEmailCode } = useCheckEmailCode({
    onSuccess: () => {
      setIsCodeVerified(true);
      toast.success('인증 코드가 확인되었습니다.');
    },
    onError: (error: unknown) => {
      const statusCode = getApiErrorCode(error);
      switch (statusCode) {
        case 400:
          setIsCodeVerified(false);
          toast.error('인증 코드가 일치하지 않습니다.');
          break;
        case 404:
          setIsCodeVerified(false);
          toast.error('인증 코드가 만료되었거나 존재하지 않습니다.');
          break;
        default:
          setIsCodeVerified(false);
          toast.error('인증 코드 확인에 실패했습니다.');
      }
    },
  });

  useEffect(() => {
    if (
      codeSent &&
      debouncedCode &&
      debouncedCode.length === 8 &&
      lastCheckedCode.current !== debouncedCode
    ) {
      lastCheckedCode.current = debouncedCode;
      checkEmailCode({
        email: formatEmailWithDomain(emailValue),
        code: debouncedCode,
      });
    }
  }, [codeSent, debouncedCode, emailValue, checkEmailCode]);

  const { mutate: signUp, isPending: isSigningUp } = useSignUp({
    onSuccess: () => {
      router.push(isTeacher ? '/success?page=signup-teacher' : '/success?page=signup');
    },
    onError: (error: unknown) => {
      const statusCode = getApiErrorCode(error);
      switch (statusCode) {
        case 400:
          toast.error('입력 데이터를 확인해주세요.');
          break;
        case 404:
          toast.error('인증 코드가 만료되었거나 존재하지 않습니다.');
          break;
        case 409:
          toast.error(
            isTeacher
              ? '이미 해당 이메일로 가입되었거나 신청된 계정이 있습니다.'
              : '이미 존재하는 계정입니다.',
          );
          break;
        default:
          toast.error(isTeacher ? '회원가입 신청에 실패했습니다.' : '회원가입에 실패했습니다.');
      }
    },
  });

  const handleSendCode = async () => {
    const isEmailValid = await trigger('email');
    if (!isEmailValid) return;
    const email = getValues('email');
    sendEmailCode({ email: formatEmailWithDomain(email) });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const canResend = remainingTime === 0;
  const isButtonDisabled =
    isSendingCode || !emailValue || (codeSent && !canResend) || isCodeVerified;

  const onSubmit: SubmitHandler<SignUpFormType> = (data) => {
    if (!isCodeVerified) {
      toast.error('이메일 인증을 완료해주세요.');
      return;
    }
    const { objectType, email, password, code, name, department, description } = data;

    if (objectType === 'TEACHER') {
      if (!name?.trim() || !department) return;
      signUp({
        objectType,
        email: formatEmailWithDomain(email),
        password,
        code,
        name: name.trim(),
        department,
        ...(description?.trim() ? { description: description.trim() } : {}),
      });
      return;
    }

    signUp({ objectType: 'STUDENT', email: formatEmailWithDomain(email), password, code });
  };

  return (
    <>
      <div
        className={cn('border-foreground bg-background pixel-shadow-lg w-full max-w-md border-2')}
      >
        {/* Title bar */}
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

        {/* Header */}
        <div className={cn('border-border/50 border-b px-6 py-5')}>
          <h1 className={cn('text-foreground text-xl font-bold')}>회원가입</h1>
          <p className={cn('text-muted-foreground mt-1 text-sm')}>
            @gsm.hs.kr 도메인 계정만 사용 가능합니다
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={cn('space-y-4 px-6 pt-5')}>
            {/* Account type */}
            <div className={cn('space-y-1.5')}>
              <Label
                className={cn('text-muted-foreground font-mono text-xs uppercase tracking-widest')}
              >
                가입 종류
              </Label>
              <div className={cn('grid grid-cols-2 gap-2')}>
                {(['STUDENT', 'TEACHER'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleObjectTypeChange(type)}
                    aria-pressed={objectTypeValue === type}
                    className={cn(
                      'border-foreground cursor-pointer border-2 py-2.5 font-mono text-xs font-bold uppercase tracking-widest transition-all',
                      objectTypeValue === type
                        ? 'bg-foreground text-background'
                        : 'bg-background text-foreground hover:bg-foreground/10',
                    )}
                  >
                    {type === 'STUDENT' ? '학생' : '선생님'}
                  </button>
                ))}
              </div>
              {isTeacher && (
                <p className={cn('text-muted-foreground font-mono text-xs')}>
                  {'>'} 선생님 계정은 관리자 승인 후 사용할 수 있습니다
                </p>
              )}
            </div>

            {/* Email + code send */}
            <div className={cn('space-y-1.5')}>
              <Label
                htmlFor="email"
                className={cn('text-muted-foreground font-mono text-xs uppercase tracking-widest')}
              >
                Email
              </Label>
              <div className={cn('flex gap-2')}>
                <div className={cn('flex-1 space-y-1')}>
                  <div className={cn('flex items-center')}>
                    <Input
                      id="email"
                      type="text"
                      placeholder="이메일을 입력하세요"
                      {...register('email')}
                      disabled={remainingTime > 0 || isCodeVerified}
                      className={cn(
                        'border-foreground focus-visible:border-foreground rounded-none focus-visible:ring-0',
                      )}
                    />
                    <span
                      className={cn(
                        'border-foreground bg-muted text-muted-foreground flex h-9 items-center whitespace-nowrap border border-l-0 px-3 font-mono text-xs',
                      )}
                    >
                      {EMAIL_DOMAIN}
                    </span>
                  </div>
                  <FormErrorMessage error={errors.email} />
                </div>
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={isButtonDisabled}
                  className={cn(
                    'border-foreground bg-foreground text-background hover:bg-background hover:text-foreground h-9 flex-shrink-0 cursor-pointer border-2 px-3 font-mono text-xs uppercase tracking-wider transition-all disabled:cursor-not-allowed disabled:opacity-50',
                  )}
                >
                  {isSendingCode
                    ? '전송 중'
                    : codeSent && !canResend
                      ? formatTime(remainingTime)
                      : codeSent && canResend
                        ? '재전송'
                        : '인증코드'}
                </button>
              </div>
            </div>

            {/* Verification code */}
            <div className={cn('space-y-1.5', !codeSent && 'cursor-not-allowed')}>
              <Label
                htmlFor="code"
                className={cn('text-muted-foreground font-mono text-xs uppercase tracking-widest')}
              >
                Verify Code
              </Label>
              <Input
                id="code"
                type="text"
                placeholder="메일로 받은 인증 코드를 입력하세요"
                {...register('code')}
                disabled={!codeSent || isCodeVerified}
                className={cn(
                  'border-foreground focus-visible:border-foreground rounded-none focus-visible:ring-0',
                )}
              />
              {isCodeVerified ? (
                <p className={cn('font-mono text-xs text-green-600')}>{'>'} 인증 완료</p>
              ) : (
                <FormErrorMessage error={errors.code} />
              )}
            </div>

            {/* Password */}
            <div className={cn('space-y-1.5')}>
              <Label
                htmlFor="password"
                className={cn('text-muted-foreground font-mono text-xs uppercase tracking-widest')}
              >
                Password
              </Label>
              <div className={cn('relative')}>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="비밀번호를 입력하세요"
                  {...register('password')}
                  disabled={!isCodeVerified || isSigningUp}
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
                    (!isCodeVerified || isSigningUp) && 'cursor-not-allowed opacity-50',
                  )}
                  disabled={!isCodeVerified || isSigningUp}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <FormErrorMessage error={errors.password} />
            </div>

            {/* Confirm password */}
            <div className={cn('space-y-1.5')}>
              <Label
                htmlFor="confirmPassword"
                className={cn('text-muted-foreground font-mono text-xs uppercase tracking-widest')}
              >
                Confirm Password
              </Label>
              <div className={cn('relative')}>
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="비밀번호를 다시 입력하세요"
                  {...register('confirmPassword')}
                  disabled={!isCodeVerified || isSigningUp}
                  className={cn(
                    'border-foreground focus-visible:border-foreground rounded-none pr-10 focus-visible:ring-0',
                  )}
                />
                <button
                  type="button"
                  aria-label={showConfirmPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={cn(
                    'text-muted-foreground hover:text-foreground absolute right-3 top-1/2 -translate-y-1/2 transition-colors',
                    (!isCodeVerified || isSigningUp) && 'cursor-not-allowed opacity-50',
                  )}
                  disabled={!isCodeVerified || isSigningUp}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <FormErrorMessage error={errors.confirmPassword} />
            </div>

            {/* Teacher info */}
            {isTeacher && (
              <>
                <div className={cn('space-y-1.5')}>
                  <Label
                    htmlFor="name"
                    className={cn(
                      'text-muted-foreground font-mono text-xs uppercase tracking-widest',
                    )}
                  >
                    성함
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="성함을 입력하세요"
                    {...register('name')}
                    disabled={!isCodeVerified || isSigningUp}
                    className={cn(
                      'border-foreground focus-visible:border-foreground rounded-none focus-visible:ring-0',
                    )}
                  />
                  <FormErrorMessage error={errors.name} />
                </div>

                <div className={cn('space-y-1.5')}>
                  <Label
                    htmlFor="department"
                    className={cn(
                      'text-muted-foreground font-mono text-xs uppercase tracking-widest',
                    )}
                  >
                    소속 부서
                  </Label>
                  <Controller
                    control={control}
                    name="department"
                    render={({ field }) => (
                      <Select
                        value={field.value ?? ''}
                        onValueChange={field.onChange}
                        disabled={!isCodeVerified || isSigningUp}
                      >
                        <SelectTrigger
                          id="department"
                          className={cn('border-foreground w-full rounded-none')}
                        >
                          <SelectValue placeholder="소속 부서를 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          {TEACHER_DEPARTMENT_OPTIONS.map((department) => (
                            <SelectItem key={department} value={department}>
                              {getTeacherDepartmentLabel(department)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FormErrorMessage error={errors.department} />
                </div>

                <div className={cn('space-y-1.5')}>
                  <Label
                    htmlFor="description"
                    className={cn(
                      'text-muted-foreground font-mono text-xs uppercase tracking-widest',
                    )}
                  >
                    설명 (선택)
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="예: 3학년 1반 담임선생님"
                    {...register('description')}
                    disabled={!isCodeVerified || isSigningUp}
                    className={cn(
                      'border-foreground focus-visible:border-foreground rounded-none focus-visible:ring-0',
                    )}
                  />
                  <FormErrorMessage error={errors.description} />
                </div>
              </>
            )}

            {/* Privacy */}
            <div className={cn('flex items-center gap-2')}>
              <Checkbox
                id="privacy"
                checked={watch('privacyAgreed')}
                onCheckedChange={handlePrivacyCheckboxClick}
              />
              <label
                htmlFor="privacy"
                className={cn('cursor-pointer text-sm leading-none')}
                onClick={(e) => {
                  e.preventDefault();
                  handlePrivacyCheckboxClick();
                }}
              >
                <span className={cn('font-medium underline underline-offset-2 hover:opacity-70')}>
                  개인정보 처리방침
                </span>
                에 동의합니다
              </label>
            </div>
          </div>

          <div className={cn('space-y-3 px-6 pb-6 pt-5')}>
            <button
              type="submit"
              className={cn(
                'border-foreground bg-foreground text-background hover:bg-background hover:text-foreground w-full cursor-pointer border-2 py-3 font-mono text-xs font-bold uppercase tracking-widest transition-all disabled:cursor-not-allowed disabled:opacity-60',
              )}
              disabled={isSigningUp || !isCodeVerified}
            >
              {isSigningUp ? 'PROCESSING...' : isTeacher ? '회원가입 신청' : 'SIGN UP'}
            </button>

            <p className={cn('text-muted-foreground text-center text-xs')}>
              이미 계정이 있으신가요?{' '}
              <button
                type="button"
                onClick={() => window.close()}
                className={cn('text-foreground font-semibold underline underline-offset-2')}
              >
                창을 닫고 로그인으로 돌아가기
              </button>
            </p>
          </div>
        </form>
      </div>

      {/* Privacy dialog */}
      <Dialog open={isPrivacyDialogOpen} onOpenChange={setIsPrivacyDialogOpen}>
        <DialogContent
          className={cn(
            'border-foreground pixel-shadow flex max-h-[80vh] max-w-md flex-col border-2',
          )}
        >
          <DialogHeader>
            <DialogTitle className={cn('text-base font-bold')}>개인정보 처리방침</DialogTitle>
          </DialogHeader>
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className={cn('max-w-none flex-1 overflow-y-auto pr-4')}
          >
            <div className={cn('whitespace-pre-wrap text-sm leading-relaxed')}>
              {PRIVACY_POLICY.split('\n').map((line, index) => {
                if (line.startsWith('# ')) {
                  return (
                    <h1
                      key={index}
                      className={cn('mb-2 mt-4 text-xl font-bold')}
                      dangerouslySetInnerHTML={{ __html: line.replace('# ', '') }}
                    />
                  );
                }
                if (line.startsWith('## ')) {
                  return (
                    <h2
                      key={index}
                      className={cn('mb-2 mt-4 text-lg font-semibold')}
                      dangerouslySetInnerHTML={{ __html: line.replace('## ', '') }}
                    />
                  );
                }
                if (line.startsWith('### ')) {
                  return (
                    <h3
                      key={index}
                      className={cn('mb-1 mt-3 text-base font-medium')}
                      dangerouslySetInnerHTML={{ __html: line.replace('### ', '') }}
                    />
                  );
                }
                const trimmedLine = line.trimStart();
                const isNested = line.startsWith('  ');
                if (trimmedLine.startsWith('- ')) {
                  return (
                    <li
                      key={index}
                      className={cn(isNested ? 'ml-14' : 'ml-8')}
                      dangerouslySetInnerHTML={{ __html: trimmedLine.substring(2) }}
                    />
                  );
                }
                if (line.startsWith('  > ')) {
                  return (
                    <blockquote
                      key={index}
                      className={cn(
                        'text-muted-foreground border-muted-foreground ml-8 border-l-2 pl-3 italic',
                      )}
                      dangerouslySetInnerHTML={{ __html: line.replace('  > ', '') }}
                    />
                  );
                }
                return (
                  <p
                    key={index}
                    className={cn('my-2')}
                    dangerouslySetInnerHTML={{ __html: line }}
                  />
                );
              })}
            </div>
          </div>
          <div className={cn('flex flex-col gap-2 border-t pt-4')}>
            {!hasScrolledToBottom && (
              <p className={cn('text-muted-foreground text-center font-mono text-xs')}>
                {'>'} 내용을 끝까지 읽어주세요
              </p>
            )}
            <button
              onClick={handlePrivacyAgree}
              disabled={!hasScrolledToBottom}
              className={cn(
                'border-foreground bg-foreground text-background hover:bg-background hover:text-foreground w-full cursor-pointer border-2 py-2.5 font-mono text-xs font-bold uppercase tracking-widest transition-all disabled:cursor-not-allowed disabled:opacity-50',
              )}
            >
              동의합니다
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SignUpForm;
