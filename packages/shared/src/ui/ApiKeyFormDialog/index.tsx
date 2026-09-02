'use client';

import { useState } from 'react';

import { ApiKeyResponse, AvailableScopeListResponse, UserRoleType } from '@repo/shared/types';
import { Button, Dialog, DialogTrigger, DialogWindow } from '@repo/shared/ui';
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
      <DialogWindow
        windowTitle="API key permission scope"
        description="이 키로 접근할 수 있는 데이터를 고르세요."
        className={cn('sm:max-w-[1020px]')}
      >
        <ApiKeyManager
          className={cn('px-5 pb-5 pt-4')}
          initialApiKeyData={initialApiKeyData}
          initialAvailableScope={initialAvailableScope}
          userRole={userRole}
        />
      </DialogWindow>
    </Dialog>
  );
};

export default ApiKeyFormDialog;
