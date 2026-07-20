import { TEACHER_DEPARTMENT_OPTIONS, TeacherDepartment } from '@repo/shared/types';

import { z } from 'zod';

export const SignUpFormSchema = z
  .object({
    objectType: z.enum(['STUDENT', 'TEACHER'], {
      message: '가입 종류를 선택해주세요.',
    }),
    email: z.string().min(1, { message: '이메일을 입력해주세요.' }),
    password: z
      .string()
      .min(1, { message: '비밀번호를 입력해주세요.' })
      .min(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
      .max(100, { message: '비밀번호는 최대 100자 이하여야 합니다.' })
      .regex(/^(?=.*[a-zA-Z])(?=.*[0-9])/, {
        message: '비밀번호는 영문과 숫자를 포함해야 합니다.',
      }),
    confirmPassword: z.string().min(1, { message: '비밀번호 확인을 입력해주세요.' }),
    code: z
      .string()
      .min(1, { message: '인증 코드를 입력해주세요.' })
      .length(8, { message: '인증 코드는 8자리입니다.' }),
    privacyAgreed: z.boolean().refine((val) => val === true, {
      message: '개인정보 처리방침에 동의해주세요.',
    }),
    name: z.string().max(10, { message: '성함은 최대 10자 이하여야 합니다.' }).optional(),
    department: z.enum(TEACHER_DEPARTMENT_OPTIONS).optional(),
    description: z.string().max(100, { message: '설명은 최대 100자 이하여야 합니다.' }).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['confirmPassword'],
  })
  .superRefine((data, ctx) => {
    if (data.objectType !== 'TEACHER') return;

    if (!data.name?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '성함을 입력해주세요.',
        path: ['name'],
      });
    }

    if (!data.department) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '소속 부서를 선택해주세요.',
        path: ['department'],
      });
    }
  });

export type SignUpFormType = z.infer<typeof SignUpFormSchema>;

interface StudentSignUpRequest {
  objectType: 'STUDENT';
  email: string;
  password: string;
  code: string;
}

interface TeacherSignUpRequest {
  objectType: 'TEACHER';
  email: string;
  password: string;
  code: string;
  name: string;
  department: TeacherDepartment;
  description?: string;
}

export type SignUpRequestType = StudentSignUpRequest | TeacherSignUpRequest;
