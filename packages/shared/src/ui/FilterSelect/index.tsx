'use client';

import { Select, SelectContent, SelectItem, SelectTrigger } from '@repo/shared/ui';
import { cn } from '@repo/shared/utils';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  label: string;
  options: FilterOption[];
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}

/** 라벨이 트리거 안에 들어가는 어드민 목록 필터용 Select. */
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

export { FilterSelect };
export type { FilterOption, FilterSelectProps };
