import { useState } from 'react';

import { useDeleteApiKeyById, useUpdateApiKeyExpirationById } from '@repo/shared/hooks';
import { ApiKey } from '@repo/shared/types';
import {
  Button,
  ConfirmDialog,
  Input,
  Label,
  Skeleton,
  TABLE_BODY_ROW_STYLE,
  TABLE_HEAD_ROW_STYLE,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/shared/ui';
import { cn } from '@repo/shared/utils';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface ApiKeyListProps {
  apiKeys?: ApiKey[];
  isLoading: boolean;
}

const formatExpiresAt = (value: string | Date) => {
  const [year, month, day] = new Date(value)
    .toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' })
    .split('-');

  return `${year}.${month}.${day}`;
};

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
        <TableRow className={cn(TABLE_HEAD_ROW_STYLE)}>
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
              <TableRow key={index} className={cn(TABLE_BODY_ROW_STYLE)}>
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
              <TableRow key={apiKey.id} className={cn(TABLE_BODY_ROW_STYLE)}>
                <TableCell>{apiKey.id}</TableCell>
                <TableCell className={cn('truncate')} title={apiKey.description}>
                  {apiKey.description}
                </TableCell>
                <TableCell className={cn('break-all')}>{apiKey.apiKey}</TableCell>
                <TableCell>{formatExpiresAt(apiKey.expiresAt)}</TableCell>
                <TableCell>
                  <div className={cn('flex items-center gap-2 whitespace-nowrap')}>
                    <ConfirmDialog
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
                    </ConfirmDialog>

                    <ConfirmDialog
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
