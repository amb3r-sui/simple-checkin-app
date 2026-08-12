/**
 * Normalizes phone numbers by stripping non-digit characters and handling country prefixes.
 * E.g., "+63 917 123 4567" -> "09171234567"
 * E.g., "+1 (555) 123-4567" -> "5551234567"
 */
export function normalizePhone(raw: string): string {
  if (!raw) return '';
  let digits = raw.trim().replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('639')) {
    digits = '0' + digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('1')) {
    digits = digits.slice(1);
  }
  return digits;
}

/**
 * Auto-formats phone input dynamically as the user types or pastes.
 * Supports both Philippine (09XX XXX XXXX) and US ((XXX) XXX-XXXX) formats.
 */
export function formatPhoneInput(raw: string): string {
  const digits = normalizePhone(raw);
  if (!digits) return '';

  // Philippine format (starts with 09 or 0)
  if (digits.startsWith('09') || (digits.startsWith('0') && digits.length >= 10)) {
    if (digits.length <= 4) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 11)}`;
  }

  // US / Standard 10-digit format
  if (digits.length <= 3) {
    return digits.length === 3 ? `(${digits}) ` : digits;
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  }
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

/**
 * Formats phone number for display throughout the app.
 */
export function formatPhone(raw: string): string {
  return formatPhoneInput(raw);
}
