import { useEffect, useMemo, useRef, useState } from 'react';

import { Club, Student } from '@repo/shared/types';
import {
  Button,
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  FormErrorMessage,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  SectionCard,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/shared/ui';
import { cn } from '@repo/shared/utils';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronDown, Pencil, Plus, X } from 'lucide-react';
import { Controller, FieldErrors, SubmitHandler, UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';

import { AddClubType } from '@/entities/club';
import { useCreateClub, useUpdateClub } from '@/widgets/clubs';

interface ClubFormDialogProps {
  mode: 'create' | 'edit';
  club?: Club;
  students?: Student[];
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  isLoadingStudents?: boolean;
  form: UseFormReturn<AddClubType>;
}

const ClubFormDialog = ({
  mode,
  club,
  students,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  isLoadingStudents = false,
  form,
}: ClubFormDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledOnOpenChange! : setInternalOpen;

  const {
    control,
    handleSubmit,
    register,
    reset,
    watch,
    getValues,
    setValue,
    formState: { errors },
  } = form;

  const currentStatus = watch('status');
  const currentLeaderId = watch('leaderId');

  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [leaderPopoverOpen, setLeaderPopoverOpen] = useState(false);
  const [memberPopoverOpen, setMemberPopoverOpen] = useState(false);
  const leaderSearchRef = useRef<HTMLInputElement>(null);
  const memberSearchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentStatus === 'ABOLISHED') {
      setValue('leaderId', undefined);
      setValue('participantIds', []);
      return;
    }

    setValue('abolishedYear', undefined);
  }, [currentStatus, setValue]);

  const filteredStudents = useMemo(() => {
    if (!searchTerm) return students;
    const leaderIdNum = currentLeaderId ? Number(currentLeaderId) : undefined;
    return students?.filter(
      (student) =>
        (student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (student.studentNumber?.toString().includes(searchTerm) ?? false) ||
        student.id === leaderIdNum,
    );
  }, [students, searchTerm, currentLeaderId]);

  const { isPending: isCreating, mutate: createClub } = useCreateClub({
    onSuccess: () => {
      setOpen(false);
      reset();
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
      toast.success('동아리 등록에 성공했습니다.');
    },
    onError: (error) => {
      console.error('동아리 등록 실패:', error);
      toast.error('동아리 등록에 실패했습니다.');
    },
  });

  const { isPending: isUpdating, mutate: updateClub } = useUpdateClub({
    onSuccess: () => {
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
      toast.success('동아리 데이터가 수정되었습니다.');
    },
    onError: (error) => {
      console.error('동아리 데이터 수정 실패:', error);
      toast.error('동아리 데이터 수정에 실패했습니다.');
    },
  });

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && club) {
        reset({
          name: club.name,
          type: club.type,
          status: club.status,
          foundedYear: club.foundedYear,
          abolishedYear: club.abolishedYear ?? undefined,
          leaderId: club.leader?.id,
          participantIds: club.participants?.map((p) => p.id) ?? [],
        });
      } else if (mode === 'create') {
        reset({
          name: '',
          type: undefined,
          status: 'ACTIVE',
          foundedYear: undefined,
          abolishedYear: undefined,
          leaderId: undefined,
          participantIds: [],
        });
      }
    }
  }, [mode, club, open, reset]);

  useEffect(() => {
    if (!open) {
      setSearchTerm('');
    }
  }, [open]);

  const onSubmit: SubmitHandler<AddClubType> = (data) => {
    const normalizedData = {
      ...data,
      abolishedYear: data.abolishedYear ?? undefined,
    };

    if (mode === 'create') {
      createClub(normalizedData);
      return;
    }

    if (club) {
      updateClub({ clubId: club.id, data: normalizedData });
    }
  };

  const onInvalid = (errors: FieldErrors<AddClubType>) => {
    const firstError = Object.values(errors)
      .flat()
      .find((error) => error?.message);

    if (firstError?.message) {
      toast.error(String(firstError.message));
    }
  };

  const title = mode === 'create' ? '동아리 추가' : '동아리 데이터 수정';

  const getPendingState = () => {
    if (mode === 'create') return isCreating;
    return isUpdating;
  };

  const getSubmitText = () => {
    if (mode === 'create') return '추가';
    return '수정';
  };

  const getLoadingText = () => {
    if (mode === 'create') return '추가 중...';
    return '수정 중...';
  };

  const isPending = getPendingState();
  const submitText = getSubmitText();
  const loadingText = getLoadingText();

  const defaultTrigger =
    mode === 'create' ? (
      <Button size="sm" className={cn('gap-2')} disabled={isLoadingStudents}>
        <Plus className={cn('h-4 w-4')} />
        동아리 추가
      </Button>
    ) : (
      <Button variant="ghost" size="icon" disabled={isLoadingStudents}>
        <Pencil className={cn('h-4 w-4')} />
      </Button>
    );

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (!value) reset();
      }}
    >
      {!isControlled && <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>}
      <DialogContent className={cn('max-h-[90vh] max-w-2xl overflow-y-auto p-0')}>
        <DialogHeader className={cn('border-foreground border-b-2 px-6 py-5')}>
          <DialogTitle className={cn('font-pixel text-foreground text-[14px] leading-none')}>
            {title}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit, onInvalid)} className={cn('space-y-6 px-6 py-6')}>
          <div className={cn('grid grid-cols-2 gap-4 pt-4')}>
            <div className={cn('space-y-2')}>
              <Label
                htmlFor="name"
                className={cn('text-muted-foreground font-mono text-xs uppercase tracking-widest')}
              >
                동아리명
              </Label>
              <Input
                id="name"
                placeholder="동아리명 입력"
                className={cn('border-foreground rounded-none font-mono')}
                {...register('name')}
              />
              <FormErrorMessage error={errors.name} />
            </div>
            <div className={cn('space-y-2')}>
              <Label
                htmlFor="type"
                className={cn('text-muted-foreground font-mono text-xs uppercase tracking-widest')}
              >
                동아리 종류
              </Label>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className={cn('border-foreground rounded-none font-mono')}>
                      <SelectValue placeholder="타입 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MAJOR_CLUB">전공</SelectItem>
                      <SelectItem value="AUTONOMOUS_CLUB">자율</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <FormErrorMessage error={errors.type} />
            </div>
            <div className={cn('space-y-2')}>
              <Label
                htmlFor="status"
                className={cn('text-muted-foreground font-mono text-xs uppercase tracking-widest')}
              >
                운영 상태
              </Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className={cn('border-foreground rounded-none font-mono')}>
                      <SelectValue placeholder="상태 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">운영 중</SelectItem>
                      <SelectItem value="ABOLISHED">폐지</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <FormErrorMessage error={errors.status} />
            </div>
            <div className={cn('space-y-2')}>
              <Label
                htmlFor="foundedYear"
                className={cn('text-muted-foreground font-mono text-xs uppercase tracking-widest')}
              >
                설립연도
              </Label>
              <Input
                id="foundedYear"
                type="number"
                placeholder="설립연도 입력"
                className={cn('border-foreground rounded-none font-mono')}
                {...register('foundedYear', {
                  setValueAs: (value) => (value === '' ? undefined : Number(value)),
                })}
              />
              <FormErrorMessage error={errors.foundedYear} />
            </div>
            {currentStatus === 'ABOLISHED' && (
              <div className={cn('space-y-2')}>
                <Label
                  htmlFor="abolishedYear"
                  className={cn(
                    'text-muted-foreground font-mono text-xs uppercase tracking-widest',
                  )}
                >
                  폐지연도
                </Label>
                <Input
                  id="abolishedYear"
                  type="number"
                  placeholder="폐지연도 입력"
                  className={cn('border-foreground rounded-none font-mono')}
                  {...register('abolishedYear', {
                    setValueAs: (value) => (value === '' ? undefined : Number(value)),
                  })}
                />
                <FormErrorMessage error={errors.abolishedYear} />
              </div>
            )}
            {currentStatus !== 'ABOLISHED' && (
              <div className={cn('space-y-2')}>
                <Label
                  htmlFor="leaderId"
                  className={cn(
                    'text-muted-foreground font-mono text-xs uppercase tracking-widest',
                  )}
                >
                  부장
                </Label>
                <Controller
                  control={control}
                  name="leaderId"
                  render={({ field }) => {
                    const selectedLeader = students?.find(
                      (student) => student.id === Number(field.value),
                    );

                    return (
                      <Popover
                        open={leaderPopoverOpen}
                        onOpenChange={(value) => {
                          setLeaderPopoverOpen(value);
                          if (!value) setSearchTerm('');
                        }}
                      >
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            role="combobox"
                            className={cn(
                              'border-foreground bg-background flex h-10 w-full cursor-pointer items-center justify-between gap-2 rounded-none border px-3 py-2 text-left font-mono text-xs outline-none transition-colors focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50',
                              selectedLeader ? 'text-foreground' : 'text-muted-foreground',
                            )}
                          >
                            {selectedLeader
                              ? `${selectedLeader.studentNumber} ${selectedLeader.name}`
                              : '부장 선택'}
                            <ChevronDown className={cn('h-4 w-4 shrink-0 opacity-50')} />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          className={cn(
                            'border-foreground w-(--radix-popover-trigger-width) rounded-none border-2 p-0',
                          )}
                          onOpenAutoFocus={(e) => {
                            e.preventDefault();
                            leaderSearchRef.current?.focus();
                          }}
                        >
                          <Command shouldFilter={false}>
                            <CommandInput
                              ref={leaderSearchRef}
                              placeholder="이름 또는 학번 검색..."
                              className={cn('font-mono')}
                              value={searchTerm}
                              onValueChange={setSearchTerm}
                            />
                            <CommandList>
                              <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
                              {filteredStudents?.map((student) => (
                                <CommandItem
                                  key={student.id}
                                  value={student.id.toString()}
                                  onSelect={() => {
                                    const selectedId = student.id;
                                    field.onChange(selectedId);

                                    const participantIds = getValues('participantIds') || [];
                                    if (participantIds.includes(selectedId)) {
                                      setValue(
                                        'participantIds',
                                        participantIds.filter(
                                          (participantId) => participantId !== selectedId,
                                        ),
                                      );
                                    }

                                    setSearchTerm('');
                                    setLeaderPopoverOpen(false);
                                  }}
                                >
                                  {student.studentNumber} {student.name}
                                </CommandItem>
                              ))}
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    );
                  }}
                />
                <FormErrorMessage error={errors.leaderId} />
              </div>
            )}

            {currentStatus !== 'ABOLISHED' && (
              <div className={cn('space-y-2')}>
                <Label
                  className={cn(
                    'text-muted-foreground font-mono text-xs uppercase tracking-widest',
                  )}
                >
                  팀원 추가
                </Label>
                <Controller
                  control={control}
                  name="participantIds"
                  render={({ field }) => (
                    <Popover
                      open={memberPopoverOpen}
                      onOpenChange={(value) => {
                        setMemberPopoverOpen(value);
                        if (!value) setSearchTerm('');
                      }}
                    >
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          role="combobox"
                          className={cn(
                            'border-foreground bg-background flex h-10 w-full cursor-pointer items-center justify-between gap-2 rounded-none border px-3 py-2 text-left font-mono text-xs outline-none transition-colors focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50',
                            'text-muted-foreground',
                          )}
                        >
                          팀원 추가
                          <ChevronDown className={cn('h-4 w-4 shrink-0 opacity-50')} />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        className={cn(
                          'border-foreground w-(--radix-popover-trigger-width) rounded-none border-2 p-0',
                        )}
                        onOpenAutoFocus={(e) => {
                          e.preventDefault();
                          memberSearchRef.current?.focus();
                        }}
                      >
                        <Command shouldFilter={false}>
                          <CommandInput
                            ref={memberSearchRef}
                            placeholder="이름 또는 학번 검색..."
                            className={cn('font-mono')}
                            value={searchTerm}
                            onValueChange={setSearchTerm}
                          />
                          <CommandList>
                            <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
                            {filteredStudents
                              ?.filter(
                                (student) =>
                                  Array.isArray(field.value) &&
                                  !field.value.includes(student.id) &&
                                  student.id !== Number(currentLeaderId),
                              )
                              .map((student) => (
                                <CommandItem
                                  key={student.id}
                                  value={student.id.toString()}
                                  onSelect={() => {
                                    if (
                                      Array.isArray(field.value) &&
                                      !field.value.includes(student.id)
                                    ) {
                                      field.onChange([...field.value, student.id]);
                                    }

                                    setSearchTerm('');
                                    setMemberPopoverOpen(false);
                                  }}
                                >
                                  {student.studentNumber} {student.name}
                                </CommandItem>
                              ))}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  )}
                />
                <FormErrorMessage
                  error={!Array.isArray(errors.participantIds) ? errors.participantIds : undefined}
                />
              </div>
            )}
          </div>

          {currentStatus !== 'ABOLISHED' && (
            <SectionCard
              shadow
              title="Team Members"
              headerAction="remove with click"
              className={cn('bg-background')}
            >
              <div className={cn('flex flex-col gap-5 p-4')}>
                <Controller
                  control={control}
                  name="participantIds"
                  render={({ field }) => {
                    const selectedIds = Array.isArray(field.value) ? field.value : [];
                    const selectedStudents =
                      students?.filter((student) => selectedIds.includes(student.id)) || [];
                    const grades = [1, 2, 3];

                    return (
                      <div className={cn('grid grid-cols-1 gap-4 md:grid-cols-3')}>
                        {grades.map((grade) => (
                          <div
                            key={grade}
                            className={cn(
                              'border-foreground bg-background flex min-h-[240px] flex-col border',
                            )}
                          >
                            <div
                              className={cn(
                                'border-foreground flex items-center justify-between border-b px-3 py-2',
                              )}
                            >
                              <span className={cn('font-pixel text-foreground text-[11px]')}>
                                GRADE {grade}
                              </span>
                              <span className={cn('text-muted-foreground font-mono text-[11px]')}>
                                {
                                  selectedStudents.filter((student) => student.grade === grade)
                                    .length
                                }
                              </span>
                            </div>
                            <div
                              className={cn(
                                '[&::-webkit-scrollbar-thumb]:bg-foreground/30 flex max-h-[300px] flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden p-3 [&::-webkit-scrollbar-thumb]:rounded-none [&::-webkit-scrollbar]:w-1',
                              )}
                            >
                              {selectedStudents
                                .filter((student) => student.grade === grade)
                                .map((student) => (
                                  <button
                                    key={student.id}
                                    type="button"
                                    className={cn(
                                      'border-foreground hover:bg-foreground hover:text-background group flex w-full items-center justify-between gap-3 border px-3 py-2 text-left transition-colors',
                                    )}
                                    onClick={() =>
                                      field.onChange(
                                        field.value.filter((id: number) => id !== student.id),
                                      )
                                    }
                                  >
                                    <span className={cn('min-w-0 flex-1')}>
                                      <span
                                        className={cn(
                                          'text-muted-foreground group-hover:text-background/80 block font-mono text-[11px] uppercase transition-colors',
                                        )}
                                      >
                                        {student.studentNumber}
                                      </span>
                                      <span
                                        className={cn(
                                          'text-foreground group-hover:text-background block truncate font-mono text-xs transition-colors',
                                        )}
                                      >
                                        {student.name}
                                      </span>
                                    </span>
                                    <X
                                      className={cn(
                                        'group-hover:text-background h-4 w-4 shrink-0 transition-colors',
                                      )}
                                    />
                                  </button>
                                ))}
                              {selectedStudents.filter((student) => student.grade === grade)
                                .length === 0 && (
                                <div
                                  className={cn(
                                    'border-foreground/30 bg-muted/10 text-muted-foreground border border-dashed px-3 py-6 text-center font-mono text-[11px] uppercase tracking-[0.18em]',
                                  )}
                                >
                                  등록된 팀원 없음
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  }}
                />
              </div>
            </SectionCard>
          )}

          <div className={cn('flex justify-end pt-2')}>
            <Button type="submit" disabled={isPending}>
              {isPending ? loadingText : submitText}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClubFormDialog;
