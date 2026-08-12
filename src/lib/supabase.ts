import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

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

const LS_MEMBERS = 'ec_members';
const LS_CHECKINS = 'ec_checkins';

function getLocalMembers(): Member[] {
  try {
    const raw = localStorage.getItem(LS_MEMBERS);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  const seed: Member[] = [
    { id: '1', phone: '5551234567', name: 'Alex Rivera', check_in_count: 5, created_at: new Date(Date.now() - 86400000 * 5).toISOString() },
    { id: '2', phone: '5559876543', name: 'Sophia Chen', check_in_count: 12, created_at: new Date(Date.now() - 86400000 * 10).toISOString() },
    { id: '3', phone: '5555551234', name: 'Marcus Vance', check_in_count: 3, created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
  ];
  localStorage.setItem(LS_MEMBERS, JSON.stringify(seed));
  return seed;
}

function getLocalCheckIns(): CheckInRecord[] {
  try {
    const raw = localStorage.getItem(LS_CHECKINS);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  const now = Date.now();
  const seed: CheckInRecord[] = [
    { id: 'c1', member_id: '1', member_name: 'Alex Rivera', phone: '5551234567', created_at: new Date(now - 1000 * 60 * 8).toISOString() },
    { id: 'c2', member_id: '2', member_name: 'Sophia Chen', phone: '5559876543', created_at: new Date(now - 1000 * 60 * 35).toISOString() },
    { id: 'c3', member_id: '3', member_name: 'Marcus Vance', phone: '5555551234', created_at: new Date(now - 1000 * 60 * 90).toISOString() },
  ];
  localStorage.setItem(LS_CHECKINS, JSON.stringify(seed));
  return seed;
}

function saveMembers(m: Member[]) { try { localStorage.setItem(LS_MEMBERS, JSON.stringify(m)); } catch { /* */ } }
function saveCheckIns(c: CheckInRecord[]) { try { localStorage.setItem(LS_CHECKINS, JSON.stringify(c)); } catch { /* */ } }

export function normalizePhone(raw: string): string { return raw.replace(/\D/g, ''); }

export function formatPhone(raw: string): string {
  const d = normalizePhone(raw);
  if (d.length === 10) return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
  if (d.length === 11 && d[0] === '1') return `+1 (${d.slice(1,4)}) ${d.slice(4,7)}-${d.slice(7)}`;
  return raw;
}

// Check if Supabase is actually configured (not placeholder)
function isSupabaseConfigured(): boolean {
  return supabaseUrl !== 'https://placeholder.supabase.co' && !supabaseUrl.includes('placeholder');
}

export async function findMemberByPhone(phone: string): Promise<Member | null> {
  const clean = normalizePhone(phone);
  if (!clean) return null;

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('members').select('*').eq('phone', clean).maybeSingle();
      if (!error && data) return data as Member;
    } catch { /* fallthrough */ }
  }

  const members = getLocalMembers();
  return members.find(m => normalizePhone(m.phone) === clean) || null;
}

export async function registerNewMember(phone: string, name: string): Promise<Member> {
  const clean = normalizePhone(phone);
  const trimName = name.trim();

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('members').insert([{ phone: clean, name: trimName, check_in_count: 0 }]).select().single();
      if (!error && data) return data as Member;
    } catch { /* fallthrough */ }
  }

  const members = getLocalMembers();
  const newMember: Member = {
    id: 'm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    phone: clean,
    name: trimName,
    check_in_count: 0,
    created_at: new Date().toISOString(),
  };
  members.push(newMember);
  saveMembers(members);
  return newMember;
}

export async function performCheckIn(member: Member): Promise<{ member: Member; checkIn: CheckInRecord }> {
  const newCount = (member.check_in_count || 0) + 1;
  const now = new Date().toISOString();
  let updated: Member = { ...member, check_in_count: newCount };
  let record: CheckInRecord = { id: 'ci_' + Date.now(), member_id: member.id, member_name: member.name, phone: member.phone, created_at: now };

  if (isSupabaseConfigured()) {
    try {
      const { data: md } = await supabase.from('members').update({ check_in_count: newCount }).eq('id', member.id).select().single();
      if (md) updated = md as Member;
      const { data: cd } = await supabase.from('check_ins').insert([{ member_id: member.id, member_name: member.name, phone: member.phone }]).select().single();
      if (cd) record = cd as CheckInRecord;
    } catch { /* fallthrough */ }
  }

  const members = getLocalMembers();
  const idx = members.findIndex(m => m.id === member.id || normalizePhone(m.phone) === normalizePhone(member.phone));
  if (idx >= 0) members[idx] = updated; else members.push(updated);
  saveMembers(members);

  const checkins = getLocalCheckIns();
  checkins.unshift(record);
  saveCheckIns(checkins);

  return { member: updated, checkIn: record };
}

export async function getDashboardStats(): Promise<{ totalCheckIns: number; totalMembers: number; todayCheckIns: number }> {
  if (isSupabaseConfigured()) {
    try {
      const [ci, mem, today] = await Promise.all([
        supabase.from('check_ins').select('*', { count: 'exact', head: true }),
        supabase.from('members').select('*', { count: 'exact', head: true }),
        supabase.from('check_ins').select('*', { count: 'exact', head: true }).gte('created_at', new Date(new Date().setHours(0,0,0,0)).toISOString()),
      ]);
      if (!ci.error && !mem.error && ci.count !== null && mem.count !== null) {
        return { totalCheckIns: ci.count, totalMembers: mem.count, todayCheckIns: today.count || 0 };
      }
    } catch { /* fallthrough */ }
  }

  const checkins = getLocalCheckIns();
  const members = getLocalMembers();
  const startOfDay = new Date(); startOfDay.setHours(0,0,0,0);
  return {
    totalCheckIns: checkins.length,
    totalMembers: members.length,
    todayCheckIns: checkins.filter(c => new Date(c.created_at) >= startOfDay).length,
  };
}

export async function getRecentCheckIns(limit = 10): Promise<CheckInRecord[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('check_ins').select('*').order('created_at', { ascending: false }).limit(limit);
      if (!error && data && data.length > 0) return data as CheckInRecord[];
    } catch { /* fallthrough */ }
  }
  return getLocalCheckIns().slice(0, limit);
}
