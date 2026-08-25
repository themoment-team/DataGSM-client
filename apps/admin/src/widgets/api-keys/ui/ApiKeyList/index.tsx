import { useState } from 'react';

import { useDeleteApiKeyById, useUpdateApiKeyExpirationById } from '@repo/shared/hooks';
import { ApiKey } from '@repo/shared/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
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
} from '@repo/shared/ui';
import { cn } from '@repo/shared/utils';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface ApiKeyListProps {
  apiKeys?: ApiKey[];
  isLoading: boolean;
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
                    <AlertDialog onOpenChange={() => setExtendDays(30)}>
                      <AlertDialogTrigger asChild>
                        <Button type="button" variant="pixel" className={cn('h-6 border px-2')}>
                          Renew
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Api Key 기한 연장</AlertDialogTitle>
                          <AlertDialogDescription>
                            &apos;{apiKey.description}&apos;의 기한을 연장하시겠습니까?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className={cn('my-4 space-y-2')}>
                          <Label
                            className={cn(
                              'text-muted-foreground font-mono text-xs uppercase tracking-widest',
                            )}
                          >
                            연장 일수 (1~365)
                          </Label>
                          <Input
                            type="number"
                            min={1}
                            max={365}
                            value={extendDays}
                            onChange={(e) =>
                              setExtendDays(Math.min(365, Math.max(1, Number(e.target.value))))
                            }
                            className={cn('w-32')}
                          />
                        </div>
                        <AlertDialogFooter>
                          <AlertDialogCancel>취소</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              updateApiKeyExpiration({ apiKeyId: apiKey.id, days: extendDays })
                            }
                            className={cn('bg-black text-white hover:bg-black/50')}
                          >
                            연장
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          type="button"
                          variant="pixel-destructive"
                          className={cn('h-6 border px-2')}
                        >
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Api Key 삭제</AlertDialogTitle>
                          <AlertDialogDescription>
                            정말로 &apos;{apiKey.description}&apos;를 삭제하시겠습니까? 이 작업은
                            되돌릴 수 없습니다.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>취소</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteApiKey(apiKey.id)}
                            className={cn('bg-destructive hover:bg-destructive/90 text-white')}
                          >
                            삭제
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
      </TableBody>
    </Table>
  );
};

export default ApiKeyList;
