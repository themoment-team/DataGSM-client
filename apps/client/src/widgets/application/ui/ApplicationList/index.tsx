'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  PixelIconButton,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/shared/ui';
import { cn } from '@repo/shared/utils';
import { useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Application } from '@/entities/application';
import { useDeleteApplication } from '@/widgets/application';

interface ApplicationListProps {
  applications?: Application[];
  isLoading?: boolean;
  onEdit: (application: Application) => void;
  myId?: number;
}

interface ApplicationListItemProps {
  application: Application;
  onEdit: (application: Application) => void;
  onDelete: (id: string) => void;
  isOwner: boolean;
  showActions: boolean;
}

const ApplicationListItem = ({
  application,
  onEdit,
  onDelete,
  isOwner,
  showActions,
}: ApplicationListItemProps) => {
  return (
    <TableRow>
      <TableCell className={cn('font-medium')}>{application.applicationName}</TableCell>
      <TableCell className={cn('font-mono text-xs break-all')} title={application.id}>
        {application.id}
      </TableCell>
      <TableCell>
        <div className={cn('flex flex-wrap gap-1')}>
          {application.applicationScopes.map((scope, index) => (
            <div
              key={index}
              className={cn(
                'bg-foreground text-background group relative cursor-help px-1.5 py-0.5 font-mono text-xs uppercase',
              )}
              title={scope.applicationScope}
            >
              {scope.applicationScope}
            </div>
          ))}
        </div>
      </TableCell>
      {showActions && (
        <TableCell>
          {isOwner && (
            <div className={cn('flex items-center gap-1')}>
              <PixelIconButton onClick={() => onEdit(application)}>
                <Pencil className={cn('h-3.5 w-3.5')} />
              </PixelIconButton>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <PixelIconButton variant="destructive">
                    <Trash2 className={cn('h-3.5 w-3.5')} />
                  </PixelIconButton>
                </AlertDialogTrigger>
                <AlertDialogContent className={cn('border-foreground pixel-shadow border-2')}>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-pixel text-[12px] leading-[1.8]">
                      애플리케이션 삭제
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      정말로 &apos;{application.applicationName}&apos; 애플리케이션을
                      삭제하시겠습니까?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(application.id)}
                      className={cn('bg-destructive hover:bg-destructive/90 text-white')}
                    >
                      삭제
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </TableCell>
      )}
    </TableRow>
  );
};

const ApplicationList = ({ applications, isLoading, onEdit, myId }: ApplicationListProps) => {
  const queryClient = useQueryClient();
  const { mutate: deleteApplication } = useDeleteApplication({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['applications', 'list'],
      });
      toast.success('애플리케이션이 삭제되었습니다.');
    },
    onError: () => {
      toast.error('애플리케이션 삭제에 실패했습니다.');
    },
  });

  const handleDelete = (id: string) => {
    deleteApplication(id);
  };

  const showActions = Boolean(applications?.some((app) => app.accountId === myId));
  const columnCount = showActions ? 4 : 3;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>애플리케이션 이름</TableHead>
          <TableHead>애플리케이션 ID</TableHead>
          <TableHead>권한 범위 (Scopes)</TableHead>
          {showActions && <TableHead className={cn('w-24')}>작업</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <Skeleton className={cn('h-4 w-48')} />
              </TableCell>
              <TableCell>
                <Skeleton className={cn('h-4 w-56')} />
              </TableCell>
              <TableCell>
                <Skeleton className={cn('h-4 w-64')} />
              </TableCell>
              {showActions && (
                <TableCell>
                  <Skeleton className={cn('h-7 w-16')} />
                </TableCell>
              )}
            </TableRow>
          ))
        ) : applications && applications.length > 0 ? (
          applications.map((app) => (
            <ApplicationListItem
              key={app.id}
              application={app}
              onEdit={onEdit}
              onDelete={handleDelete}
              isOwner={app.accountId === myId}
              showActions={showActions}
            />
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={columnCount}
              className={cn('text-muted-foreground h-24 text-center font-mono')}
            >
              {'>'} 등록된 애플리케이션이 없습니다.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default ApplicationList;
