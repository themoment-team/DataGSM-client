import { Input, Select, SelectContent, SelectItem, SelectTrigger } from '@repo/shared/ui';
import { cn } from '@repo/shared/utils';
import { Search } from 'lucide-react';
import { Control, Controller } from 'react-hook-form';

import { StudentFilterType } from '@/entities/student';

interface FilterOption {
  value: string;
  label: string;
}

const GRADE_OPTIONS: FilterOption[] = [
  { value: 'all', label: '전체' },
  { value: '1', label: '1학년' },
  { value: '2', label: '2학년' },
  { value: '3', label: '3학년' },
];

const CLASS_NUM_OPTIONS: FilterOption[] = [
  { value: 'all', label: '전체' },
  { value: '1', label: '1반' },
  { value: '2', label: '2반' },
  { value: '3', label: '3반' },
  { value: '4', label: '4반' },
];

const SEX_OPTIONS: FilterOption[] = [
  { value: 'all', label: '전체' },
  { value: 'MAN', label: '남성' },
  { value: 'WOMAN', label: '여성' },
];

const ROLE_OPTIONS: FilterOption[] = [
  { value: 'all', label: '전체' },
  { value: 'GENERAL_STUDENT', label: '일반학생' },
  { value: 'DORMITORY_MANAGER', label: '기자위' },
  { value: 'STUDENT_COUNCIL', label: '학생회' },
];

const STATUS_OPTIONS: FilterOption[] = [
  { value: 'ENROLLED', label: '재학' },
  { value: 'GRADUATE', label: '졸업' },
  { value: 'WITHDRAWN', label: '자퇴' },
];

const SORT_BY_OPTIONS: FilterOption[] = [
  { value: 'all', label: '기본' },
  { value: 'ID', label: 'ID' },
  { value: 'NAME', label: '이름' },
  { value: 'EMAIL', label: '이메일' },
  { value: 'STUDENT_NUMBER', label: '학번' },
  { value: 'GRADE', label: '학년' },
  { value: 'CLASS_NUM', label: '반' },
  { value: 'NUMBER', label: '번호' },
  { value: 'MAJOR', label: '전공' },
  { value: 'ROLE', label: '역할' },
  { value: 'SEX', label: '성별' },
  { value: 'DORMITORY_ROOM', label: '기숙사 호실' },
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

interface StudentFilterProps {
  control: Control<StudentFilterType>;
}

const StudentFilter = ({ control }: StudentFilterProps) => {
  return (
    <div className={cn('flex flex-wrap items-center gap-2')}>
      <div className={cn('relative w-[320px] max-w-full')}>
        <Search
          className={cn('text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2')}
        />
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <Input
              {...field}
              placeholder="학생이름으로 검색하세요"
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
          name="grade"
          render={({ field }) => (
            <FilterSelect
              label="학년"
              options={GRADE_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              className={cn('w-[100px]')}
            />
          )}
        />

        <Controller
          control={control}
          name="classNum"
          render={({ field }) => (
            <FilterSelect
              label="반"
              options={CLASS_NUM_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              className={cn('w-[100px]')}
            />
          )}
        />

        <Controller
          control={control}
          name="sex"
          render={({ field }) => (
            <FilterSelect
              label="성별"
              options={SEX_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              className={cn('w-[100px]')}
            />
          )}
        />

        <Controller
          control={control}
          name="role"
          render={({ field }) => (
            <FilterSelect
              label="구분"
              options={ROLE_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              className={cn('w-[160px]')}
            />
          )}
        />

        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <FilterSelect
              label="재학 여부"
              options={STATUS_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              className={cn('w-[160px]')}
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

export default StudentFilter;
