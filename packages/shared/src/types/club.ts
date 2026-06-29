import { ApiResponse, StudentMajor, StudentSex } from '@repo/shared/types';

export type ClubType = 'MAJOR_CLUB' | 'AUTONOMOUS_CLUB';
export type ClubStatus = 'ACTIVE' | 'ABOLISHED';

export interface ClubMember {
  id: number;
  name: string;
  email: string;
  studentNumber: number;
  major: StudentMajor;
  sex: StudentSex;
}

export interface Club {
  id: number;
  name: string;
  type: ClubType;
  status: ClubStatus;
  foundedYear: number;
  abolishedYear?: number | null;
  leader: ClubMember | null;
  participants: ClubMember[];
}

export interface ClubListData {
  totalPages: number;
  totalElements: number;
  clubs: Club[];
}

export type ClubListResponse = ApiResponse<ClubListData>;
