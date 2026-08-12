import { createClient } from '@supabase/supabase-js';
import type { Person, CheckInResult, AppStats } from '../types';
import { normalizePhone, formatPhone } from './phone';

export { normalizePhone, formatPhone };

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const LS_PEOPLE = 'checkin_app_people';

export function isSupabaseConfigured(): boolean {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    supabaseUrl !== 'https://placeholder.supabase.co' &&
    !supabaseUrl.includes('placeholder')
  );
}

/* LocalStorage fallback helpers */
function getLocalPeople(): Person[] {
  try {
    const raw = localStorage.getItem(LS_PEOPLE);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  const seed: Person[] = [
    {
      id: 'p-1',
      phone: '09171234567',
      name: 'Alex Rivera',
      checked_in: true,
      checked_in_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: 'p-2',
      phone: '09189876543',
      name: 'Sophia Chen',
      checked_in: true,
      checked_in_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: 'p-3',
      phone: '5551234567',
      name: 'Marcus Vance',
      checked_in: false,
      checked_in_at: null,
      created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
  ];
  try {
    localStorage.setItem(LS_PEOPLE, JSON.stringify(seed));
  } catch {
    /* ignore */
  }
  return seed;
}

function saveLocalPeople(people: Person[]) {
  try {
    localStorage.setItem(LS_PEOPLE, JSON.stringify(people));
  } catch {
    /* ignore */
  }
}

/**
 * Helper to calculate today's start date ISO string.
 */
function getTodayStartISO(): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.toISOString();
}

/**
 * Retrieves statistics: current checked-in count, total registered people, and today's visits.
 */
export async function getAppStats(): Promise<AppStats> {
  const todayIso = getTodayStartISO();

  if (isSupabaseConfigured()) {
    try {
      const [checkedInRes, totalRes, todayRes] = await Promise.all([
        supabase.from('people').select('*', { count: 'exact', head: true }).eq('checked_in', true),
        supabase.from('people').select('*', { count: 'exact', head: true }),
        supabase
          .from('people')
          .select('*', { count: 'exact', head: true })
          .eq('checked_in', true)
          .gte('checked_in_at', todayIso),
      ]);

      if (!checkedInRes.error && checkedInRes.count !== null) {
        return {
          checkedInCount: checkedInRes.count,
          totalPeopleCount: totalRes.count ?? checkedInRes.count,
          todayCount: todayRes.count ?? checkedInRes.count,
        };
      }
    } catch (err) {
      console.warn('Supabase stats fetch error, falling back to local dataset:', err);
    }
  }

  const people = getLocalPeople();
  const todayTime = new Date(todayIso).getTime();

  const checkedInList = people.filter(p => p.checked_in);
  const todayCount = checkedInList.filter(
    p => p.checked_in_at && new Date(p.checked_in_at).getTime() >= todayTime
  ).length;

  return {
    checkedInCount: checkedInList.length,
    totalPeopleCount: people.length,
    todayCount,
  };
}

/**
 * Retrieves recent checked-in people list for live activity feed.
 */
export async function getRecentCheckedInPeople(limit = 10): Promise<Person[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .eq('checked_in', true)
        .order('checked_in_at', { ascending: false })
        .limit(limit);
      if (!error && data) return data as Person[];
    } catch (err) {
      console.warn('Supabase recent list fetch error, using fallback:', err);
    }
  }

  const people = getLocalPeople();
  return people
    .filter(p => p.checked_in && p.checked_in_at)
    .sort((a, b) => new Date(b.checked_in_at!).getTime() - new Date(a.checked_in_at!).getTime())
    .slice(0, limit);
}

/**
 * Lightweight search/lookup by phone number without modifying check-in state.
 */
export async function lookupByPhone(rawPhone: string): Promise<Person | null> {
  const cleanPhone = normalizePhone(rawPhone);
  if (!cleanPhone) {
    throw new Error('Please enter a valid phone number.');
  }

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .eq('phone', cleanPhone)
        .maybeSingle();

      if (error) throw error;
      return (data as Person) || null;
    } catch (err: any) {
      console.error('Supabase lookup error:', err);
      if (!navigator.onLine) {
        throw new Error('You are currently offline. Please check your internet connection.');
      }
    }
  }

  const people = getLocalPeople();
  const found = people.find(p => normalizePhone(p.phone) === cleanPhone);
  return found || null;
}

/**
 * Primary Check-In operation for an existing phone number.
 */
export async function checkInByPhone(rawPhone: string): Promise<CheckInResult> {
  const cleanPhone = normalizePhone(rawPhone);
  if (!cleanPhone) {
    throw new Error('Please enter a valid phone number.');
  }

  if (isSupabaseConfigured()) {
    try {
      // 1. Search by phone
      const { data: existing, error: searchErr } = await supabase
        .from('people')
        .select('*')
        .eq('phone', cleanPhone)
        .maybeSingle();

      if (searchErr) throw searchErr;

      if (!existing) {
        return {
          status: 'not_found',
          person: null,
          message: 'Phone number not found.',
        };
      }

      const person = existing as Person;

      // 2. Check if already checked in
      if (person.checked_in) {
        return {
          status: 'already_checked_in',
          person,
          message: `Already checked in: ${person.name}`,
        };
      }

      // 3. Mark as checked in
      const nowIso = new Date().toISOString();
      const { data: updated, error: updateErr } = await supabase
        .from('people')
        .update({ checked_in: true, checked_in_at: nowIso })
        .eq('id', person.id)
        .select()
        .single();

      if (updateErr) throw updateErr;

      return {
        status: 'checked_in',
        person: updated as Person,
        message: `Checked in: ${(updated as Person).name}`,
      };
    } catch (err: any) {
      console.error('Supabase check-in error:', err);
      if (!navigator.onLine) {
        throw new Error('Network error: You are offline. Please check your connection.');
      }
    }
  }

  // Local fallback logic
  const people = getLocalPeople();
  const existingIdx = people.findIndex(p => normalizePhone(p.phone) === cleanPhone);

  if (existingIdx === -1) {
    return { status: 'not_found', person: null, message: 'Phone number not found.' };
  }

  const person = people[existingIdx];
  if (person.checked_in) {
    return { status: 'already_checked_in', person, message: `Already checked in: ${person.name}` };
  }

  const updated: Person = {
    ...person,
    checked_in: true,
    checked_in_at: new Date().toISOString(),
  };
  people[existingIdx] = updated;
  saveLocalPeople(people);

  return { status: 'checked_in', person: updated, message: `Checked in: ${updated.name}` };
}

/**
 * Register a new person and immediately mark them as checked in.
 */
export async function registerAndCheckIn(rawPhone: string, rawName: string): Promise<CheckInResult> {
  const cleanPhone = normalizePhone(rawPhone);
  const trimmedName = rawName.trim();

  if (!cleanPhone) throw new Error('Invalid phone number.');
  if (!trimmedName) throw new Error('Please enter your name.');

  const nowIso = new Date().toISOString();

  if (isSupabaseConfigured()) {
    try {
      const { data: created, error } = await supabase
        .from('people')
        .insert([
          {
            phone: cleanPhone,
            name: trimmedName,
            checked_in: true,
            checked_in_at: nowIso,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return {
        status: 'checked_in',
        person: created as Person,
        message: `Checked in: ${(created as Person).name}`,
      };
    } catch (err: any) {
      console.error('Supabase registration error:', err);
      if (!navigator.onLine) {
        throw new Error('Network error: Unable to register while offline.');
      }
    }
  }

  // Local Fallback
  const people = getLocalPeople();
  const newPerson: Person = {
    id: 'p-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    phone: cleanPhone,
    name: trimmedName,
    checked_in: true,
    checked_in_at: nowIso,
    created_at: nowIso,
  };
  people.push(newPerson);
  saveLocalPeople(people);

  return { status: 'checked_in', person: newPerson, message: `Checked in: ${newPerson.name}` };
}

/**
 * Subscribes to Supabase Realtime changes on the `people` table.
 * Returns an unsubscribe cleanup function.
 */
export function subscribeToPeopleChanges(onChange: () => void): () => void {
  if (!isSupabaseConfigured()) return () => {};

  try {
    const channel = supabase
      .channel('public:people')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'people' }, () => {
        onChange();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn('Supabase realtime subscription failed:', err);
    return () => {};
  }
}
