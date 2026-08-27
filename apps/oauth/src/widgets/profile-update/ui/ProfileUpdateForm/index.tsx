'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  AuthWindow,
  Button,
  FORM_FIELD_STYLE,
  FORM_TRIGGER_STYLE,
  FormField,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/shared/ui';
import { cn } from '@repo/shared/utils';
import { Controller, useForm } from 'react-hook-form';

import {
  NO_SELECTION_VALUE,
  PROFILE_UPDATE_FIELD_META,
  ProfileUpdateFieldSpec,
  ProfileUpdateFormType,
  ProfileUpdateRequest,
  buildProfileUpdateSchema,
  toProfileUpdateRequest,
} from '@/entities/profile-update';

interface ProfileUpdateFormProps {
  /** 어드민이 수정을 요청한 항목. 여기 없는 항목은 렌더하지 않는다. */
  fields: ProfileUpdateFieldSpec[];
  isPending?: boolean;
  onSubmit: (request: ProfileUpdateRequest) => void;
}

const ProfileUpdateForm = ({ fields, isPending = false, onSubmit }: ProfileUpdateFormProps) => {
  const fieldNames = fields.map((field) => field.name);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileUpdateFormType>({
    resolver: zodResolver(buildProfileUpdateSchema(fieldNames)),
  });

  const handleFormSubmit = handleSubmit((values) => {
    onSubmit(toProfileUpdateRequest(fieldNames, values));
  });

  return (
    <AuthWindow
      windowLabel="Sign Up"
      title="정보 변경"
      description={
        <>
          <p className={cn('leading-[18px]')}>관리자가 정보 변경을 요청했습니다.</p>
          <p className={cn('leading-[18px]')}>
            변경된 정보가 없다면 기존 정보를 그대로 입력하세요.
          </p>
        </>
      }
      isPending={isPending}
    >
      <form onSubmit={handleFormSubmit}>
        <div className={cn('flex flex-col gap-5 px-5 pt-5')}>
          {fields.map(({ name, options }) => {
            const { label, placeholder, maxLength } = PROFILE_UPDATE_FIELD_META[name];
            const error = errors[name];

            return (
              <FormField
                key={name}
                label={label}
                htmlFor={name}
                error={error}
                className={cn('gap-2')}
              >
                {options ? (
                  <Controller
                    control={control}
                    name={name}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger
                          id={name}
                          aria-invalid={!!error}
                          disabled={isPending}
                          className={cn(FORM_TRIGGER_STYLE)}
                        >
                          <SelectValue placeholder={placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem
                            value={NO_SELECTION_VALUE}
                            className={cn('text-muted-foreground')}
                          >
                            선택 안 함
                          </SelectItem>
                          {options.map((option) => (
                            <SelectItem key={option.value} value={String(option.value)}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                ) : (
                  <Input
                    id={name}
                    inputMode="numeric"
                    maxLength={maxLength}
                    placeholder={placeholder}
                    aria-invalid={!!error}
                    disabled={isPending}
                    className={cn(FORM_FIELD_STYLE)}
                    {...register(name)}
                  />
                )}
              </FormField>
            );
          })}
        </div>

        <div className={cn('p-5')}>
          <Button
            type="submit"
            variant="pixel-solid"
            size="lg"
            disabled={isPending}
            className={cn('w-full')}
          >
            Enter
          </Button>
        </div>
      </form>
    </AuthWindow>
  );
};

export default ProfileUpdateForm;
