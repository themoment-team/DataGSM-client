import { Club, ClubStatus } from '@repo/shared/types';
import {
  Button,
  ConfirmDialog,
  Skeleton,
  TABLE_BODY_ROW_STYLE,
  TABLE_HEAD_ROW_STYLE,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/shared/ui';
import { cn } from '@repo/shared/utils';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { getStatusLabel, getTypeLabel } from '@/entities/club';
import { useDeleteClub } from '@/widgets/clubs';

interface ClubListProps {
  clubs: Club[];
  isLoading?: boolean;
  onEdit?: (club: Club) => void;
}

const getStatusBadgeStyle = (status: ClubStatus) =>
  status === 'ACTIVE' ? 'border-success text-success' : 'border-foreground/25';

const getStatusDotStyle = (status: ClubStatus) =>
  status === 'ACTIVE' ? 'bg-success' : 'border-muted-foreground border';

const ClubList = ({ clubs, isLoading, onEdit }: ClubListProps) => {
  const queryClient = useQueryClient();

  const { mutate: deleteClub } = useDeleteClub({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
      toast.success('동아리가 삭제되었습니다.');
    },
    onError: (error) => {
      console.error('동아리 삭제 실패:', error);
      toast.error('동아리 삭제에 실패했습니다.');
    },
  });

  if (!isLoading && !clubs.length) {
    return (
      <p className={cn('text-muted-foreground py-12 text-center font-mono text-xs')}>
        등록된 동아리가 없습니다.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className={cn(TABLE_HEAD_ROW_STYLE)}>
          <TableHead className={cn('w-[320px]')}>동아리명</TableHead>
          <TableHead className={cn('w-[140px]')}>종류</TableHead>
          <TableHead className={cn('w-[140px]')}>상태</TableHead>
          <TableHead className={cn('w-[240px]')}>설립연도</TableHead>
          <TableHead>부장</TableHead>
          <TableHead className={cn('w-[140px]')}>
            <span className={cn('sr-only')}>작업</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading
          ? Array.from({ length: 10 }).map((_, index) => (
              <TableRow key={index} className={cn(TABLE_BODY_ROW_STYLE)}>
                <TableCell>
                  <Skeleton className={cn('h-4 w-32')} />
                </TableCell>
                <TableCell>
                  <Skeleton className={cn('h-6 w-10')} />
                </TableCell>
                <TableCell>
                  <Skeleton className={cn('h-6 w-14')} />
                </TableCell>
                <TableCell>
                  <Skeleton className={cn('h-4 w-12')} />
                </TableCell>
                <TableCell>
                  <Skeleton className={cn('h-4 w-24')} />
                </TableCell>
                <TableCell>
                  <Skeleton className={cn('h-6 w-28')} />
                </TableCell>
              </TableRow>
            ))
          : clubs.map((club) => (
              <TableRow key={club.id} className={cn(TABLE_BODY_ROW_STYLE)}>
                <TableCell>{club.name}</TableCell>
                <TableCell>
                  <span
                    className={cn(
                      'inline-flex h-6 items-center border px-2 font-mono text-[11px] font-medium tracking-[0.1em]',
                      club.type === 'MAJOR_CLUB'
                        ? 'bg-foreground text-background border-foreground'
                        : 'border-foreground text-foreground',
                    )}
                  >
                    {getTypeLabel(club.type)}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      'inline-flex h-6 items-center gap-1.5 border px-2 font-sans text-xs',
                      getStatusBadgeStyle(club.status),
                    )}
                  >
                    <span
                      className={cn(
                        'inline-block size-[6px] rounded-full',
                        getStatusDotStyle(club.status),
                      )}
                    />
                    {getStatusLabel(club.status)}
                  </span>
                </TableCell>
                <TableCell>{club.foundedYear}</TableCell>
                <TableCell>
                  {club.leader
                    ? [club.leader.studentNumber, club.leader.name].filter(Boolean).join(' ')
                    : '-'}
                </TableCell>
                <TableCell>
                  <div className={cn('flex items-center gap-2')}>
                    <Button
                      type="button"
                      variant="pixel"
                      className={cn('h-6 border px-2')}
                      onClick={() => onEdit?.(club)}
                    >
                      Edit
                    </Button>
                    <ConfirmDialog
                      trigger={
                        <Button
                          type="button"
                          variant="pixel-destructive"
                          className={cn('h-6 border px-2')}
                        >
                          Delete
                        </Button>
                      }
                      title={`정말 “${club.name}”동아리를 삭제할까요?`}
                      warning="> 중요: 이 작업은 되돌릴 수 없습니다!"
                      onConfirm={() => deleteClub(club.id)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
      </TableBody>
    </Table>
  );
};

export default ClubList;
