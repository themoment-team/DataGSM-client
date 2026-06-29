import { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { SPECIALTY_OPTIONS } from '@repo/shared/constants';
import { ClubListData, Student } from '@repo/shared/types';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  FormErrorMessage,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/shared/ui';
import { cn } from '@repo/shared/utils';
import { useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, X } from 'lucide-react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { AddStudentSchema, AddStudentType } from '@/entities/student';
import { useCreateStudent, useUpdateStudent, useUpdateStudentStatus } from '@/widgets/students';

interface StudentFormDialogProps {
  clubs?: ClubListData;
  mode: 'create' | 'edit';
  student?: Student;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  isLoadingClubs?: boolean;
}

const StudentFormDialog = ({
  clubs,
  mode,
  student,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  isLoadingClubs = false,
}: StudentFormDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isCustomSpecialty, setIsCustomSpecialty] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledOnOpenChange! : setInternalOpen;

  const queryClient = useQueryClient();

  const { isPending: isCreating, mutate: createStudent } = useCreateStudent({
    onSuccess: () => {
      setOpen(false);
      reset();
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('학생 등록에 성공했습니다.');
    },
    onError: (error) => {
      console.error('학생 등록 실패:', error);
      toast.error('학생 등록에 실패했습니다.');
    },
  });

  const { isPending: isUpdating, mutate: updateStudent } = useUpdateStudent({
    onSuccess: () => {
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('학생 데이터가 수정되었습니다.');
    },
    onError: (error) => {
      console.error('학생 데이터 수정 실패:', error);
      toast.error('학생 데이터 수정에 실패했습니다.');
    },
  });

  const { isPending: isUpdatingStatus, mutate: updateStatus } = useUpdateStudentStatus({
    onError: (error) => {
      console.error('학생 상태 수정 실패:', error);
      toast.error('학생 상태 수정에 실패했습니다.');
    },
  });

  const {
    control,
    handleSubmit,
    register,
    reset,
    watch,
    formState: { errors, dirtyFields },
  } = useForm<AddStudentType>({
    resolver: zodResolver(AddStudentSchema),
    defaultValues:
      mode === 'edit' && student
        ? {
            name: student.name,
            sex: student.sex,
            email: student.email,
            grade: student.grade,
            classNum: student.classNum,
            number: student.number,
            role: student.role,
            dormitoryRoomNumber: student.dormitoryRoom,
            specialty: student.specialty ?? null,
            githubId: student.githubId ?? null,
            majorClubId: student.majorClub?.id || null,
            autonomousClubId: student.autonomousClub?.id || null,
          }
        : undefined,
  });

  useEffect(() => {
    if (mode === 'edit' && student && open) {
      const isCustom =
        !!student.specialty &&
        !SPECIALTY_OPTIONS.includes(student.specialty as (typeof SPECIALTY_OPTIONS)[number]);
      setIsCustomSpecialty(isCustom);
      reset({
        name: student.name,
        sex: student.sex,
        email: student.email,
        grade: student.grade,
        classNum: student.classNum,
        number: student.number,
        role: student.role,
        dormitoryRoomNumber: student.dormitoryRoom,
        specialty: student.specialty ?? null,
        githubId: student.githubId ?? null,
        majorClubId: student.majorClub?.id || null,
        autonomousClubId: student.autonomousClub?.id || null,
      });
    }
    if (!open) {
      setIsCustomSpecialty(false);
    }
  }, [mode, student, open, reset]);

  const currentRole = watch('role');
  const isInactive = currentRole === 'GRADUATE' || currentRole === 'WITHDRAWN';

  const onSubmit: SubmitHandler<AddStudentType> = (data) => {
    if (mode === 'create') {
      createStudent(data);
      return;
    }

    if (mode === 'edit' && student) {
      const isRoleChanged = !!dirtyFields.role;
      const isOtherDataChanged = Object.keys(dirtyFields).some((key) => key !== 'role');

      if (isRoleChanged) {
        updateStatus(
          { studentId: student.id, role: data.role },
          {
            onSuccess: () => {
              if (isOtherDataChanged) {
                updateStudent({ studentId: student.id, data });
              } else {
                setOpen(false);
                queryClient.invalidateQueries({ queryKey: ['students'] });
                toast.success('학생 상태가 수정되었습니다.');
              }
            },
          },
        );
      } else if (isOtherDataChanged) {
        updateStudent({ studentId: student.id, data });
      }
    }
  };

  const title = mode === 'create' ? 'ADD STUDENT' : 'EDIT STUDENT';

  const getPendingState = () => {
    if (mode === 'create') return isCreating;
    return isUpdating || isUpdatingStatus;
  };

  const getSubmitText = () => {
    if (mode === 'create') return '추가';
    if (currentRole === 'WITHDRAWN') return '자퇴생 처리';
    if (currentRole === 'GRADUATE') return '졸업생 처리';
    return '수정';
  };

  const getLoadingText = () => {
    if (mode === 'create') return '추가 중...';
    if (currentRole === 'WITHDRAWN') return '처리 중...';
    if (currentRole === 'GRADUATE') return '처리 중...';
    return '수정 중...';
  };

  const isPending = getPendingState();
  const submitText = getSubmitText();
  const loadingText = getLoadingText();

  const defaultTrigger =
    mode === 'create' ? (
      <Button size="sm" className={cn('gap-2')} disabled={isLoadingClubs}>
        <Plus className={cn('h-4 w-4')} />
        학생 추가
      </Button>
    ) : (
      <Button variant="ghost" size="icon" disabled={isLoadingClubs}>
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
          <DialogTitle className={cn('font-pixel text-[14px] leading-none')}>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className={cn('space-y-6 px-6 py-6')}>
          <div className={cn('grid grid-cols-2 gap-4')}>
            <div className={cn('space-y-2')}>
              <Label
                htmlFor="name"
                className={cn('text-muted-foreground font-mono text-xs uppercase tracking-widest')}
              >
                이름
              </Label>
              <Input
                id="name"
                placeholder="이름 입력"
                className={cn('border-foreground rounded-none font-mono')}
                {...register('name')}
              />
              <FormErrorMessage error={errors.name} />
            </div>
            <div className={cn('space-y-2')}>
              <Label
                htmlFor="sex"
                className={cn('text-muted-foreground font-mono text-xs uppercase tracking-widest')}
              >
                성별
              </Label>
              <Controller
                control={control}
                name="sex"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className={cn('border-foreground rounded-none')}>
                      <SelectValue placeholder="성별 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MAN">남</SelectItem>
                      <SelectItem value="WOMAN">여</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <FormErrorMessage error={errors.sex} />
            </div>
            <div className={cn('space-y-2')}>
              <Label
                htmlFor="email"
                className={cn('text-muted-foreground font-mono text-xs uppercase tracking-widest')}
              >
                이메일
              </Label>
              <Input
                id="email"
                placeholder="example@gsm.hs.kr"
                className={cn('border-foreground rounded-none font-mono')}
                {...register('email')}
              />
              <FormErrorMessage error={errors.email} />
            </div>
            <div className={cn('space-y-2')}>
              <Label
                htmlFor="grade"
                className={cn('text-muted-foreground font-mono text-xs uppercase tracking-widest')}
              >
                학년
              </Label>
              {isInactive ? (
                <div
                  className={cn(
                    'border-foreground/30 bg-muted h-10 w-full cursor-not-allowed rounded-none border',
                  )}
                />
              ) : (
                <>
                  <Controller
                    control={control}
                    name="grade"
                    render={({ field }) => (
                      <Select
                        value={field.value ? String(field.value) : undefined}
                        onValueChange={(val) => field.onChange(Number(val))}
                      >
                        <SelectTrigger className={cn('border-foreground rounded-none')}>
                          <SelectValue placeholder="학년 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1학년</SelectItem>
                          <SelectItem value="2">2학년</SelectItem>
                          <SelectItem value="3">3학년</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FormErrorMessage error={errors.grade} />
                </>
              )}
            </div>
            <div className={cn('space-y-2')}>
              <Label
                htmlFor="classNum"
                className={cn('text-muted-foreground font-mono text-xs uppercase tracking-widest')}
              >
                반
              </Label>
              {isInactive ? (
                <div
                  className={cn(
                    'border-foreground/30 bg-muted h-10 w-full cursor-not-allowed rounded-none border',
                  )}
                />
              ) : (
                <>
                  <Controller
                    control={control}
                    name="classNum"
                    render={({ field }) => (
                      <Select
                        value={field.value ? String(field.value) : undefined}
                        onValueChange={(val) => field.onChange(Number(val))}
                      >
                        <SelectTrigger className={cn('border-foreground rounded-none')}>
                          <SelectValue placeholder="반 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1반</SelectItem>
                          <SelectItem value="2">2반</SelectItem>
                          <SelectItem value="3">3반</SelectItem>
                          <SelectItem value="4">4반</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FormErrorMessage error={errors.classNum} />
                </>
              )}
            </div>
            <div className={cn('space-y-2')}>
              <Label
                htmlFor="number"
                className={cn('text-muted-foreground font-mono text-xs uppercase tracking-widest')}
              >
                번호
              </Label>
              {isInactive ? (
                <div
                  className={cn(
                    'border-foreground/30 bg-muted h-10 w-full cursor-not-allowed rounded-none border',
                  )}
                />
              ) : (
                <>
                  <Input
                    id="number"
                    type="number"
                    placeholder="번호 입력"
                    className={cn('border-foreground rounded-none font-mono')}
                    {...register('number', { valueAsNumber: true })}
                  />
                  <FormErrorMessage error={errors.number} />
                </>
              )}
            </div>
            <div className={cn('space-y-2')}>
              <Label
                htmlFor="role"
                className={cn('text-muted-foreground font-mono text-xs uppercase tracking-widest')}
              >
                구분
              </Label>
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className={cn('border-foreground rounded-none')}>
                      <SelectValue placeholder="구분 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GENERAL_STUDENT">일반학생</SelectItem>
                      <SelectItem value="STUDENT_COUNCIL">학생회</SelectItem>
                      <SelectItem value="DORMITORY_MANAGER">기자위</SelectItem>
                      <SelectItem value="GRADUATE">졸업생</SelectItem>
                      <SelectItem value="WITHDRAWN">자퇴생</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <FormErrorMessage error={errors.role} />
            </div>
            <div className={cn('space-y-2')}>
              <Label
                htmlFor="dormitoryRoomNumber"
                className={cn('text-muted-foreground font-mono text-xs uppercase tracking-widest')}
              >
                기숙사 호실
              </Label>
              {isInactive ? (
                <div
                  className={cn(
                    'border-foreground/30 bg-muted h-10 w-full cursor-not-allowed rounded-none border',
                  )}
                />
              ) : (
                <>
                  <Input
                    id="dormitoryRoomNumber"
                    type="number"
                    placeholder="호실 입력"
                    className={cn('border-foreground rounded-none font-mono')}
                    {...register('dormitoryRoomNumber', { valueAsNumber: true })}
                  />
                  <FormErrorMessage error={errors.dormitoryRoomNumber} />
                </>
              )}
            </div>
            <div className={cn('space-y-2')}>
              <Label
                htmlFor="majorClubId"
                className={cn('text-muted-foreground font-mono text-xs uppercase tracking-widest')}
              >
                전공 동아리
              </Label>
              {isInactive ? (
                <div
                  className={cn(
                    'border-foreground/30 bg-muted h-10 w-full cursor-not-allowed rounded-none border',
                  )}
                />
              ) : (
                <>
                  <Controller
                    control={control}
                    name="majorClubId"
                    render={({ field }) => (
                      <Select
                        value={
                          field.value === null && mode === 'edit'
                            ? 'none'
                            : field.value
                              ? String(field.value)
                              : undefined
                        }
                        onValueChange={(val) => field.onChange(val === 'none' ? null : Number(val))}
                      >
                        <SelectTrigger className={cn('border-foreground w-full')}>
                          <SelectValue placeholder="전공 동아리 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none" className={cn('text-gray-500')}>
                            선택 안 함
                          </SelectItem>
                          {clubs?.clubs
                            .filter((club) => club.type === 'MAJOR_CLUB')
                            .map((club) => (
                              <SelectItem key={club.id} value={String(club.id)}>
                                {club.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FormErrorMessage error={errors.majorClubId} />
                </>
              )}
            </div>
            <div className={cn('space-y-2')}>
              <Label
                htmlFor="autonomousClubId"
                className={cn('text-muted-foreground font-mono text-xs uppercase tracking-widest')}
              >
                자율 동아리
              </Label>
              {isInactive ? (
                <div
                  className={cn(
                    'border-foreground/30 bg-muted h-10 w-full cursor-not-allowed rounded-none border',
                  )}
                />
              ) : (
                <>
                  <Controller
                    control={control}
                    name="autonomousClubId"
                    render={({ field }) => (
                      <Select
                        value={
                          field.value === null && mode === 'edit'
                            ? 'none'
                            : field.value
                              ? String(field.value)
                              : undefined
                        }
                        onValueChange={(val) => field.onChange(val === 'none' ? null : Number(val))}
                      >
                        <SelectTrigger className={cn('border-foreground w-full')}>
                          <SelectValue placeholder="자율 동아리 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none" className={cn('text-gray-500')}>
                            선택 안 함
                          </SelectItem>
                          {clubs?.clubs
                            .filter((club) => club.type === 'AUTONOMOUS_CLUB')
                            .map((club) => (
                              <SelectItem key={club.id} value={String(club.id)}>
                                {club.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FormErrorMessage error={errors.autonomousClubId} />
                </>
              )}
            </div>
            <div className={cn('col-span-2 space-y-2')}>
              <Label
                className={cn('text-muted-foreground font-mono text-xs uppercase tracking-widest')}
              >
                전공
              </Label>
              {isInactive ? (
                <div
                  className={cn(
                    'border-foreground/30 bg-muted h-10 w-full cursor-not-allowed rounded-none border',
                  )}
                />
              ) : (
                <>
                  <Controller
                    control={control}
                    name="specialty"
                    render={({ field }) =>
                      isCustomSpecialty ? (
                        <div className={cn('flex gap-2')}>
                          <Input
                            placeholder="전공 직접 입력"
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value || null)}
                            className={cn('border-foreground flex-1 rounded-none font-mono')}
                            autoFocus
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setIsCustomSpecialty(false);
                              field.onChange(null);
                            }}
                          >
                            <X className={cn('h-4 w-4')} />
                          </Button>
                        </div>
                      ) : (
                        <Select
                          value={field.value ?? 'none'}
                          onValueChange={(val) => {
                            if (val === 'custom') {
                              setIsCustomSpecialty(true);
                              field.onChange('');
                            } else if (val === 'none') {
                              field.onChange(null);
                            } else {
                              field.onChange(val);
                            }
                          }}
                        >
                          <SelectTrigger className={cn('border-foreground rounded-none')}>
                            <SelectValue placeholder="전공 선택" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              value="none"
                              className={cn('text-muted-foreground font-mono')}
                            >
                              선택 안 함
                            </SelectItem>
                            {SPECIALTY_OPTIONS.map((opt) => (
                              <SelectItem key={opt} value={opt} className={cn('font-mono')}>
                                {opt}
                              </SelectItem>
                            ))}
                            <SelectItem value="custom" className={cn('font-mono')}>
                              직접 입력...
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )
                    }
                  />
                  <FormErrorMessage error={errors.specialty} />
                </>
              )}
            </div>
            <div className={cn('col-span-2 space-y-2')}>
              <Label
                className={cn('text-muted-foreground font-mono text-xs uppercase tracking-widest')}
              >
                GitHub ID
              </Label>
              {isInactive ? (
                <div
                  className={cn(
                    'border-foreground/30 bg-muted h-10 w-full cursor-not-allowed rounded-none border',
                  )}
                />
              ) : (
                <>
                  <Input
                    placeholder="GitHub 아이디 입력"
                    className={cn('border-foreground rounded-none font-mono')}
                    {...register('githubId', { setValueAs: (v) => (v === '' ? null : v) })}
                  />
                  <FormErrorMessage error={errors.githubId} />
                </>
              )}
            </div>
          </div>
          <div className={cn('flex justify-end')}>
            <Button
              type="submit"
              disabled={isPending}
              variant={isInactive ? 'destructive' : 'default'}
            >
              {isPending ? loadingText : submitText}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StudentFormDialog;
