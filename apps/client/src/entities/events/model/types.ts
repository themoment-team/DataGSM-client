import { ApiResponse } from '@repo/shared/types';

export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'FAILED';

export interface Event {
  id: number;
  target_url: string;
  events: string[];
  is_active: boolean;
  created_at: string;
  verification_status: VerificationStatus;
}

export interface EventListData {
  events: Event[];
}

export interface CreateEventRequest {
  target_url: string;
  events: string[];
}

export interface UpdateEventRequest {
  target_url?: string;
  events?: string[];
}

export interface CreateEventData extends Event {
  secret: string;
}

export type CreateEventResponse = ApiResponse<CreateEventData>;
export type UpdateEventResponse = ApiResponse<Event>;
export type EventListResponse = ApiResponse<EventListData>;

export type { EventFormType } from './schema';
