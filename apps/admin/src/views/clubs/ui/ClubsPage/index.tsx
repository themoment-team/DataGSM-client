'use client';

import { useEffect, useMemo, useState } from 'react';

import { useSearchParams } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { useDebounce, useURLFilters } from '@repo/shared/hooks';
import { Club, ClubType } from '@repo/shared/types';
import { CommonPagination, PageHeader } from '@repo/shared/ui';
import { cn } from '@repo/shared/utils';
import { useForm, useWatch } from 'react-hook-form';

import { AddClubSchema, AddClubType, ClubFilterSchema, ClubFilterType } from '@/entities/club';
import { useGetClubs } from '@/views/clubs';
import { useGetStudents } from '@/views/students';
import { ClubExcelActions, ClubFilter, ClubFormDialog, ClubList } from '@/widgets/clubs';

const PAGE_SIZE = 10;

const ClubsPage = () => {
  const searchParams = useSearchParams();
  const { updateURL } = useURLFilters<ClubFilterType>();

  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // 동아리 추가/수정을 위한 폼 선언 (participants 명칭 사용)
  const clubForm = useForm<AddClubType>({
    resolver: zodResolver(AddClubSchema),
    defaultValues: {
      name: '',
      type: undefined,
      status: 'ACTIVE',
      foundedYear: undefined,
      abolishedYear: undefined,
      leaderId: undefined,
      participantIds: [],
    },
  });

  const handleEditClub = (club: Club) => {
    setEditingClub(club);
    setIsEditDialogOpen(true);
    clubForm.reset({
      name: club.name,
      type: club.type,
      status: club.status,
      foundedYear: club.foundedYear,
      abolishedYear: club.abolishedYear ?? undefined,
      leaderId: club.leader?.id,
      participantIds: club.participants?.map((p) => p.id) ?? [],
    });
  };

  const initialValues = useMemo(
    (): ClubFilterType & { page: number } => ({
      clubName: searchParams.get('clubName') || 'all',
      clubType: searchParams.get('clubType') || 'all',
      status: (searchParams.get('status') as ClubFilterType['status']) || undefined,
      page: Number(searchParams.get('page')) || 0,
    }),
    [searchParams],
  );

  const filterForm = useForm<ClubFilterType>({
    resolver: zodResolver(ClubFilterSchema),
    defaultValues: {
      clubName: initialValues.clubName,
      clubType: initialValues.clubType,
      status: initialValues.status,
    },
  });

  const { control } = filterForm;

  const filters = useWatch({
    control,
  });

  const debouncedClubName = useDebounce(filters.clubName);

  const currentPage = initialValues.page;

  useEffect(() => {
    const hasChanged =
      debouncedClubName !== initialValues.clubName ||
      filters.clubType !== initialValues.clubType ||
      filters.status !== initialValues.status;

    if (hasChanged) {
      updateURL(
        {
          ...filters,
          clubName: debouncedClubName,
        },
        0,
      );
    }
  }, [
    debouncedClubName,
    filters.clubType,
    filters.status,
    initialValues.clubName,
    initialValues.clubType,
    initialValues.status,
    updateURL,
    filters,
  ]);

  const handlePageChange = (page: number) => {
    updateURL(
      {
        ...filters,
        clubName: debouncedClubName,
      },
      page,
    );
  };

  const queryParams = {
    page: currentPage,
    size: PAGE_SIZE,
    clubName: debouncedClubName !== 'all' ? debouncedClubName : undefined,
    clubType: filters.clubType !== 'all' ? (filters.clubType as ClubType) : undefined,
    status: filters.status,
  };

  const { data: clubsData, isLoading: isLoadingClubs } = useGetClubs(queryParams);

  const { data: studentsData, isLoading: isLoadingStudents } = useGetStudents(
    {},
    {
      staleTime: Infinity,
      gcTime: 1000 * 60 * 30,
    },
  );

  const clubs = clubsData?.data.clubs || [];

  const totalPages = clubsData?.data.totalPages ?? 0;

  return (
    <div className={cn('bg-background min-h-[calc(100vh-3.5rem)]')}>
      <main className={cn('container mx-auto px-4 py-8')}>
        {/* Page header */}
        <PageHeader
          breadcrumb="DATAGSM / Admin"
          title="동아리 관리"
          action={
            <div className={cn('flex items-center gap-2')}>
              <ClubExcelActions />
              <ClubFormDialog
                mode="create"
                students={studentsData?.data.students}
                isLoadingStudents={isLoadingStudents}
                form={clubForm}
              />
            </div>
          }
        />

        {/* Filters */}
        <div className={cn('mb-4')}>
          <ClubFilter control={control} />
        </div>

        {/* Table */}
        <div className={cn('border-foreground pixel-shadow border-2')}>
          <ClubList clubs={clubs} isLoading={isLoadingClubs} onEdit={handleEditClub} />
        </div>

        <div className={cn('mt-5')}>
          <CommonPagination
            isLoading={isLoadingClubs}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>

        {editingClub && (
          <ClubFormDialog
            mode="edit"
            club={editingClub}
            students={studentsData?.data.students}
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            isLoadingStudents={isLoadingStudents}
            form={clubForm}
          />
        )}
      </main>
    </div>
  );
};

export default ClubsPage;
