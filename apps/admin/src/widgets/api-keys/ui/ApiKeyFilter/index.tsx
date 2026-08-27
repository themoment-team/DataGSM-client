import { FilterOption, FilterSelect } from '@repo/shared/ui';
import { cn } from '@repo/shared/utils';
import { Control, Controller } from 'react-hook-form';

import { ApiKeyFilterType } from '@/entities/api-key';

const IS_EXPIRED_OPTIONS: FilterOption[] = [
  { value: 'all', label: '전체' },
  { value: 'true', label: '만료됨' },
  { value: 'false', label: '사용 가능' },
];

const IS_RENEWABLE_OPTIONS: FilterOption[] = [
  { value: 'all', label: '전체' },
  { value: 'true', label: '갱신 가능' },
  { value: 'false', label: '갱신 불가' },
];

interface ApiKeyFilterProps {
  control: Control<ApiKeyFilterType>;
}

const ApiKeyFilter = ({ control }: ApiKeyFilterProps) => {
  return (
    <div className={cn('flex flex-wrap items-center gap-2')}>
      <div className={cn('ml-auto flex flex-wrap items-center justify-end gap-2')}>
        <Controller
          control={control}
          name="isExpired"
          render={({ field }) => (
            <FilterSelect
              label="만료 여부"
              options={IS_EXPIRED_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              className={cn('w-[200px]')}
            />
          )}
        />

        <Controller
          control={control}
          name="isRenewable"
          render={({ field }) => (
            <FilterSelect
              label="갱신 여부"
              options={IS_RENEWABLE_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              className={cn('w-[200px]')}
            />
          )}
        />
      </div>
    </div>
  );
};

export default ApiKeyFilter;
