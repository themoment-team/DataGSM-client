import { TeacherDepartment } from '@repo/shared/types';

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

export const TEACHER_DEPARTMENT_OPTIONS: TeacherDepartment[] = [
  'MEISTER',
  'DORMITORY',
  'GRADE',
  'ACADEMIC_AFFAIRS',
  'PROFESSIONAL_EDUCATION',
  'EMPLOYMENT_CAREER',
  'ADMINISTRATION',
];
