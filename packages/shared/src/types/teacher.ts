export type TeacherDepartment =
  | 'MEISTER'
  | 'DORMITORY'
  | 'GRADE'
  | 'ACADEMIC_AFFAIRS'
  | 'PROFESSIONAL_EDUCATION'
  | 'EMPLOYMENT_CAREER'
  | 'ADMINISTRATION';

export interface Teacher {
  id: number;
  name: string;
  email: string;
  department: TeacherDepartment;
  description: string | null;
}

export const TEACHER_DEPARTMENT_OPTIONS = [
  'MEISTER',
  'DORMITORY',
  'GRADE',
  'ACADEMIC_AFFAIRS',
  'PROFESSIONAL_EDUCATION',
  'EMPLOYMENT_CAREER',
  'ADMINISTRATION',
] as const satisfies readonly TeacherDepartment[];

export const getTeacherDepartmentLabel = (department: TeacherDepartment) => {
  switch (department) {
    case 'MEISTER':
      return '마이스터부';
    case 'DORMITORY':
      return '사감선생님';
    case 'GRADE':
      return '학년부';
    case 'ACADEMIC_AFFAIRS':
      return '교무부';
    case 'PROFESSIONAL_EDUCATION':
      return '전문교육부';
    case 'EMPLOYMENT_CAREER':
      return '취업진로부';
    case 'ADMINISTRATION':
      return '행정실';
  }
};
