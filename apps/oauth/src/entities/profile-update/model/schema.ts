import { z } from 'zod';

/** 어드민이 학생에게 수정을 요청할 수 있는 항목. */
export const PROFILE_UPDATE_FIELDS = [
  'STUDENT_NUMBER',
  'DORMITORY_ROOM_NUMBER',
  'MAJOR_CLUB_ID',
  'AUTONOMOUS_CLUB_ID',
] as const;

export type ProfileUpdateField = (typeof PROFILE_UPDATE_FIELDS)[number];

export interface ProfileUpdateOption {
  value: number;
  label: string;
}

/**
 * 서버가 티켓 조회 응답으로 내려주는 항목 하나.
 * 이 화면은 아직 액세스 토큰이 없어 목록 API를 부를 수 없으므로,
 * 동아리처럼 선택지가 필요한 항목은 options를 함께 받아야 한다.
 */
export interface ProfileUpdateFieldSpec {
  name: ProfileUpdateField;
  options?: ProfileUpdateOption[];
}

/** Select에서 "선택 안 함"을 나타내는 값. 전송 시 null로 바뀐다. */
export const NO_SELECTION_VALUE = 'none';

const GRADE_RANGE = { min: 1, max: 3 };
const CLASS_RANGE = { min: 1, max: 4 };
const DORMITORY_ROOM_RANGE = { min: 201, max: 518 };

/** 학번은 `학년(1) + 반(1) + 번호(2)` 4자리로 입력받는다. 예) 2103 = 2학년 1반 3번 */
const studentNumberRule = z
  .string()
  .min(1, { message: '학번을 입력하세요.' })
  .regex(/^\d{4}$/, { message: '학번은 4자리입니다.' })
  .refine((value) => withinRange(Number(value[0]), GRADE_RANGE), {
    message: `학년은 ${GRADE_RANGE.min}~${GRADE_RANGE.max}만 가능합니다.`,
  })
  .refine((value) => withinRange(Number(value[1]), CLASS_RANGE), {
    message: `반은 ${CLASS_RANGE.min}~${CLASS_RANGE.max}만 가능합니다.`,
  })
  .refine((value) => Number(value.slice(2)) >= 1, { message: '번호를 확인해주세요.' });

const dormitoryRoomRule = z
  .string()
  .min(1, { message: '기숙사 호실을 입력하세요.' })
  .regex(/^\d{3}$/, { message: '호실은 3자리입니다.' })
  .refine((value) => withinRange(Number(value), DORMITORY_ROOM_RANGE), {
    message: `${DORMITORY_ROOM_RANGE.min}호 ~ ${DORMITORY_ROOM_RANGE.max}호 사이로 입력하세요.`,
  });

const clubRule = z.string().min(1, { message: '동아리를 선택하세요.' });

function withinRange(value: number, { min, max }: { min: number; max: number }) {
  return Number.isInteger(value) && value >= min && value <= max;
}

const FIELD_RULES: Record<ProfileUpdateField, z.ZodTypeAny> = {
  STUDENT_NUMBER: studentNumberRule,
  DORMITORY_ROOM_NUMBER: dormitoryRoomRule,
  MAJOR_CLUB_ID: clubRule,
  AUTONOMOUS_CLUB_ID: clubRule,
};

/** 라벨·플레이스홀더·입력 제한. 요청된 항목만 이 표를 보고 렌더한다. */
export const PROFILE_UPDATE_FIELD_META: Record<
  ProfileUpdateField,
  { label: string; placeholder: string; maxLength?: number }
> = {
  STUDENT_NUMBER: { label: '학번', placeholder: '학번을 입력하세요', maxLength: 4 },
  DORMITORY_ROOM_NUMBER: {
    label: '기숙사 호실',
    placeholder: '기숙사 호실을 입력하세요',
    maxLength: 3,
  },
  MAJOR_CLUB_ID: { label: '전공 동아리', placeholder: '전공 동아리를 선택하세요' },
  AUTONOMOUS_CLUB_ID: { label: '자율 동아리', placeholder: '자율 동아리를 선택하세요' },
};

/** 폼 값. 키는 요청된 ProfileUpdateField이고, 값은 입력 문자열이다. */
export type ProfileUpdateFormType = Record<string, string>;

/** 요청된 항목만 골라 검증 스키마를 만든다. 요청되지 않은 항목은 폼에도 없고 검증도 하지 않는다. */
export const buildProfileUpdateSchema = (fields: ProfileUpdateField[]) =>
  z.object(
    Object.fromEntries(fields.map((field) => [field, FIELD_RULES[field]])),
  ) as unknown as z.ZodType<ProfileUpdateFormType, ProfileUpdateFormType>;

export type ProfileUpdateRequest = Partial<Record<ProfileUpdateField, number | null>>;

/** 폼 값을 전송 형태로 바꾼다. 요청된 항목 밖의 값은 여기서 걸러진다. */
export const toProfileUpdateRequest = (
  fields: ProfileUpdateField[],
  values: ProfileUpdateFormType,
): ProfileUpdateRequest =>
  fields.reduce<ProfileUpdateRequest>((request, field) => {
    const value = values[field];
    request[field] = value === NO_SELECTION_VALUE ? null : Number(value);
    return request;
  }, {});
