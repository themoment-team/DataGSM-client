import { type ReactNode, useState } from 'react';

import { useDeleteApiKeyById, useUpdateApiKeyExpirationById } from '@repo/shared/hooks';
import { ApiKey } from '@repo/shared/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Input,
  Label,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  buttonVariants,
} from '@repo/shared/ui';
import { cn } from '@repo/shared/utils';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface ApiKeyListProps {
  apiKeys?: ApiKey[];
  isLoading: boolean;
}

interface ApiKeyConfirmDialogProps {
  trigger: ReactNode;
  title: string;
  /** 시안에 경고 문구가 있는 경우에만 노출한다. 없으면 스크린리더용으로만 제공한다. */
  warning?: string;
  description: string;
  confirmLabel: string;
  confirmVariant: 'pixel-primary' | 'pixel-destructive';
  onConfirm?: () => void;
  onOpenChange?: (open: boolean) => void;
  /** 시안에 입력 필드가 있는 경우 본문 아래에 렌더링한다. */
  children?: ReactNode;
}

const HEAD_ROW_STYLE =
  '[&>th]:px-5 [&>th]:py-1.5 [&>th]:font-sans [&>th]:text-[13px] [&>th]:font-normal [&>th]:normal-case [&>th]:tracking-normal';

const BODY_ROW_STYLE =
  'border-foreground [&>td]:px-5 [&>td]:py-3.5 [&>td]:font-mono [&>td]:text-xs [&>td]:text-muted-foreground';

const formatExpiresAt = (value: string | Date) => {
  const [year, month, day] = new Date(value)
    .toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' })
    .split('-');

  return `${year}.${month}.${day}`;
};

const ApiKeyConfirmDialog = ({
  trigger,
  title,
  warning,
  description,
  confirmLabel,
  confirmVariant,
  onConfirm,
  onOpenChange,
  children,
}: ApiKeyConfirmDialogProps) => (
  <AlertDialog onOpenChange={onOpenChange}>
    <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
    <AlertDialogContent className={cn('gap-0 p-0 sm:max-w-[656px]')}>
      <div
        className={cn('bg-foreground text-background flex items-center justify-between px-4 py-3')}
      >
        <span className={cn('font-pixel text-[9px] leading-none')}>Alert</span>
        <AlertDialogCancel
          className={cn(
            buttonVariants({ variant: 'pixel-primary' }),
            'text-background h-6 border-0 px-2',
          )}
        >
          X<span className={cn('sr-only')}>닫기</span>
        </AlertDialogCancel>
      </div>

      <div className={cn('flex flex-col gap-1 px-5 pt-5')}>
        <AlertDialogTitle className={cn('text-foreground text-xl font-semibold leading-[1.45]')}>
          {title}
        </AlertDialogTitle>
        <AlertDialogDescription
          className={cn(warning ? 'text-destructive text-[13px] leading-[1.6]' : 'sr-only')}
        >
          {warning ?? description}
        </AlertDialogDescription>
      </div>

      {children && <div className={cn('flex flex-col gap-1.5 px-5 pt-4')}>{children}</div>}

      <div className={cn('flex items-center gap-2.5 p-5')}>
        <AlertDialogCancel className={cn(buttonVariants({ variant: 'pixel' }), 'h-9 flex-1 px-3')}>
          취소
        </AlertDialogCancel>
        <AlertDialogAction
          onClick={onConfirm}
          className={cn(buttonVariants({ variant: confirmVariant }), 'h-9 flex-1 px-3')}
        >
          {confirmLabel}
        </AlertDialogAction>
      </div>
    </AlertDialogContent>
  </AlertDialog>
);

const ApiKeyList = ({ apiKeys, isLoading }: ApiKeyListProps) => {
  const queryClient = useQueryClient();
  const [extendDays, setExtendDays] = useState<number>(30);

  const { mutate: deleteApiKey } = useDeleteApiKeyById({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'api-keys', 'list'] });
      toast.success('API Key가 삭제되었습니다.');
    },
    onError: () => {
      toast.error('API Key 삭제에 실패했습니다.');
    },
  });

  const { mutate: updateApiKeyExpiration } = useUpdateApiKeyExpirationById({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'api-keys', 'list'] });
      toast.success('API Key 기한이 연장되었습니다.');
    },
    onError: () => {
      toast.error('API Key 기한 연장에 실패했습니다.');
    },
  });

  if (!isLoading && !apiKeys?.length) {
    return (
      <p className={cn('text-muted-foreground py-12 text-center font-mono text-xs')}>
        등록된 API Key가 없습니다.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className={cn(HEAD_ROW_STYLE)}>
          <TableHead className={cn('w-[100px]')}>ID</TableHead>
          <TableHead className={cn('w-[320px]')}>설명</TableHead>
          <TableHead>API Key</TableHead>
          <TableHead className={cn('w-[120px]')}>만료일</TableHead>
          <TableHead className={cn('w-[180px]')}>
            <span className={cn('sr-only')}>작업</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading
          ? Array.from({ length: 10 }).map((_, index) => (
              <TableRow key={index} className={cn(BODY_ROW_STYLE)}>
                <TableCell>
                  <Skeleton className={cn('h-4 w-8')} />
                </TableCell>
                <TableCell>
                  <Skeleton className={cn('h-4 w-24')} />
                </TableCell>
                <TableCell>
                  <Skeleton className={cn('h-4 w-64')} />
                </TableCell>
                <TableCell>
                  <Skeleton className={cn('h-4 w-20')} />
                </TableCell>
                <TableCell>
                  <Skeleton className={cn('h-6 w-36')} />
                </TableCell>
              </TableRow>
            ))
          : apiKeys?.map((apiKey) => (
              <TableRow key={apiKey.id} className={cn(BODY_ROW_STYLE)}>
                <TableCell>{apiKey.id}</TableCell>
                <TableCell className={cn('truncate')} title={apiKey.description}>
                  {apiKey.description}
                </TableCell>
                <TableCell className={cn('break-all')}>{apiKey.apiKey}</TableCell>
                <TableCell>{formatExpiresAt(apiKey.expiresAt)}</TableCell>
                <TableCell>
                  <div className={cn('flex items-center gap-2 whitespace-nowrap')}>
                    <ApiKeyConfirmDialog
                      trigger={
                        <Button type="button" variant="pixel" className={cn('h-6 border px-2')}>
                          Renew
                        </Button>
                      }
                      title={`“${apiKey.description}”키의 만료 기한을 연장할까요?`}
                      description={`“${apiKey.description}”키의 만료 기한을 연장합니다.`}
                      confirmLabel="확인"
                      confirmVariant="pixel-primary"
                      onOpenChange={() => setExtendDays(30)}
                      onConfirm={() =>
                        updateApiKeyExpiration({ apiKeyId: apiKey.id, days: extendDays })
                      }
                    >
                      <Label
                        htmlFor={`extend-days-${apiKey.id}`}
                        className={cn('text-foreground text-sm font-medium')}
                      >
                        연장 일수
                      </Label>
                      <Input
                        id={`extend-days-${apiKey.id}`}
                        type="number"
                        min={1}
                        max={365}
                        placeholder="(1 ~ 365) 사이의 숫자를 입력하세요"
                        value={extendDays}
                        onChange={(e) =>
                          setExtendDays(Math.min(365, Math.max(1, Number(e.target.value))))
                        }
                        className={cn('border-foreground h-9 rounded-none px-3 text-sm')}
                      />
                    </ApiKeyConfirmDialog>

                    <ApiKeyConfirmDialog
                      trigger={
                        <Button
                          type="button"
                          variant="pixel-destructive"
                          className={cn('h-6 border px-2')}
                        >
                          Delete
                        </Button>
                      }
                      title={`정말 “${apiKey.description}”키를 삭제할까요?`}
                      warning="> 중요: 이 작업은 되돌릴 수 없습니다!"
                      description="이 작업은 되돌릴 수 없습니다."
                      confirmLabel="확인"
                      confirmVariant="pixel-destructive"
                      onConfirm={() => deleteApiKey(apiKey.id)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
      </TableBody>
    </Table>
  );
};

export default ApiKeyList;
