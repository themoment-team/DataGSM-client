'use client';

import { useState } from 'react';

import { ApiKeyResponse, AvailableScopeListResponse, UserRoleType } from '@repo/shared/types';
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@repo/shared/ui';
import { cn } from '@repo/shared/utils';

import ApiKeyManager from '../ApiKeyManager';

interface ApiKeyFormDialogProps {
  trigger?: React.ReactNode;
  initialApiKeyData?: ApiKeyResponse;
  initialAvailableScope?: AvailableScopeListResponse;
  userRole: UserRoleType;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const ApiKeyFormDialog = ({
  trigger,
  initialApiKeyData,
  initialAvailableScope,
  userRole,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: ApiKeyFormDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledOnOpenChange! : setInternalOpen;

  const defaultTrigger = (
    <Button type="button" variant="pixel-primary" className={cn('px-3')}>
      API 키 관리
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>}
      <DialogContent
        showCloseButton={false}
        className={cn(
          'border-foreground max-h-[90vh] gap-0 overflow-y-auto border-2 p-0 sm:max-w-[1020px]',
        )}
      >
        <div
          className={cn(
            'bg-foreground text-background flex items-center justify-between px-4 py-3',
          )}
        >
          <DialogTitle className={cn('font-pixel text-[9px] font-normal leading-none')}>
            API key permission scope
          </DialogTitle>
          <DialogClose
            className={cn(
              'flex h-6 cursor-pointer items-center justify-center px-2 font-mono text-xs leading-4 tracking-[0.1em] transition-opacity hover:opacity-70',
            )}
          >
            X<span className={cn('sr-only')}>닫기</span>
          </DialogClose>
        </div>

        {/* 시안의 "권한 범위 / 이 키로 접근할 수 있는 데이터를 고르세요." 문구는
            ApiKeyForm 안에서 노출되므로, 여기서는 접근성용으로만 제공한다. */}
        <DialogDescription className={cn('sr-only')}>
          이 키로 접근할 수 있는 데이터를 고르세요.
        </DialogDescription>

        <ApiKeyManager
          className={cn('px-5 pb-5 pt-4')}
          initialApiKeyData={initialApiKeyData}
          initialAvailableScope={initialAvailableScope}
          userRole={userRole}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyFormDialog;
