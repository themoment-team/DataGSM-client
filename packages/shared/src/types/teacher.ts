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
