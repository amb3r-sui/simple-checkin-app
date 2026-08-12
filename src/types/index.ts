export interface Person {
  id: string;
  phone: string;
  name: string;
  checked_in: boolean;
  checked_in_at: string | null;
  created_at: string;
}

export type CheckInStatus = 'checked_in' | 'already_checked_in' | 'not_found';

export interface CheckInResult {
  status: CheckInStatus;
  person: Person | null;
  message: string;
}

export interface AppStats {
  checkedInCount: number;
  totalPeopleCount: number;
}
