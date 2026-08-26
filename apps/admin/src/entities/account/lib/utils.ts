import { AccountObjectType, AccountStatus, UserRoleType } from '@repo/shared/types';

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
      return 'border-foreground text-foreground';
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
      return 'border-foreground/25 text-muted-foreground';
    case 'ACTIVE':
      return 'border-success text-success';
  }
};

export const getAccountStatusDotStyle = (status: AccountStatus) => {
  switch (status) {
    case 'PENDING':
      return 'border-muted-foreground border';
    case 'ACTIVE':
      return 'bg-success';
  }
};
