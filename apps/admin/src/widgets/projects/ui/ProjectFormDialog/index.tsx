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
  DialogTrigger,
  DialogWindow,
  FormErrorMessage,
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
  Textarea,
} from '@repo/shared/ui';
import { cn } from '@repo/shared/utils';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronDown } from 'lucide-react';
import { Controller, FieldError, FieldErrors, SubmitHandler, UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';

import { AddProjectType } from '@/entities/project';
import {
  useCreateProject,
  useEndProject,
  useReactivateProject,
  useUpdateProject,
} from '@/views/projects/model';

const FIELD_STYLE = 'border-foreground h-9 rounded-none px-3 text-sm';
const TRIGGER_STYLE = 'border-foreground h-9 w-full justify-between px-3 text-sm';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  error?: FieldError | { message?: string };
  className?: string;
  children: React.ReactNode;
}

const FormField = ({ label, htmlFor, error, className, children }: FormFieldProps) => (
  <div className={cn('flex flex-col gap-1.5', className)}>
    <Label htmlFor={htmlFor} className={cn('text-foreground text-sm font-medium')}>
      {label}
    </Label>
    {children}
    <FormErrorMessage error={error} />
  </div>
);

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

  const windowTitle = mode === 'create' ? 'Add Project' : 'Edit Project';
  const heading = mode === 'create' ? '프로젝트 추가' : '프로젝트 데이터 수정';
  const description =
    mode === 'create'
      ? '프로젝트명, 운영 상태, 시작 연도등을 작성해주세요.'
      : '수정이 필요한 정보를 변경한 뒤 저장하세요.';

  const getPendingState = () => {
    if (mode === 'create') return isSubmitting || isCreating;
    return isSubmitting || isUpdating || isEnding || isReactivating;
  };

  const getSubmitText = () => {
    if (mode === 'create') return '+ Add Project';
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
      <Button
        type="button"
        variant="pixel-primary"
        className={cn('px-3')}
        disabled={isLoadingStudents}
      >
        + 프로젝트 추가
      </Button>
    ) : (
      <Button
        type="button"
        variant="pixel"
        className={cn('h-6 border px-2')}
        disabled={isLoadingStudents}
      >
        Edit
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
      <DialogWindow windowTitle={windowTitle} heading={heading} description={description}>
        <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
          <div className={cn('grid grid-cols-2 gap-4 px-5 pb-2.5 pt-5')}>
            <FormField label="프로젝트명" htmlFor="name" error={errors.name}>
              <Input
                id="name"
                placeholder="프로젝트명을 입력하세요"
                className={cn(FIELD_STYLE)}
                {...register('name')}
              />
            </FormField>

            <FormField label="동아리" htmlFor="clubId" error={errors.clubId}>
              <Controller
                control={control}
                name="clubId"
                render={({ field }) => (
                  <Select
                    value={field.value ? String(field.value) : 'none'}
                    onValueChange={(val) => field.onChange(val === 'none' ? 0 : Number(val))}
                  >
                    <SelectTrigger id="clubId" className={cn(TRIGGER_STYLE)}>
                      <SelectValue placeholder="동아리 종류를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" className={cn('text-muted-foreground')}>
                        선택 안 함
                      </SelectItem>
                      {clubs.map((club) => (
                        <SelectItem key={club.id} value={String(club.id)}>
                          {club.name}
                        </SelectItem>
                      ))}
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
                    <SelectTrigger id="status" className={cn(TRIGGER_STYLE)}>
                      <SelectValue placeholder="운영상태를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">운영 중</SelectItem>
                      <SelectItem value="ENDED">종료</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            <FormField label="시작 연도" htmlFor="startYear" error={errors.startYear}>
              <Input
                id="startYear"
                type="number"
                placeholder="시작 연도를 입력하세요"
                className={cn(FIELD_STYLE)}
                {...register('startYear', {
                  setValueAs: (value) => (value === '' ? undefined : Number(value)),
                })}
              />
            </FormField>

            {/* 종료 연도: Figma 시안에는 없지만 운영 종료 처리에 필요한 값이라 유지 */}
            {currentStatus === 'ENDED' && (
              <FormField label="종료 연도" htmlFor="endYear" error={errors.endYear}>
                <Input
                  id="endYear"
                  type="number"
                  placeholder="종료 연도를 입력하세요"
                  className={cn(FIELD_STYLE)}
                  {...register('endYear', {
                    setValueAs: (value) => (value === '' ? undefined : Number(value)),
                  })}
                />
              </FormField>
            )}

            <FormField
              label="설명"
              htmlFor="description"
              error={errors.description}
              className={cn('col-span-2')}
            >
              <Textarea
                id="description"
                placeholder="프로젝트 설명을 입력하세요"
                className={cn(
                  'border-foreground min-h-[80px] resize-none rounded-none px-3 text-sm',
                )}
                {...register('description')}
              />
            </FormField>

            <FormField
              label="팀원"
              error={Array.isArray(errors.participantIds) ? undefined : errors.participantIds}
              className={cn('col-start-1')}
            >
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
                          'border-foreground bg-background text-muted-foreground flex h-9 w-full cursor-pointer items-center justify-between gap-2 rounded-none border px-3 text-left text-sm outline-none transition-colors focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50',
                        )}
                      >
                        학생 이름을 직접 입력하세요
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
                          className={cn('text-sm')}
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
            </FormField>
          </div>

          <div className={cn('flex flex-col gap-1.5 px-5 pb-2.5 pt-2.5')}>
            <Label className={cn('text-foreground text-sm font-medium')}>팀원 명단</Label>
            <Controller
              control={control}
              name="participantIds"
              render={({ field }) => {
                const selectedIds = Array.isArray(field.value) ? field.value : [];
                const selectedStudents =
                  students?.filter((student) => selectedIds.includes(student.id)) || [];

                return (
                  <div className={cn('flex items-stretch gap-2')}>
                    {[1, 2, 3].map((grade) => (
                      <div
                        key={grade}
                        className={cn(
                          'border-foreground bg-background flex flex-1 flex-col border',
                        )}
                      >
                        <div className={cn('bg-foreground flex items-center px-4 py-3')}>
                          <span
                            className={cn('text-background font-pixel text-[9px] leading-none')}
                          >
                            Grade {grade}
                          </span>
                        </div>
                        <div
                          className={cn(
                            'bg-foreground text-background flex items-center px-5 py-1.5 text-[13px] leading-[1.6]',
                          )}
                        >
                          <span className={cn('w-[60px] shrink-0')}>학번</span>
                          <span className={cn('flex-1')}>이름</span>
                        </div>
                        <div className={cn('max-h-[160px] min-h-[80px] overflow-y-auto')}>
                          {selectedStudents
                            .filter((student) => student.grade === grade)
                            .map((student) => (
                              <div
                                key={student.id}
                                className={cn(
                                  'border-foreground -mt-px flex items-center gap-2 border px-5 py-2 first:mt-0',
                                )}
                              >
                                <span
                                  className={cn(
                                    'text-muted-foreground w-[60px] shrink-0 truncate font-mono text-xs leading-6',
                                  )}
                                >
                                  {student.studentNumber}
                                </span>
                                <span
                                  className={cn(
                                    'text-muted-foreground min-w-0 flex-1 truncate font-mono text-xs leading-6',
                                  )}
                                >
                                  {student.name}
                                </span>
                                <button
                                  type="button"
                                  className={cn(
                                    'text-foreground shrink-0 cursor-pointer px-2 font-mono text-xs leading-4 tracking-[0.1em] transition-opacity hover:opacity-60',
                                  )}
                                  onClick={() =>
                                    field.onChange(
                                      field.value.filter((id: number) => id !== student.id),
                                    )
                                  }
                                >
                                  X<span className={cn('sr-only')}>{student.name} 제외</span>
                                </button>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              }}
            />
          </div>

          <div className={cn('flex flex-col items-end justify-center p-5')}>
            <Button
              type="submit"
              variant="pixel-primary"
              className={cn('h-10 w-full px-3')}
              disabled={isPending}
            >
              {isPending ? loadingText : submitText}
            </Button>
          </div>
        </form>
      </DialogWindow>
    </Dialog>
  );
};

export default ProjectFormDialog;
