import {
  AccountObjectType,
  AccountStatus,
  TeacherDepartment,
  UserRoleType,
} from '@repo/shared/types';

export const getAccountRoleLabel = (role: UserRoleType) => {
  switch (role) {
    case 'ROOT':
      return '루트';
    case 'ADMIN':
      return '어드민';
    case 'USER':
      return '유저';
  }
};

export const getAccountRoleBadgeStyle = (role: UserRoleType) => {
  switch (role) {
    case 'ROOT':
      return 'bg-destructive text-white border-destructive';
    case 'ADMIN':
      return 'bg-foreground text-background border-foreground';
    case 'USER':
      return 'border-foreground/25 text-foreground';
  }
};

export const getAccountObjectTypeLabel = (objectType: AccountObjectType | null) => {
  switch (objectType) {
    case 'STUDENT':
      return '학생';
    case 'TEACHER':
      return '선생님';
    default:
      return '미연동';
  }
};

export const getAccountStatusLabel = (status: AccountStatus) => {
  switch (status) {
    case 'PENDING':
      return '승인대기';
    case 'ACTIVE':
      return '활성';
  }
};

export const getAccountStatusBadgeStyle = (status: AccountStatus) => {
  switch (status) {
    case 'PENDING':
      return 'bg-destructive text-white border-destructive';
    case 'ACTIVE':
      return 'border-foreground/25 text-foreground';
  }
};

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
