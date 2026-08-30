'use client';

import { useEffect, useMemo, useState } from 'react';

import { useSearchParams } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { useDebounce, useURLFilters } from '@repo/shared/hooks';
import { Student, StudentRole, StudentSex } from '@repo/shared/types';
import { Button, CommonPagination, PageTitleBar, PageWindow } from '@repo/shared/ui';
import { cn } from '@repo/shared/utils';
import { useForm, useWatch } from 'react-hook-form';

import { StudentFilterSchema, StudentFilterType } from '@/entities/student';
import { useGetClubs } from '@/views/clubs';
import { useGetStudents } from '@/views/students';
import {
  GraduateThirdGradeButton,
  StudentExcelActions,
  StudentFilter,
  StudentFormDialog,
  StudentList,
} from '@/widgets/students';

const PAGE_SIZE = 10;

const StudentsPage = () => {
  const searchParams = useSearchParams();
  const { updateURL } = useURLFilters<StudentFilterType>();

  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  /** 컬럼 초기화 모드에서는 목록이 학생 선택용으로 바뀐다. */
  const [isColumnRefreshMode, setIsColumnRefreshMode] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setIsEditDialogOpen(true);
  };

  const startColumnRefresh = () => {
    setSelectedStudentIds([]);
    setIsColumnRefreshMode(true);
  };

  const cancelColumnRefresh = () => {
    setSelectedStudentIds([]);
    setIsColumnRefreshMode(false);
  };

  const toggleStudentSelection = (studentId: number) => {
    setSelectedStudentIds((previous) =>
      previous.includes(studentId)
        ? previous.filter((id) => id !== studentId)
        : [...previous, studentId],
    );
  };

  const initialValues = useMemo(
    (): StudentFilterType & { page: number } => ({
      name: searchParams.get('name') || 'all',
      grade: searchParams.get('grade') || 'all',
      classNum: searchParams.get('classNum') || 'all',
      sex: searchParams.get('sex') || 'all',
      role: searchParams.get('role') || 'all',
      status: searchParams.get('status') || 'ENROLLED',
      includeGraduates: searchParams.get('includeGraduates') === 'true',
      includeWithdrawn: searchParams.get('includeWithdrawn') === 'true',
      onlyEnrolled: searchParams.get('onlyEnrolled') === 'true' || !searchParams.has('status'),
      sortBy: searchParams.get('sortBy') || 'all',
      page: Number(searchParams.get('page')) || 0,
    }),
    [searchParams],
  );

  const form = useForm<StudentFilterType>({
    resolver: zodResolver(StudentFilterSchema),
    defaultValues: {
      name: initialValues.name,
      grade: initialValues.grade,
      classNum: initialValues.classNum,
      sex: initialValues.sex,
      role: initialValues.role,
      status: initialValues.status,
      includeGraduates: initialValues.includeGraduates,
      includeWithdrawn: initialValues.includeWithdrawn,
      onlyEnrolled: initialValues.onlyEnrolled,
      sortBy: initialValues.sortBy,
    },
  });

  const {
    control,
    reset,
    formState: { isDirty },
  } = form;

  const filters = useWatch({
    control,
  });

  const debouncedName = useDebounce(filters.name);

  const currentPage = initialValues.page;

  useEffect(() => {
    reset({
      name: initialValues.name,
      grade: initialValues.grade,
      classNum: initialValues.classNum,
      sex: initialValues.sex,
      role: initialValues.role,
      status: initialValues.status,
      includeGraduates: initialValues.includeGraduates,
      includeWithdrawn: initialValues.includeWithdrawn,
      onlyEnrolled: initialValues.onlyEnrolled,
      sortBy: initialValues.sortBy,
    });
  }, [initialValues, reset]);

  useEffect(() => {
    if (!isDirty) return;

    const hasChanged =
      debouncedName !== initialValues.name ||
      filters.grade !== initialValues.grade ||
      filters.classNum !== initialValues.classNum ||
      filters.sex !== initialValues.sex ||
      filters.role !== initialValues.role ||
      filters.status !== initialValues.status ||
      filters.includeGraduates !== initialValues.includeGraduates ||
      filters.includeWithdrawn !== initialValues.includeWithdrawn ||
      filters.onlyEnrolled !== initialValues.onlyEnrolled ||
      filters.sortBy !== initialValues.sortBy;

    if (hasChanged) {
      updateURL(
        {
          ...filters,
          name: debouncedName,
        },
        0,
      );
    }
  }, [
    debouncedName,
    filters.grade,
    filters.classNum,
    filters.sex,
    filters.role,
    filters.status,
    filters.includeGraduates,
    filters.includeWithdrawn,
    filters.onlyEnrolled,
    filters.sortBy,
    initialValues.name,
    initialValues.grade,
    initialValues.classNum,
    initialValues.sex,
    initialValues.role,
    initialValues.status,
    initialValues.includeGraduates,
    initialValues.includeWithdrawn,
    initialValues.onlyEnrolled,
    initialValues.sortBy,
    updateURL,
    filters,
    isDirty,
  ]);

  const handlePageChange = (page: number) => {
    updateURL(
      {
        ...filters,
        name: debouncedName,
      },
      page,
    );
  };

  const queryParams = {
    page: currentPage,
    size: PAGE_SIZE,
    name: debouncedName !== 'all' ? debouncedName : undefined,
    grade: filters.grade !== 'all' ? Number(filters.grade) : undefined,
    classNum: filters.classNum !== 'all' ? Number(filters.classNum) : undefined,
    sex: filters.sex !== 'all' ? (filters.sex as StudentSex) : undefined,
    role:
      filters.status === 'WITHDRAWN'
        ? ('WITHDRAWN' as StudentRole)
        : filters.status === 'GRADUATE'
          ? ('GRADUATE' as StudentRole)
          : filters.role !== 'all'
            ? (filters.role as StudentRole)
            : undefined,
    includeGraduates: filters.status === 'GRADUATE',
    includeWithdrawn: filters.status === 'WITHDRAWN',
    onlyEnrolled: filters.status === 'ENROLLED',
    sortBy: filters.sortBy !== 'all' ? filters.sortBy : undefined,
  };

  const { data: studentsData, isLoading: isLoadingStudents } = useGetStudents(queryParams);

  const { data: clubsData, isLoading: isLoadingClubs } = useGetClubs({});

  const students = studentsData?.data.students;

  const totalPages = studentsData?.data.totalPages ?? 0;

  const isEmpty = !isLoadingStudents && !students?.length;

  return (
    <div className={cn('bg-background min-h-[calc(100vh-3.5rem)]')}>
      <main className={cn('container mx-auto px-4 py-8')}>
        <PageTitleBar
          title="STUDENT MANAGEMENT"
          description="DataGSM에 등록된 학생 정보를 관리합니다."
        />

        <PageWindow
          windowTitle={isColumnRefreshMode ? 'Column Refresh' : 'Student Management'}
          title={isColumnRefreshMode ? '컬럼 초기화' : '학생 관리'}
          description={
            isColumnRefreshMode
              ? '선택한 학생들의 컬럼을 초기화하고 로그인 과정 때 정보를 받도록 설정합니다.'
              : '학생들의 정보를 확인하거나 수정하세요.'
          }
          action={
            isColumnRefreshMode ? (
              <>
                <Button
                  type="button"
                  variant="pixel-destructive"
                  className={cn('px-3')}
                  onClick={cancelColumnRefresh}
                >
                  컬럼 초기화 취소
                </Button>
                {/* TODO: POST /v1/students/data-edit-requests 연동. 초기화할 컬럼 선택 방식 확정 후 작업 */}
                <Button
                  type="button"
                  variant="pixel-primary"
                  className={cn('px-3')}
                  disabled={!selectedStudentIds.length}
                >
                  컬럼 초기화 진행
                </Button>
              </>
            ) : (
              <>
                <GraduateThirdGradeButton />
                <Button
                  type="button"
                  variant="pixel-destructive"
                  className={cn('px-3')}
                  onClick={startColumnRefresh}
                >
                  컬럼 초기화
                </Button>
                {/* TODO: 공지사항 전송 API 연동 (현재는 시안 반영용 UI) */}
                <Button type="button" variant="pixel" className={cn('px-3')}>
                  공지사항 전송
                </Button>
                <StudentExcelActions />
                <StudentFormDialog
                  mode="create"
                  clubs={clubsData?.data}
                  isLoadingClubs={isLoadingClubs}
                />
              </>
            )
          }
        >
          {/* Filters */}
          <div className={cn('mb-2')}>
            <StudentFilter control={control} />
          </div>

          {/* Table */}
          <div className={cn(!isEmpty && 'border-foreground border')}>
            <StudentList
              students={students}
              isLoading={isLoadingStudents}
              onEdit={handleEditStudent}
              selectable={isColumnRefreshMode}
              selectedIds={selectedStudentIds}
              onToggleSelect={toggleStudentSelection}
            />
          </div>

          <div className={cn('mt-5')}>
            <CommonPagination
              isLoading={isLoadingStudents}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </PageWindow>

        {editingStudent && (
          <StudentFormDialog
            mode="edit"
            student={editingStudent}
            clubs={clubsData?.data}
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            isLoadingClubs={isLoadingClubs}
          />
        )}
      </main>
    </div>
  );
};

export default StudentsPage;
