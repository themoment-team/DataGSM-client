import { Input, Select, SelectContent, SelectItem, SelectTrigger } from '@repo/shared/ui';
import { cn } from '@repo/shared/utils';
import { Search } from 'lucide-react';
import { Control, Controller } from 'react-hook-form';

import { ClubFilterType } from '@/entities/club';

interface FilterOption {
  value: string;
  label: string;
}

const CLUB_TYPE_OPTIONS: FilterOption[] = [
  { value: 'all', label: '전체' },
  { value: 'MAJOR_CLUB', label: '전공' },
  { value: 'AUTONOMOUS_CLUB', label: '자율' },
];

const STATUS_OPTIONS: FilterOption[] = [
  { value: 'all', label: '전체' },
  { value: 'ACTIVE', label: '운영 중' },
  { value: 'ABOLISHED', label: '폐지' },
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

interface ClubFilterProps {
  control: Control<ClubFilterType>;
}

const ClubFilter = ({ control }: ClubFilterProps) => {
  return (
    <div className={cn('flex flex-wrap items-center gap-2')}>
      <div className={cn('relative w-[320px] max-w-full')}>
        <Search
          className={cn('text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2')}
        />
        <Controller
          control={control}
          name="clubName"
          render={({ field }) => (
            <Input
              {...field}
              placeholder="동아리 이름으로 검색하세요"
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
          name="clubType"
          render={({ field }) => (
            <FilterSelect
              label="종류"
              options={CLUB_TYPE_OPTIONS}
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
              value={field.value ?? 'all'}
              onChange={(value) =>
                field.onChange(value === 'all' ? undefined : (value as ClubFilterType['status']))
              }
              className={cn('w-[120px]')}
            />
          )}
        />
      </div>
    </div>
  );
};

export default ClubFilter;
