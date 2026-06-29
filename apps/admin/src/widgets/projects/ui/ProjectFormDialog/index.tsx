import { useEffect, useMemo, useRef, useState } from 'react';

import { Club, Project, Student } from '@repo/shared/types';
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
  Textarea,
} from '@repo/shared/ui';
import { cn } from '@repo/shared/utils';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronDown, Pencil, Plus, X } from 'lucide-react';
import { Controller, FieldErrors, SubmitHandler, UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';

import { AddProjectType } from '@/entities/project';
import {
  useCreateProject,
  useEndProject,
  useReactivateProject,
  useUpdateProject,
} from '@/views/projects/model';

interface ProjectFormDialogProps {
  mode: 'create' | 'edit';
  project?: Project;
  clubs: Club[];
  students?: Student[];
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  isLoadingStudents?: boolean;
  form: UseFormReturn<AddProjectType>;
}

const ProjectFormDialog = ({
  mode,
  project,
  clubs,
  students,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  isLoadingStudents = false,
  form,
}: ProjectFormDialogProps) => {
  const queryClient = useQueryClient();
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledOnOpenChange! : setInternalOpen;

  const {
    handleSubmit,
    register,
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const currentStatus = watch('status');
  const [searchTerm, setSearchTerm] = useState('');
  const [memberPopoverOpen, setMemberPopoverOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const memberSearchRef = useRef<HTMLInputElement>(null);

  const filteredStudents = useMemo(() => {
    if (!searchTerm) return students;
    return students?.filter(
      (student) =>
        (student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (student.studentNumber?.toString().includes(searchTerm) ?? false),
    );
  }, [students, searchTerm]);

  const { mutateAsync: createProject, isPending: isCreating } = useCreateProject();
  const { mutateAsync: updateProject, isPending: isUpdating } = useUpdateProject();
  const { mutateAsync: endProject, isPending: isEnding } = useEndProject();
  const { mutateAsync: reactivateProject, isPending: isReactivating } = useReactivateProject();

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && project) {
        reset({
          name: project.name,
          description: project.description,
          startYear: project.startYear,
          clubId: project.club?.id || 0,
          participantIds: project.participants.map((p) => p.id),
          status: project.status,
          endYear: project.endYear ?? undefined,
        });
      } else if (mode === 'create') {
        reset({
          name: '',
          description: '',
          startYear: undefined,
          clubId: 0,
          participantIds: [],
          status: 'ACTIVE',
          endYear: undefined,
        });
      }
    }
  }, [mode, project, open, reset]);

  useEffect(() => {
    if (currentStatus === 'ACTIVE') {
      setValue('endYear', undefined);
    }
  }, [currentStatus, setValue]);

  useEffect(() => {
    if (!open) {
      setSearchTerm('');
    }
  }, [open]);

  const onSubmit: SubmitHandler<AddProjectType> = async (data) => {
    setIsSubmitting(true);

    const formattedData = {
      ...data,
      clubId: data.clubId === 0 ? null : data.clubId,
      endYear: data.status === 'ENDED' ? data.endYear : undefined,
    };

    try {
      if (mode === 'create') {
        await createProject(formattedData);
        toast.success('프로젝트가 등록되었습니다.');
      } else if (mode === 'edit' && project) {
        await updateProject({ projectId: project.id, data: formattedData });

        const isStatusChanged = project.status !== formattedData.status;
        const isEndYearChanged = project.endYear !== (formattedData.endYear ?? null);

        if (
          formattedData.status === 'ENDED' &&
          formattedData.endYear !== undefined &&
          (isStatusChanged || isEndYearChanged)
        ) {
          await endProject({ projectId: project.id, endYear: formattedData.endYear });
        } else if (isStatusChanged && project.status === 'ENDED') {
          await reactivateProject(project.id);
        }

        toast.success('프로젝트 데이터가 수정되었습니다.');
      }

      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setOpen(false);
      reset();
    } catch {
      toast.error(
        mode === 'create'
          ? '프로젝트 등록에 실패했습니다.'
          : '프로젝트 데이터 수정에 실패했습니다.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const onInvalid = (errors: FieldErrors<AddProjectType>) => {
    const firstError = Object.values(errors)
      .flat()
      .find((error) => error?.message);

    if (firstError?.message) {
      toast.error(String(firstError.message));
    }
  };

  const title = mode === 'create' ? '프로젝트 추가' : '프로젝트 데이터 수정';

  const getPendingState = () => {
    if (mode === 'create') return isSubmitting || isCreating;
    return isSubmitting || isUpdating || isEnding || isReactivating;
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
        프로젝트 추가
      </Button>
    ) : (
      <Button variant="ghost" size="icon" disabled={isLoadingStudents}>
        <Pencil className={cn('h-4 w-4')} />
      </Button>
    );

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
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
                프로젝트명
              </Label>
              <Input
                id="name"
                placeholder="프로젝트명 입력"
                className={cn('border-foreground rounded-none font-mono')}
                {...register('name')}
              />
              <FormErrorMessage error={errors.name} />
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
                      <SelectItem value="ENDED">종료</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <FormErrorMessage error={errors.status} />
            </div>
            <div
              className={cn(
                'col-span-2 grid gap-4',
                currentStatus === 'ENDED' ? 'md:grid-cols-3' : 'md:grid-cols-2',
              )}
            >
              <div className={cn('space-y-2')}>
                <Label
                  htmlFor="startYear"
                  className={cn(
                    'text-muted-foreground font-mono text-xs uppercase tracking-widest',
                  )}
                >
                  시작 연도
                </Label>
                <Input
                  id="startYear"
                  type="number"
                  placeholder="시작 연도 입력"
                  className={cn('border-foreground rounded-none font-mono')}
                  {...register('startYear', {
                    setValueAs: (value) => (value === '' ? undefined : Number(value)),
                  })}
                />
                <FormErrorMessage error={errors.startYear} />
              </div>
              {currentStatus === 'ENDED' && (
                <div className={cn('space-y-2')}>
                  <Label
                    htmlFor="endYear"
                    className={cn(
                      'text-muted-foreground font-mono text-xs uppercase tracking-widest',
                    )}
                  >
                    종료 연도
                  </Label>
                  <Input
                    id="endYear"
                    type="number"
                    placeholder="종료 연도 입력"
                    className={cn('border-foreground rounded-none font-mono')}
                    {...register('endYear', {
                      setValueAs: (value) => (value === '' ? undefined : Number(value)),
                    })}
                  />
                  <FormErrorMessage error={errors.endYear} />
                </div>
              )}
              <div className={cn('space-y-2')}>
                <Label
                  htmlFor="clubId"
                  className={cn(
                    'text-muted-foreground font-mono text-xs uppercase tracking-widest',
                  )}
                >
                  동아리
                </Label>
                <Controller
                  control={control}
                  name="clubId"
                  render={({ field }) => (
                    <Select
                      value={field.value ? String(field.value) : 'none'}
                      onValueChange={(val) => field.onChange(val === 'none' ? 0 : Number(val))}
                    >
                      <SelectTrigger className={cn('border-foreground rounded-none font-mono')}>
                        <SelectValue placeholder="동아리 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">선택 안 함</SelectItem>
                        {clubs.map((club) => (
                          <SelectItem key={club.id} value={String(club.id)}>
                            {club.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FormErrorMessage error={errors.clubId} />
              </div>
            </div>
            <div className={cn('col-span-2 space-y-2')}>
              <Label
                htmlFor="description"
                className={cn('text-muted-foreground font-mono text-xs uppercase tracking-widest')}
              >
                설명
              </Label>
              <Textarea
                id="description"
                placeholder="프로젝트 설명 입력"
                className={cn('border-foreground min-h-[100px] resize-none rounded-none font-mono')}
                {...register('description')}
              />
              <FormErrorMessage error={errors.description} />
            </div>

            <div className={cn('col-span-2 space-y-2')}>
              <Label
                className={cn('text-muted-foreground font-mono text-xs uppercase tracking-widest')}
              >
                팀원 추가
              </Label>
              <Controller
                control={control}
                name="participantIds"
                render={({ field }) => (
                  <Popover
                    open={memberPopoverOpen}
                    onOpenChange={(v) => {
                      setMemberPopoverOpen(v);
                      if (!v) setSearchTerm('');
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
                              (s) => Array.isArray(field.value) && !field.value.includes(s.id),
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
                error={Array.isArray(errors.participantIds) ? undefined : errors.participantIds}
              />
            </div>
          </div>

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
                    students?.filter((s) => selectedIds.includes(s.id)) || [];

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
                              {selectedStudents.filter((s) => s.grade === grade).length}
                            </span>
                          </div>
                          <div
                            className={cn(
                              '[&::-webkit-scrollbar-thumb]:bg-foreground/30 max-h-75 flex flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden p-3 [&::-webkit-scrollbar-thumb]:rounded-none [&::-webkit-scrollbar]:w-1',
                            )}
                          >
                            {selectedStudents
                              .filter((s) => s.grade === grade)
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
                            {selectedStudents.filter((s) => s.grade === grade).length === 0 && (
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

export default ProjectFormDialog;
