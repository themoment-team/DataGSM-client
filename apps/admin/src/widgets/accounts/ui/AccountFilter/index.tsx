import { FilterOption, FilterSelect, Input } from '@repo/shared/ui';
import { cn } from '@repo/shared/utils';
import { Search } from 'lucide-react';
import { Control, Controller } from 'react-hook-form';

import { AccountFilterType } from '@/entities/account';

const ROLE_OPTIONS: FilterOption[] = [
  { value: 'all', label: '전체' },
  { value: 'USER', label: '유저' },
  { value: 'ADMIN', label: '어드민' },
  { value: 'ROOT', label: '루트' },
];

const OBJECT_TYPE_OPTIONS: FilterOption[] = [
  { value: 'all', label: '전체' },
  { value: 'STUDENT', label: '학생' },
  { value: 'TEACHER', label: '선생님' },
];

const STATUS_OPTIONS: FilterOption[] = [
  { value: 'all', label: '전체' },
  { value: 'PENDING', label: '승인대기' },
  { value: 'ACTIVE', label: '활성' },
];

const SORT_BY_OPTIONS: FilterOption[] = [
  { value: 'all', label: '기본' },
  { value: 'ID', label: 'ID' },
  { value: 'EMAIL', label: '이메일' },
  { value: 'ROLE', label: '역할' },
  { value: 'CREATED_AT', label: '생성일' },
];

interface AccountFilterProps {
  control: Control<AccountFilterType>;
}

const AccountFilter = ({ control }: AccountFilterProps) => {
  return (
    <div className={cn('flex flex-wrap items-center gap-2')}>
      <div className={cn('relative w-[320px] max-w-full')}>
        <Search
          className={cn('text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2')}
        />
        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <Input
              {...field}
              placeholder="이메일로 검색하세요"
              className={cn('border-foreground rounded-none pl-9')}
              onChange={(e) => {
                field.onChange(e.target.value || 'all');
              }}
              value={field.value === 'all' ? '' : field.value}
            />
          )}
        />
      </div>

      <div className={cn('ml-auto flex flex-wrap items-center justify-end gap-2')}>
        <Controller
          control={control}
          name="role"
          render={({ field }) => (
            <FilterSelect
              label="역할"
              options={ROLE_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              className={cn('w-[120px]')}
            />
          )}
        />

        <Controller
          control={control}
          name="objectType"
          render={({ field }) => (
            <FilterSelect
              label="종류"
              options={OBJECT_TYPE_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              className={cn('w-[120px]')}
            />
          )}
        />

        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <FilterSelect
              label="상태"
              options={STATUS_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              className={cn('w-[120px]')}
            />
          )}
        />

        <Controller
          control={control}
          name="sortBy"
          render={({ field }) => (
            <FilterSelect
              label="정렬"
              options={SORT_BY_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              className={cn('w-[160px]')}
            />
          )}
        />
      </div>
    </div>
  );
};

export default AccountFilter;
