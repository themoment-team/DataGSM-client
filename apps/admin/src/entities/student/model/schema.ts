import { StudentDataEditField } from '@repo/shared/constants';
import { z } from 'zod';

export const StudentFilterSchema = z.object({
  name: z.string().optional(),
  grade: z.string().optional(),
  classNum: z.string().optional(),
  sex: z.string().optional(),
  role: z.string().optional(),
  status: z.string().optional(),
  includeGraduates: z.boolean().optional(),
  includeWithdrawn: z.boolean().optional(),
  onlyEnrolled: z.boolean().optional(),
  sortBy: z.string().optional(),
});

export type StudentFilterType = z.infer<typeof StudentFilterSchema>;

export const AddStudentSchema = z.object({
  name: z.string().min(1, { message: '이름을 입력해주세요.' }),
  sex: z.enum(['MAN', 'WOMAN'], { message: '성별을 선택해주세요.' }),
  email: z.email({ message: '올바른 이메일 형식이 아닙니다.' }),
  grade: z.number({ message: '학년을 선택해주세요.' }),
  classNum: z.number({ message: '반을 선택해주세요.' }),
  number: z.number({ message: '번호를 선택해주세요.' }),
  role: z.enum(
    ['GENERAL_STUDENT', 'STUDENT_COUNCIL', 'DORMITORY_MANAGER', 'GRADUATE', 'WITHDRAWN'],
    {
      message: '구분을 선택해주세요.',
    },
  ),
  dormitoryRoomNumber: z
    .number({ message: '호실을 입력해주세요.' })
    .min(201, { message: '201호 이상으로 입력해주세요.' })
    .max(518, { message: '518호 이하로 입력해주세요.' }),
  specialty: z.string().min(1, { message: '전공을 입력해주세요.' }).nullable().optional(),
  githubId: z.string().nullable().optional(),
  majorClubId: z.number({ message: '전공 동아리를 선택해주세요.' }).min(1).nullable(),
  autonomousClubId: z.number({ message: '자율 동아리를 선택해주세요.' }).min(1).nullable(),
});

export type AddStudentType = z.infer<typeof AddStudentSchema>;

/** 선택한 학생들의 지정 컬럼을 초기화하고 로그인 때 다시 입력받도록 요청한다. */
export interface RequestStudentDataEditType {
  studentIds: number[];
  fields: StudentDataEditField[];
}
