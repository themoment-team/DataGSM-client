import { z } from 'zod';

/** 어드민이 수정을 요청할 수 있는 항목. 서버 StudentDataEditField와 이름이 같아야 한다. */
export const STUDENT_DATA_EDIT_FIELDS = [
  'STUDENT_NUMBER',
  'DORMITORY_ROOM_NUMBER',
  'MAJOR_CLUB',
  'AUTONOMOUS_CLUB',
] as const;

export type StudentDataEditField = (typeof STUDENT_DATA_EDIT_FIELDS)[number];

export interface DataEditOption {
  value: number;
  label: string;
}

/**
 * 화면이 렌더할 항목 하나.
 * 동아리처럼 선택지가 필요한 항목은 options가 있어야 하는데,
 * 지금 서버는 필드 이름만 내려주므로 동아리는 options가 비어 있다.
 */
export interface DataEditFieldSpec {
  name: StudentDataEditField;
  options?: DataEditOption[];
}

const GRADE_RANGE = { min: 1, max: 3 };
const CLASS_RANGE = { min: 1, max: 4 };
const NUMBER_RANGE = { min: 1, max: 18 };
const DORMITORY_ROOM_RANGE = { min: 201, max: 518 };

function withinRange(value: number, { min, max }: { min: number; max: number }) {
  return Number.isInteger(value) && value >= min && value <= max;
}

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
  .refine((value) => withinRange(Number(value.slice(2)), NUMBER_RANGE), {
    message: `번호는 ${NUMBER_RANGE.min}~${NUMBER_RANGE.max}만 가능합니다.`,
  });

const dormitoryRoomRule = z
  .string()
  .min(1, { message: '기숙사 호실을 입력하세요.' })
  .regex(/^\d{3}$/, { message: '호실은 3자리입니다.' })
  .refine((value) => withinRange(Number(value), DORMITORY_ROOM_RANGE), {
    message: `${DORMITORY_ROOM_RANGE.min}호 ~ ${DORMITORY_ROOM_RANGE.max}호 사이로 입력하세요.`,
  });

/** 서버가 null을 거부하므로 "선택 안 함"은 허용하지 않는다. */
const clubRule = z.string().min(1, { message: '동아리를 선택하세요.' });

const FIELD_RULES: Record<StudentDataEditField, z.ZodTypeAny> = {
  STUDENT_NUMBER: studentNumberRule,
  DORMITORY_ROOM_NUMBER: dormitoryRoomRule,
  MAJOR_CLUB: clubRule,
  AUTONOMOUS_CLUB: clubRule,
};

/** 라벨·플레이스홀더·입력 제한. 요청된 항목만 이 표를 보고 렌더한다. */
export const DATA_EDIT_FIELD_META: Record<
  StudentDataEditField,
  { label: string; placeholder: string; maxLength?: number }
> = {
  STUDENT_NUMBER: { label: '학번', placeholder: '학번을 입력하세요', maxLength: 4 },
  DORMITORY_ROOM_NUMBER: {
    label: '기숙사 호실',
    placeholder: '기숙사 호실을 입력하세요',
    maxLength: 3,
  },
  MAJOR_CLUB: { label: '전공 동아리', placeholder: '전공 동아리를 선택하세요' },
  AUTONOMOUS_CLUB: { label: '자율 동아리', placeholder: '자율 동아리를 선택하세요' },
};

/** 폼 값. 키는 요청된 StudentDataEditField이고, 값은 입력 문자열이다. */
export type DataEditFormType = Record<string, string>;

/** 요청된 항목만 골라 검증 스키마를 만든다. 요청되지 않은 항목은 폼에도 없고 검증도 하지 않는다. */
export const buildDataEditSchema = (fields: StudentDataEditField[]) =>
  z.object(
    Object.fromEntries(fields.map((field) => [field, FIELD_RULES[field]])),
  ) as unknown as z.ZodType<DataEditFormType, DataEditFormType>;

/** authorize 요청에 실리는 정보 수정 값. 서버 OauthAuthorizeSubmitReqDto의 선택 필드와 대응한다. */
export interface DataEditPayload {
  studentGrade?: number;
  studentClass?: number;
  studentNumber?: number;
  dormitoryRoomNumber?: number;
  majorClubId?: number;
  autonomousClubId?: number;
}

/** 폼 값을 전송 형태로 바꾼다. 학번 4자리는 서버가 요구하는 학년/반/번호로 쪼개진다. */
export const toDataEditPayload = (
  fields: StudentDataEditField[],
  values: DataEditFormType,
): DataEditPayload =>
  fields.reduce<DataEditPayload>((payload, field) => {
    const value = values[field];
    if (!value) return payload;

    switch (field) {
      case 'STUDENT_NUMBER':
        payload.studentGrade = Number(value[0]);
        payload.studentClass = Number(value[1]);
        payload.studentNumber = Number(value.slice(2));
        break;
      case 'DORMITORY_ROOM_NUMBER':
        payload.dormitoryRoomNumber = Number(value);
        break;
      case 'MAJOR_CLUB':
        payload.majorClubId = Number(value);
        break;
      case 'AUTONOMOUS_CLUB':
        payload.autonomousClubId = Number(value);
        break;
    }

    return payload;
  }, {});
