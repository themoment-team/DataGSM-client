import { Select, SelectContent, SelectItem, SelectTrigger } from '@repo/shared/ui';
import { cn } from '@repo/shared/utils';
import { Control, Controller } from 'react-hook-form';

import { ApiKeyFilterType } from '@/entities/api-key';

interface FilterOption {
  value: string;
  label: string;
}

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

interface FilterSelectProps {
  label: string;
  options: FilterOption[];
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}

const FilterSelect = ({ label, options, value, onChange, className }: FilterSelectProps) => {
  const selected = options.find((option) => option.value === value);
  const isPlaceholder = value === undefined || value === 'all';

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        aria-label={label}
        className={cn('border-foreground h-9 justify-between px-3', className)}
      >
        <span
          className={cn('truncate', isPlaceholder ? 'text-muted-foreground' : 'text-foreground')}
        >
          {label}: {isPlaceholder ? '' : selected?.label}
        </span>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

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
