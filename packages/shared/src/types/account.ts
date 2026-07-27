import { ApiResponse } from './base';
import { Student } from './student';
import { Teacher } from './teacher';
import { UserRoleType } from './userRole';

export type AccountSortBy = 'ID' | 'EMAIL' | 'ROLE' | 'CREATED_AT';

export type AccountObjectType = 'STUDENT' | 'TEACHER';

export type AccountStatus = 'PENDING' | 'ACTIVE';

export interface AccountListItem {
  id: number;
  email: string;
  role: UserRoleType;
  status: AccountStatus;
  objectType: AccountObjectType | null;
  student: Student | null;
  teacher: Teacher | null;
  createdAt: string;
  updatedAt: string;
}

export interface AccountListData {
  totalPages: number;
  totalElements: number;
  accounts: AccountListItem[];
}

export type AccountListResponse = ApiResponse<AccountListData>;

export interface ModifyAccountRoleRequest {
  role: Extract<UserRoleType, 'ADMIN' | 'USER'>;
}
