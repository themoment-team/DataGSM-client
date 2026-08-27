import { Student } from '@repo/shared/types';
import {
  Button,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/shared/ui';
import { cn } from '@repo/shared/utils';

import { getMajorLabel, getRoleBadgeStyle, getRoleLabel, getSexLabel } from '@/entities/student';

interface StudentListProps {
  students?: Student[];
  isLoading?: boolean;
  onEdit?: (student: Student) => void;
}

const HEAD_ROW_STYLE =
  '[&>th]:px-5 [&>th]:py-1.5 [&>th]:font-sans [&>th]:text-[13px] [&>th]:font-normal [&>th]:normal-case [&>th]:tracking-normal';

const BODY_ROW_STYLE =
  'border-foreground [&>td]:px-5 [&>td]:py-3.5 [&>td]:font-mono [&>td]:text-xs [&>td]:text-muted-foreground';

const StudentList = ({ students, isLoading, onEdit }: StudentListProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow className={cn(HEAD_ROW_STYLE)}>
          <TableHead className={cn('w-[100px]')}>이름</TableHead>
          <TableHead className={cn('w-[100px]')}>성별</TableHead>
          <TableHead className={cn('w-[100px]')}>학번</TableHead>
          <TableHead className={cn('w-[180px]')}>이메일</TableHead>
          <TableHead className={cn('w-[140px]')}>학과</TableHead>
          <TableHead className={cn('w-[140px]')}>구분</TableHead>
          <TableHead className={cn('w-[140px]')}>기숙사 호실</TableHead>
          <TableHead>전공동아리</TableHead>
          <TableHead>자율동아리</TableHead>
          <TableHead className={cn('w-[70px]')}>
            <span className={cn('sr-only')}>작업</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading
          ? Array.from({ length: 10 }).map((_, index) => (
              <TableRow key={index} className={cn(BODY_ROW_STYLE)}>
                <TableCell>
                  <Skeleton className={cn('h-4 w-16')} />
                </TableCell>
                <TableCell>
                  <Skeleton className={cn('h-4 w-8')} />
                </TableCell>
                <TableCell>
                  <Skeleton className={cn('h-4 w-16')} />
                </TableCell>
                <TableCell>
                  <Skeleton className={cn('h-4 w-32')} />
                </TableCell>
                <TableCell>
                  <Skeleton className={cn('h-4 w-24')} />
                </TableCell>
                <TableCell>
                  <Skeleton className={cn('h-6 w-16')} />
                </TableCell>
                <TableCell>
                  <Skeleton className={cn('h-4 w-12')} />
                </TableCell>
                <TableCell>
                  <Skeleton className={cn('h-4 w-20')} />
                </TableCell>
                <TableCell>
                  <Skeleton className={cn('h-4 w-20')} />
                </TableCell>
                <TableCell>
                  <Skeleton className={cn('h-6 w-12')} />
                </TableCell>
              </TableRow>
            ))
          : students?.map((student) => (
              <TableRow key={student.id} className={cn(BODY_ROW_STYLE)}>
                <TableCell>{student.name}</TableCell>
                <TableCell>{getSexLabel(student.sex)}</TableCell>
                <TableCell>{student.studentNumber}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>{getMajorLabel(student.major)}</TableCell>
                <TableCell>
                  <span
                    className={cn(
                      'inline-flex h-6 items-center border px-2 font-mono text-[11px] font-medium tracking-[0.1em]',
                      getRoleBadgeStyle(student.role),
                    )}
                  >
                    {getRoleLabel(student.role)}
                  </span>
                </TableCell>
                <TableCell>
                  {student.dormitoryRoom ? `${student.dormitoryRoom}호` : '없음'}
                </TableCell>
                <TableCell>{student.majorClub?.name ?? '없음'}</TableCell>
                <TableCell>{student.autonomousClub?.name ?? '없음'}</TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="pixel"
                    className={cn('h-6 border px-2')}
                    onClick={() => onEdit?.(student)}
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
      </TableBody>
    </Table>
  );
};

export default StudentList;
