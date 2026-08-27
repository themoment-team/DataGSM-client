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
  DialogTrigger,
  DialogWindow,
  FORM_FIELD_STYLE,
  FORM_TRIGGER_STYLE,
  FormField,
  GradeMemberPicker,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/shared/ui';
import { cn } from '@repo/shared/utils';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronDown } from 'lucide-react';
import { Controller, FieldErrors, SubmitHandler, UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';

import { AddClubType } from '@/entities/club';
import { useCreateClub, useUpdateClub } from '@/widgets/clubs';

const COMBOBOX_STYLE =
  'border-foreground bg-background flex h-9 w-full cursor-pointer items-center justify-between gap-2 rounded-none border px-3 text-left text-sm outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-50';

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

  const windowTitle = mode === 'create' ? 'Add Club' : 'Edit Club';
  const heading = mode === 'create' ? '동아리 추가' : '동아리 데이터 수정';
  const description =
    mode === 'create'
      ? '동아리명, 동아리 종류, 운영 상태등을 작성해주세요.'
      : '수정이 필요한 정보를 변경한 뒤 저장하세요.';

  const getPendingState = () => {
    if (mode === 'create') return isCreating;
    return isUpdating;
  };

  const getSubmitText = () => {
    if (mode === 'create') return '+ Add Club';
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
      <Button variant="pixel-primary" className={cn('px-3')} disabled={isLoadingStudents}>
        + 동아리 추가
      </Button>
    ) : (
      <Button variant="pixel" className={cn('h-6 border px-2')} disabled={isLoadingStudents}>
        Edit
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
      <DialogWindow windowTitle={windowTitle} heading={heading} description={description}>
        <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
          <div className={cn('grid grid-cols-2 gap-4 px-5 pb-2.5 pt-5')}>
            <FormField label="동아리명" htmlFor="name" error={errors.name}>
              <Input
                id="name"
                placeholder="동아리명을 입력하세요"
                className={cn(FORM_FIELD_STYLE)}
                {...register('name')}
              />
            </FormField>

            <FormField label="동아리 종류" htmlFor="type" error={errors.type}>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="type" className={cn(FORM_TRIGGER_STYLE)}>
                      <SelectValue placeholder="동아리 종류를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MAJOR_CLUB">전공</SelectItem>
                      <SelectItem value="AUTONOMOUS_CLUB">자율</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            <FormField label="운영 상태" htmlFor="status" error={errors.status}>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="status" className={cn(FORM_TRIGGER_STYLE)}>
                      <SelectValue placeholder="운영상태를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">운영 중</SelectItem>
                      <SelectItem value="ABOLISHED">폐지</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            <FormField label="설립연도" htmlFor="foundedYear" error={errors.foundedYear}>
              <Input
                id="foundedYear"
                type="number"
                placeholder="설립 연도를 입력하세요"
                className={cn(FORM_FIELD_STYLE)}
                {...register('foundedYear', {
                  setValueAs: (value) => (value === '' ? undefined : Number(value)),
                })}
              />
            </FormField>

            {/* 폐지연도: Figma 시안에는 없지만 폐지 상태 동아리 등록/수정에 필요한 값이라 유지 */}
            {currentStatus === 'ABOLISHED' && (
              <FormField label="폐지연도" htmlFor="abolishedYear" error={errors.abolishedYear}>
                <Input
                  id="abolishedYear"
                  type="number"
                  placeholder="폐지 연도를 입력하세요"
                  className={cn(FORM_FIELD_STYLE)}
                  {...register('abolishedYear', {
                    setValueAs: (value) => (value === '' ? undefined : Number(value)),
                  })}
                />
              </FormField>
            )}

            {currentStatus !== 'ABOLISHED' && (
              <FormField label="부장" htmlFor="leaderId" error={errors.leaderId}>
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
                            id="leaderId"
                            type="button"
                            role="combobox"
                            className={cn(
                              COMBOBOX_STYLE,
                              selectedLeader ? 'text-foreground' : 'text-muted-foreground',
                            )}
                          >
                            {selectedLeader
                              ? `${selectedLeader.studentNumber} ${selectedLeader.name}`
                              : '학생 이름을 직접 입력하세요'}
                            <ChevronDown className={cn('size-4 shrink-0 opacity-50')} />
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
              </FormField>
            )}

            {currentStatus !== 'ABOLISHED' && (
              <FormField
                label="팀원"
                htmlFor="participantIds"
                error={!Array.isArray(errors.participantIds) ? errors.participantIds : undefined}
              >
                <Controller
                  control={control}
                  name="participantIds"
                  render={({ field }) => {
                    const selectedCount = Array.isArray(field.value) ? field.value.length : 0;

                    return (
                      <Popover
                        open={memberPopoverOpen}
                        onOpenChange={(value) => {
                          setMemberPopoverOpen(value);
                          if (!value) setSearchTerm('');
                        }}
                      >
                        <PopoverTrigger asChild>
                          <button
                            id="participantIds"
                            type="button"
                            role="combobox"
                            className={cn(
                              COMBOBOX_STYLE,
                              selectedCount ? 'text-foreground' : 'text-muted-foreground',
                            )}
                          >
                            {selectedCount ? `${selectedCount}명 선택됨` : '팀원을 선택하세요'}
                            <ChevronDown className={cn('size-4 shrink-0 opacity-50')} />
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
                    );
                  }}
                />
              </FormField>
            )}
          </div>

          {currentStatus !== 'ABOLISHED' && (
            <div className={cn('flex flex-col gap-1.5 px-5 pb-2.5 pt-2.5')}>
              <Label className={cn('text-foreground text-sm font-medium')}>팀원 명단</Label>
              <Controller
                control={control}
                name="participantIds"
                render={({ field }) => {
                  const selectedIds = Array.isArray(field.value) ? field.value : [];

                  return (
                    <GradeMemberPicker
                      students={students}
                      selectedIds={selectedIds}
                      onRemove={(studentId) =>
                        field.onChange(field.value.filter((id: number) => id !== studentId))
                      }
                    />
                  );
                }}
              />
            </div>
          )}

          <div className={cn('flex flex-col items-end justify-center p-5')}>
            <Button
              type="submit"
              disabled={isPending}
              variant="pixel-primary"
              className={cn('h-11 w-full px-3')}
            >
              {isPending ? loadingText : submitText}
            </Button>
          </div>
        </form>
      </DialogWindow>
    </Dialog>
  );
};

export default ClubFormDialog;
