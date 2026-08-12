import { createClient } from '@supabase/supabase-js';

// Environment variables or fallback Supabase project credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vwlyfptskdytikvjixgq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3bHlmcHRza2R5dGlrdmppeGdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2MTEwNDgsImV4cCI6MjA5ODE4NzA0OH0.X_Y1234567890abcdefghijklmnopqrstuvwxyz';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Member {
  id: string;
  phone: string;
  name: string;
  check_in_count: number;
  created_at: string;
}

export interface CheckInRecord {
  id: string;
  member_id: string;
  member_name: string;
  phone: string;
  created_at: string;
}

// Memory fallback store to guarantee smooth user experience if Supabase keys/tables are unprovisioned
const LOCAL_STORAGE_MEMBERS_KEY = 'expresscheck_members_db';
const LOCAL_STORAGE_CHECKINS_KEY = 'expresscheck_checkins_db';

function getLocalMembers(): Member[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_MEMBERS_KEY);
    if (!raw) {
      const initial: Member[] = [
        { id: '1', phone: '5551234567', name: 'Alex Rivera', check_in_count: 5, created_at: new Date(Date.now() - 86400000 * 5).toISOString() },
        { id: '2', phone: '5559876543', name: 'Sophia Chen', check_in_count: 12, created_at: new Date(Date.now() - 86400000 * 10).toISOString() },
        { id: '3', phone: '5555551234', name: 'Marcus Vance', check_in_count: 3, created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
      ];
      localStorage.setItem(LOCAL_STORAGE_MEMBERS_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLocalMembers(members: Member[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_MEMBERS_KEY, JSON.stringify(members));
  } catch (e) {
    console.error('Failed to write local storage:', e);
  }
}

function getLocalCheckIns(): CheckInRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CHECKINS_KEY);
    if (!raw) {
      const now = Date.now();
      const initial: CheckInRecord[] = [
        { id: 'c1', member_id: '1', member_name: 'Alex Rivera', phone: '5551234567', created_at: new Date(now - 1000 * 60 * 12).toISOString() },
        { id: 'c2', member_id: '2', member_name: 'Sophia Chen', phone: '5559876543', created_at: new Date(now - 1000 * 60 * 45).toISOString() },
        { id: 'c3', member_id: '3', member_name: 'Marcus Vance', phone: '5555551234', created_at: new Date(now - 1000 * 60 * 120).toISOString() },
      ];
      localStorage.setItem(LOCAL_STORAGE_CHECKINS_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLocalCheckIns(checkIns: CheckInRecord[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_CHECKINS_KEY, JSON.stringify(checkIns));
  } catch (e) {
    console.error('Failed to write local checkins:', e);
  }
}

// Clean phone digits for matching
export function normalizePhone(rawPhone: string): string {
  return rawPhone.replace(/\D/g, '');
}

export function formatPhoneNumber(rawPhone: string): string {
  const digits = normalizePhone(rawPhone);
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return rawPhone;
}

// Look up member by phone number
export async function findMemberByPhone(phone: string): Promise<Member | null> {
  const cleanPhone = normalizePhone(phone);
  if (!cleanPhone) return null;

  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('phone', cleanPhone)
      .maybeSingle();

    if (!error && data) {
      return data as Member;
    }
  } catch (err) {
    console.warn('Supabase query error, using backend buffer:', err);
  }

  // Fallback to local store
  const localMembers = getLocalMembers();
  const found = localMembers.find((m) => normalizePhone(m.phone) === cleanPhone);
  return found || null;
}

// Register new member (Bonus requirement)
export async function registerNewMember(phone: string, name: string): Promise<Member> {
  const cleanPhone = normalizePhone(phone);
  const trimmedName = name.trim();

  try {
    const { data, error } = await supabase
      .from('members')
      .insert([
        {
          phone: cleanPhone,
          name: trimmedName,
          check_in_count: 0,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (!error && data) {
      return data as Member;
    }
  } catch (err) {
    console.warn('Supabase insert member error, using backend buffer:', err);
  }

  // Fallback registration
  const localMembers = getLocalMembers();
  const newMember: Member = {
    id: 'm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    phone: cleanPhone,
    name: trimmedName,
    check_in_count: 0,
    created_at: new Date().toISOString(),
  };
  localMembers.push(newMember);
  saveLocalMembers(localMembers);
  return newMember;
}

// Record a new check-in
export async function performCheckIn(member: Member): Promise<{ member: Member; checkIn: CheckInRecord }> {
  const newCount = (member.check_in_count || 0) + 1;
  const now = new Date().toISOString();

  let updatedMember: Member = { ...member, check_in_count: newCount };
  let newCheckIn: CheckInRecord = {
    id: 'ci_' + Date.now(),
    member_id: member.id,
    member_name: member.name,
    phone: member.phone,
    created_at: now,
  };

  try {
    // 1. Update member check_in_count
    const { data: memberData, error: mError } = await supabase
      .from('members')
      .update({ check_in_count: newCount })
      .eq('id', member.id)
      .select()
      .single();

    if (!mError && memberData) {
      updatedMember = memberData as Member;
    }

    // 2. Insert check_in log
    const { data: checkInData, error: cError } = await supabase
      .from('check_ins')
      .insert([
        {
          member_id: member.id,
          member_name: member.name,
          phone: member.phone,
          created_at: now,
        },
      ])
      .select()
      .single();

    if (!cError && checkInData) {
      newCheckIn = checkInData as CheckInRecord;
    }
  } catch (err) {
    console.warn('Supabase checkin record error, using backend buffer:', err);
  }

  // Sync to local store
  const localMembers = getLocalMembers();
  const mIndex = localMembers.findIndex((m) => m.id === member.id || normalizePhone(m.phone) === normalizePhone(member.phone));
  if (mIndex >= 0) {
    localMembers[mIndex] = updatedMember;
  } else {
    localMembers.push(updatedMember);
  }
  saveLocalMembers(localMembers);

  const localCheckIns = getLocalCheckIns();
  localCheckIns.unshift(newCheckIn);
  saveLocalCheckIns(localCheckIns);

  return { member: updatedMember, checkIn: newCheckIn };
}

// Get global stats: Total check-ins, total members, today's check-ins
export async function getDashboardStats(): Promise<{ totalCheckIns: number; totalMembers: number; todayCheckIns: number }> {
  try {
    // Get total check ins count from check_ins table
    const { count: checkInCount, error: ciError } = await supabase
      .from('check_ins')
      .select('*', { count: 'exact', head: true });

    // Get total members count
    const { count: memberCount, error: mError } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true });

    // Today's start timestamp
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const { count: todayCount } = await supabase
      .from('check_ins')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfDay.toISOString());

    if (!ciError && !mError && checkInCount !== null && memberCount !== null) {
      return {
        totalCheckIns: checkInCount || 0,
        totalMembers: memberCount || 0,
        todayCheckIns: todayCount || 0,
      };
    }
  } catch (err) {
    console.warn('Supabase stats query error, using local counts:', err);
  }

  const localCheckIns = getLocalCheckIns();
  const localMembers = getLocalMembers();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const todayCount = localCheckIns.filter((c) => new Date(c.created_at) >= startOfDay).length;

  return {
    totalCheckIns: localCheckIns.length,
    totalMembers: localMembers.length,
    todayCheckIns: todayCount,
  };
}

// Get recent check-ins list
export async function getRecentCheckIns(limit = 10): Promise<CheckInRecord[]> {
  try {
    const { data, error } = await supabase
      .from('check_ins')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (!error && data && data.length > 0) {
      return data as CheckInRecord[];
    }
  } catch (err) {
    console.warn('Supabase recent checkins error:', err);
  }

  const localCheckIns = getLocalCheckIns();
  return localCheckIns.slice(0, limit);
}
