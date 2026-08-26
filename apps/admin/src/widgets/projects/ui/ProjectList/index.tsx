import { Project, ProjectStatus } from '@repo/shared/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  buttonVariants,
} from '@repo/shared/ui';
import { cn } from '@repo/shared/utils';

interface ProjectListProps {
  projects: Project[];
  isLoading?: boolean;
  onEdit?: (project: Project) => void;
  onDelete?: (projectId: number) => void;
}

const HEAD_ROW_STYLE =
  '[&>th]:px-5 [&>th]:py-1.5 [&>th]:font-sans [&>th]:text-[13px] [&>th]:font-normal [&>th]:normal-case [&>th]:tracking-normal';

const BODY_ROW_STYLE =
  'border-foreground [&>td]:px-5 [&>td]:py-3.5 [&>td]:font-mono [&>td]:text-xs [&>td]:text-muted-foreground';

const STATUS_BADGE: Record<ProjectStatus, { label: string; badgeStyle: string; dotStyle: string }> =
  {
    ACTIVE: {
      label: '운영 중',
      badgeStyle: 'border-[#5ab982] text-[#5ab982]',
      dotStyle: 'bg-[#5ab982]',
    },
    ENDED: {
      label: '운영 종료',
      badgeStyle: 'border-muted-foreground/50 text-muted-foreground',
      dotStyle: 'border-muted-foreground/50 border',
    },
  };

const ProjectList = ({ projects, isLoading, onEdit, onDelete }: ProjectListProps) => {
  if (!isLoading && !projects.length) {
    return (
      <p className={cn('text-muted-foreground py-12 text-center font-mono text-xs')}>
        프로젝트 데이터가 없습니다.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className={cn(HEAD_ROW_STYLE)}>
          <TableHead className={cn('w-[160px]')}>이름</TableHead>
          <TableHead className={cn('w-[140px]')}>상태</TableHead>
          <TableHead className={cn('w-[80px]')}>시작 연도</TableHead>
          <TableHead className={cn('w-[80px]')}>종료 연도</TableHead>
          <TableHead className={cn('w-[420px]')}>설명</TableHead>
          <TableHead>동아리</TableHead>
          <TableHead className={cn('w-[160px]')}>
            <span className={cn('sr-only')}>작업</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading
          ? Array.from({ length: 10 }).map((_, index) => (
              <TableRow key={index} className={cn(BODY_ROW_STYLE)}>
                <TableCell>
                  <Skeleton className={cn('h-4 w-32')} />
                </TableCell>
                <TableCell>
                  <Skeleton className={cn('h-6 w-20')} />
                </TableCell>
                <TableCell>
                  <Skeleton className={cn('h-4 w-10')} />
                </TableCell>
                <TableCell>
                  <Skeleton className={cn('h-4 w-10')} />
                </TableCell>
                <TableCell>
                  <Skeleton className={cn('h-4 w-64')} />
                </TableCell>
                <TableCell>
                  <Skeleton className={cn('h-4 w-24')} />
                </TableCell>
                <TableCell>
                  <Skeleton className={cn('h-6 w-28')} />
                </TableCell>
              </TableRow>
            ))
          : projects.map((project) => {
              const status = STATUS_BADGE[project.status];

              return (
                <TableRow key={project.id} className={cn(BODY_ROW_STYLE)}>
                  <TableCell>{project.name}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        'inline-flex h-6 items-center gap-1.5 border px-2 font-sans text-xs font-medium',
                        status.badgeStyle,
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn('size-2.5 shrink-0 rounded-full', status.dotStyle)}
                      />
                      {status.label}
                    </span>
                  </TableCell>
                  <TableCell>{project.startYear}</TableCell>
                  <TableCell>{project.endYear ?? '-'}</TableCell>
                  <TableCell className={cn('max-w-[420px] truncate')}>
                    {project.description}
                  </TableCell>
                  <TableCell>{project.club?.name || '무소속'}</TableCell>
                  <TableCell>
                    <div className={cn('flex items-center justify-end gap-2')}>
                      <Button
                        type="button"
                        variant="pixel"
                        className={cn('h-6 border px-2')}
                        onClick={() => onEdit?.(project)}
                      >
                        Edit
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            type="button"
                            variant="pixel-destructive"
                            className={cn('h-6 border px-2')}
                          >
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className={cn('gap-0 p-0 sm:max-w-[656px]')}>
                          <div
                            className={cn(
                              'bg-foreground text-background flex items-center justify-between px-4 py-3',
                            )}
                          >
                            <span className={cn('font-pixel text-[9px] leading-none')}>Alert</span>
                            <AlertDialogCancel
                              className={cn(
                                buttonVariants({ variant: 'pixel-primary' }),
                                'text-background h-6 border-0 px-2',
                              )}
                            >
                              X<span className={cn('sr-only')}>닫기</span>
                            </AlertDialogCancel>
                          </div>

                          <div className={cn('flex flex-col gap-1 px-5 pt-5')}>
                            <AlertDialogTitle
                              className={cn('text-foreground text-xl font-semibold leading-[1.45]')}
                            >
                              정말 &ldquo;{project.name}&rdquo;프로젝트를 삭제할까요?
                            </AlertDialogTitle>
                            <AlertDialogDescription
                              className={cn('text-destructive text-[13px] leading-[1.6]')}
                            >
                              &gt; 중요: 이 작업은 되돌릴 수 없습니다!
                            </AlertDialogDescription>
                          </div>

                          <div className={cn('flex items-center gap-2.5 p-5')}>
                            <AlertDialogCancel
                              className={cn(
                                buttonVariants({ variant: 'pixel' }),
                                'h-9 flex-1 px-3',
                              )}
                            >
                              취소
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDelete?.(project.id)}
                              className={cn(
                                buttonVariants({ variant: 'pixel-destructive' }),
                                'h-9 flex-1 px-3',
                              )}
                            >
                              확인
                            </AlertDialogAction>
                          </div>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
      </TableBody>
    </Table>
  );
};

export default ProjectList;
