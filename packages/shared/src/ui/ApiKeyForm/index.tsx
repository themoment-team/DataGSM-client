'use client';

import { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { authQueryKeys } from '@repo/shared/api';
import {
  useApiKeyScopeSelection,
  useCreateApiKey,
  useGetApiKey,
  useGetAvailableScope,
  useRotateApiKey,
  useUpdateApiKey,
} from '@repo/shared/hooks';
import {
  ApiKeyFormSchema,
  ApiKeyFormType,
  ApiKeyResponse,
  AvailableScopeListResponse,
  UserRoleType,
} from '@repo/shared/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Badge,
  Button,
  Checkbox,
  FormErrorMessage,
  Input,
  Label,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@repo/shared/ui';
import { cn } from '@repo/shared/utils';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

const FIELD_STYLE = 'border-foreground h-9 rounded-none px-3 text-sm';
const ACTION_STYLE = 'h-10 w-full px-3';

interface ApiKeyFormProps {
  initialApiKeyData?: ApiKeyResponse;
  initialAvailableScope?: AvailableScopeListResponse;
  userRole: UserRoleType;
}

const ApiKeyForm = ({ initialApiKeyData, initialAvailableScope, userRole }: ApiKeyFormProps) => {
  const queryClient = useQueryClient();

  const [isRenewConfirmOpen, setIsRenewConfirmOpen] = useState(false);
  const [isExtendConfirmOpen, setIsExtendConfirmOpen] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<ApiKeyFormType | null>(null);

  const { data: availableKeyScope, isLoading: isLoadingKeyScope } = useGetAvailableScope(userRole, {
    initialData: initialAvailableScope,
  });

  const { data: apiKeyData, isLoading: isLoadingApiKey } = useGetApiKey({
    initialData: initialApiKeyData,
  });

  const { isPending: isCreatingApiKey, mutate: createApiKey } = useCreateApiKey({
    onSuccess: (data) => {
      // 마스킹되지 않은 새 키를 캐시에 즉시 설정
      queryClient.setQueryData(authQueryKeys.getApiKey(), data);
      queryClient.invalidateQueries({ queryKey: ['auth', 'api-keys', 'list'] });
      toast.success('API Key가 생성되었습니다.');
    },
    onError: () => {
      toast.error('API Key 생성에 실패했습니다. 다시 시도해주세요.');
    },
  });

  const { isPending: isUpdatingApiKey, mutate: updateApiKey } = useUpdateApiKey({
    onSuccess: (data) => {
      // 기본 성공 처리 (필요시)
      queryClient.setQueryData(authQueryKeys.getApiKey(), data);
      queryClient.invalidateQueries({ queryKey: ['auth', 'api-keys', 'list'] });
    },
    onError: () => {
      toast.error('API Key 갱신에 실패했습니다. 다시 시도해주세요.');
    },
  });

  const { isPending: isRotatingApiKey, mutate: rotateApiKey } = useRotateApiKey({
    onSuccess: (data) => {
      // 기본 성공 처리 (필요시)
      queryClient.setQueryData(authQueryKeys.getApiKey(), data);
      queryClient.invalidateQueries({ queryKey: ['auth', 'api-keys', 'list'] });
    },
    onError: () => {
      toast.error('API Key 갱신에 실패했습니다. 다시 시도해주세요.');
    },
  });

  const {
    handleSubmit,
    watch,
    setValue,
    register,
    reset,
    formState: { errors },
  } = useForm<ApiKeyFormType>({
    resolver: zodResolver(ApiKeyFormSchema),
    defaultValues: {
      scopes: [],
      description: '',
    },
  });

  const watchedScopes = watch('scopes');
  const watchedDescription = watch('description');

  const isScopesEqual =
    apiKeyData?.data?.scopes &&
    apiKeyData.data.scopes.length === watchedScopes.length &&
    apiKeyData.data.scopes.every((s) => watchedScopes.includes(s));

  const isDescriptionEqual = apiKeyData?.data?.description === watchedDescription;

  const isApiKeyDataEqual = !!apiKeyData?.data?.apiKey && isScopesEqual && isDescriptionEqual;

  useEffect(() => {
    if (apiKeyData?.data) {
      reset({
        scopes: apiKeyData.data.scopes || [],
        description: apiKeyData.data.description || '',
      });
    }
  }, [apiKeyData, reset]);

  const buttonText = isCreatingApiKey
    ? 'API 키 생성 중...'
    : isUpdatingApiKey || isRotatingApiKey
      ? 'API 키 갱신 중...'
      : apiKeyData?.data?.apiKey
        ? 'API 키 갱신하기'
        : 'Generate key';

  const buttonTooptipText = !apiKeyData?.data?.apiKey
    ? '새로운 API 키를 발급합니다.'
    : isApiKeyDataEqual
      ? '기존 API 키를 폐기하고 권한 범위와 설명이 같은 새로운 키를 발급합니다.'
      : 'API 키의 권한 범위 및 설명을 수정한 새로운 키를 발급합니다.';

  const { handleScopeToggle, isScopeChecked } = useApiKeyScopeSelection({
    availableScopes: availableKeyScope,
    watch,
    setValue,
  });

  const onSubmit = (data: ApiKeyFormType) => {
    if (!apiKeyData?.data?.apiKey) {
      createApiKey(data);
    }
  };

  const onRenewClick = handleSubmit((data) => {
    setPendingFormData(data);
    setIsRenewConfirmOpen(true);
  });

  const onExtendClick = handleSubmit((data) => {
    setPendingFormData(data);
    setIsExtendConfirmOpen(true);
  });

  const onRenewConfirm = () => {
    if (!pendingFormData) return;
    const sharedOptions = {
      onSuccess: (res: ApiKeyResponse) => {
        queryClient.setQueryData(authQueryKeys.getApiKey(), res);
        toast.success('갱신에 성공하였습니다.');
      },
      onSettled: () => setIsRenewConfirmOpen(false),
    };
    if (isApiKeyDataEqual) {
      rotateApiKey(undefined, sharedOptions);
    } else {
      updateApiKey(pendingFormData, sharedOptions);
    }
  };

  const onExtendConfirm = () => {
    if (!pendingFormData) return;
    updateApiKey(pendingFormData, {
      onSuccess: (res: ApiKeyResponse) => {
        queryClient.setQueryData(authQueryKeys.getApiKey(), res);
        toast.success('연장에 성공하였습니다.');
      },
      onSettled: () => setIsExtendConfirmOpen(false),
    });
  };

  const isPending = isCreatingApiKey || isUpdatingApiKey || isRotatingApiKey;

  if (isLoadingApiKey || isLoadingKeyScope) {
    return (
      <div className={cn('flex flex-col gap-1')}>
        <p className={cn('text-foreground text-base font-semibold leading-[1.45]')}>권한 범위</p>
        <p className={cn('text-muted-foreground text-[13px] leading-[1.6]')}>
          {'>'} 권한 범위 불러오는 중...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('flex flex-col')}>
      <div className={cn('flex flex-col gap-1')}>
        <p className={cn('text-foreground text-base font-semibold leading-[1.45]')}>권한 범위</p>
        <p className={cn('text-muted-foreground text-[13px] leading-[1.6]')}>
          이 키로 접근할 수 있는 데이터를 고르세요.
        </p>
      </div>

      <div className={cn('grid grid-cols-1 gap-x-5 gap-y-6 pt-5 md:grid-cols-2')}>
        {availableKeyScope?.data?.list.map((category) => {
          const hasMultipleScopes = category.scopes?.length > 1;

          return (
            <div key={category.title} className={cn('flex flex-col gap-4')}>
              <h3 className={cn('text-foreground text-base font-semibold leading-none')}>
                {category.title}
              </h3>
              <div className={cn('flex flex-col')}>
                {category.scopes?.map((scope) => {
                  const isWildcard = scope.scope.endsWith(':*');
                  const isChecked = isScopeChecked(scope.scope);

                  return (
                    <div
                      key={scope.scope}
                      className={cn(
                        'flex items-center gap-6 py-3 pr-4',
                        hasMultipleScopes && !isWildcard ? 'pl-16' : 'pl-4',
                      )}
                    >
                      <Checkbox
                        id={scope.scope}
                        className={cn('size-6')}
                        checked={isChecked}
                        onCheckedChange={() => handleScopeToggle(scope.scope)}
                      />
                      <Label
                        htmlFor={scope.scope}
                        className={cn('flex cursor-pointer flex-wrap items-center gap-2')}
                      >
                        <Badge
                          variant="outline"
                          className={cn(
                            'h-6 rounded-none px-2 text-xs font-medium',
                            isChecked
                              ? 'border-foreground text-foreground'
                              : 'border-muted-foreground/50 text-muted-foreground',
                          )}
                        >
                          {scope.scope}
                        </Badge>
                        <span
                          className={cn(
                            'text-xs font-normal',
                            isChecked ? 'text-foreground' : 'text-muted-foreground',
                          )}
                        >
                          {scope.description}
                        </span>
                      </Label>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <FormErrorMessage error={errors.scopes} className={cn('pt-2')} />

      <div className={cn('flex flex-col gap-1.5 pt-10')}>
        <Label htmlFor="description" className={cn('text-foreground text-sm font-medium')}>
          설명 <span className={cn('text-destructive')}>*</span>{' '}
          <span className={cn('text-muted-foreground')}>(필수)</span>
        </Label>
        <Input
          id="description"
          placeholder="API 키 설명을 입력하세요"
          className={cn(FIELD_STYLE)}
          {...register('description')}
        />
        <p className={cn('text-muted-foreground text-xs leading-4')}>
          {'>'} 생성된 키는 30일동안 유지됩니다
        </p>
        <FormErrorMessage error={errors.description} />
      </div>

      {apiKeyData?.data?.apiKey && (
        <AlertDialog open={isRenewConfirmOpen} onOpenChange={setIsRenewConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>API 키 갱신</AlertDialogTitle>
              <AlertDialogDescription>
                {isApiKeyDataEqual
                  ? '기존 API 키를 폐기하고 새로운 키를 발급합니다. 이 작업은 되돌릴 수 없습니다.'
                  : 'API 키의 권한 범위와 설명을 수정하여 새로운 키를 발급합니다.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction onClick={onRenewConfirm}>확인</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <div className={cn('flex flex-col items-end justify-center gap-2 pt-5')}>
        <Tooltip className="w-full">
          <TooltipTrigger asChild>
            {apiKeyData?.data?.apiKey ? (
              <Button
                type="button"
                variant="pixel-primary"
                className={cn(ACTION_STYLE)}
                disabled={isPending}
                onClick={onRenewClick}
              >
                {buttonText}
              </Button>
            ) : (
              <Button
                type="submit"
                variant="pixel-primary"
                className={cn(ACTION_STYLE)}
                disabled={isPending}
              >
                {buttonText}
              </Button>
            )}
          </TooltipTrigger>
          <TooltipContent>{buttonTooptipText}</TooltipContent>
        </Tooltip>

        {isApiKeyDataEqual && (
          <>
            <AlertDialog open={isExtendConfirmOpen} onOpenChange={setIsExtendConfirmOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>기한 연장</AlertDialogTitle>
                  <AlertDialogDescription>API 키의 만료 기한을 연장합니다.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction onClick={onExtendConfirm}>확인</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Tooltip className="w-full">
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="pixel"
                  className={cn(ACTION_STYLE)}
                  disabled={isPending}
                  onClick={onExtendClick}
                >
                  기한 연장하기
                </Button>
              </TooltipTrigger>
              <TooltipContent>API 키의 만료 기한을 연장합니다.</TooltipContent>
            </Tooltip>
          </>
        )}
      </div>
    </form>
  );
};

export default ApiKeyForm;
