/** 어드민이 초기화를 요청할 수 있는 학생 컬럼. 서버 StudentDataEditField와 이름이 같아야 한다. */
export const STUDENT_DATA_EDIT_FIELDS = [
  'STUDENT_NUMBER',
  'DORMITORY_ROOM_NUMBER',
  'MAJOR_CLUB',
  'AUTONOMOUS_CLUB',
] as const;

export type StudentDataEditField = (typeof STUDENT_DATA_EDIT_FIELDS)[number];

/** 어드민·oauth 양쪽 화면에서 같은 이름으로 보여준다. */
export const STUDENT_DATA_EDIT_FIELD_LABEL: Record<StudentDataEditField, string> = {
  STUDENT_NUMBER: '학번',
  DORMITORY_ROOM_NUMBER: '기숙사 호실',
  MAJOR_CLUB: '전공 동아리',
  AUTONOMOUS_CLUB: '자율 동아리',
};

export const SPECIALTY_OPTIONS = [
  '프론트엔드',
  '백엔드',
  'AI',
  '안드로이드',
  'iOS',
  '플러터',
  'IoT',
  '공기업·금융권',
  '클라우드·DevOps',
  'PM·PO',
  '부사관',
  'IT 엔지니어',
  '보안',
  '로보틱스',
  '게임개발',
] as const;
