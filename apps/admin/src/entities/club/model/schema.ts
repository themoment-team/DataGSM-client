import { z } from 'zod';

export const ClubFilterSchema = z.object({
  clubName: z.string().optional(),
  clubType: z.string().optional(),
  status: z.enum(['ACTIVE', 'ABOLISHED']).optional(),
});

export type ClubFilterType = z.infer<typeof ClubFilterSchema>;

export const AddClubSchema = z
  .object({
    name: z.string().min(1, { message: '동아리명을 입력해주세요.' }),
    type: z.enum(['MAJOR_CLUB', 'AUTONOMOUS_CLUB'], {
      message: '동아리 종류를 선택해주세요.',
    }),
    status: z.enum(['ACTIVE', 'ABOLISHED'], {
      message: '운영 상태를 선택해주세요.',
    }),
    foundedYear: z
      .number({ message: '설립연도를 입력해주세요.' })
      .int()
      .min(1900, { message: '1900년 이후의 연도를 입력해주세요.' }),
    abolishedYear: z.number().nullable().optional(),
    leaderId: z.number({ message: '동아리 부장을 선택해주세요.' }).min(1).optional(),
    participantIds: z.array(z.number()),
  })
  .refine(
    (data) => {
      if (data.status === 'ACTIVE') {
        return data.leaderId !== undefined;
      }
      return true;
    },
    { message: '동아리 부장을 선택해주세요.', path: ['leaderId'] },
  )
  .refine(
    (data) => {
      if (data.status === 'ACTIVE') {
        return data.participantIds.length >= 1;
      }
      return true;
    },
    { message: '한 명 이상의 팀원을 선택해주세요.', path: ['participantIds'] },
  )
  .superRefine((data, ctx) => {
    if (data.status !== 'ABOLISHED') return;

    if (data.abolishedYear == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '폐지연도를 입력해주세요.',
        path: ['abolishedYear'],
      });
      return;
    }

    if (!Number.isInteger(data.abolishedYear) || data.abolishedYear < 1900) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '1900년 이후의 연도를 입력해주세요.',
        path: ['abolishedYear'],
      });
    }
  });

export type AddClubType = z.infer<typeof AddClubSchema>;
