import {
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/shared/ui';
import { cn } from '@repo/shared/utils';
import { Search } from 'lucide-react';
import { Control, Controller } from 'react-hook-form';

import { AccountFilterType } from '@/entities/account';

interface AccountFilterProps {
  control: Control<AccountFilterType>;
}

const AccountFilter = ({ control }: AccountFilterProps) => {
  return (
    <div className={cn('mt-4 flex flex-wrap items-center gap-4')}>
      <div className={cn('relative flex-1')}>
        <Search
          className={cn('text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2')}
        />
        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <Input
              {...field}
              placeholder="이메일로 검색"
              className={cn('pl-9 rounded-none border-foreground font-mono')}
              onChange={(e) => {
                field.onChange(e.target.value || 'all');
              }}
              value={field.value === 'all' ? '' : field.value}
            />
          )}
        />
      </div>

      <div className={cn('flex items-center gap-2')}>
        <Label className={cn('text-xs uppercase tracking-widest text-muted-foreground font-mono')}>역할:</Label>
        <Controller
          control={control}
          name="role"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className={cn('w-28 rounded-none border-foreground')}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="USER">유저</SelectItem>
                <SelectItem value="ADMIN">어드민</SelectItem>
                <SelectItem value="ROOT">루트</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className={cn('flex items-center gap-2')}>
        <Label className={cn('text-xs uppercase tracking-widest text-muted-foreground font-mono')}>학생 연동:</Label>
        <Controller
          control={control}
          name="isStudent"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className={cn('w-28 rounded-none border-foreground')}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="true">연동됨</SelectItem>
                <SelectItem value="false">미연동</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className={cn('flex items-center gap-2')}>
        <Label className={cn('text-xs uppercase tracking-widest text-muted-foreground font-mono')}>정렬 기준:</Label>
        <Controller
          control={control}
          name="sortBy"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className={cn('w-32 rounded-none border-foreground')}>
                <SelectValue placeholder="기본" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">기본</SelectItem>
                <SelectItem value="ID">ID</SelectItem>
                <SelectItem value="EMAIL">이메일</SelectItem>
                <SelectItem value="ROLE">역할</SelectItem>
                <SelectItem value="CREATED_AT">생성일</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>
    </div>
  );
};

export default AccountFilter;
