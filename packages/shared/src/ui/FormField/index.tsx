'use client';

import * as React from 'react';

import { FormErrorMessage, Label } from '@repo/shared/ui';
import { cn } from '@repo/shared/utils';
import { FieldError } from 'react-hook-form';

/** 폼 다이얼로그의 Input/Textarea 스타일. */
const FORM_FIELD_STYLE = 'border-foreground h-9 rounded-none px-3 text-sm';

/** 폼 다이얼로그의 SelectTrigger 스타일. */
const FORM_TRIGGER_STYLE = 'border-foreground h-9 w-full justify-between px-3 text-sm';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  error?: FieldError | { message?: string };
  className?: string;
  children: React.ReactNode;
}

/** 라벨 + 입력 요소 + 에러 문구를 묶는 폼 다이얼로그용 래퍼. */
const FormField = ({ label, htmlFor, error, className, children }: FormFieldProps) => (
  <div className={cn('flex flex-col gap-1.5', className)}>
    <Label htmlFor={htmlFor} className={cn('text-foreground text-sm font-medium')}>
      {label}
    </Label>
    {children}
    <FormErrorMessage error={error} />
  </div>
);

export { FormField, FORM_FIELD_STYLE, FORM_TRIGGER_STYLE };
export type { FormFieldProps };
