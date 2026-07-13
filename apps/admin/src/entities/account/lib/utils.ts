import { UserRoleType } from '@repo/shared/types';

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
