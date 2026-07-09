import { ApiResponse } from './base';
import { Student } from './student';
import { UserRoleType } from './userRole';

export type AccountSortBy = 'ID' | 'EMAIL' | 'ROLE' | 'CREATED_AT';

export interface AccountListItem {
  id: number;
  email: string;
  role: UserRoleType;
  isStudent: boolean;
  student: Student | null;
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
