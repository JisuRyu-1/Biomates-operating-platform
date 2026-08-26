export function fmtMoney(amount: number): string {
  if (amount === 0) return "무료";
  return `₩${amount.toLocaleString("ko-KR")}`;
}

export function fmtDate(dateStr: string): string {
  const dt = new Date(`${dateStr}T00:00:00`);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const d = String(dt.getDate()).padStart(2, "0");
  return `${y}.${m}.${d}`;
}

export function fmtDateTimeShort(iso: string): string {
  const dt = new Date(iso);
  const h = String(dt.getHours()).padStart(2, "0");
  const min = String(dt.getMinutes()).padStart(2, "0");
  return `${fmtDate(iso.slice(0, 10))} ${h}:${min}`;
}

/** "010-1234-5678" -> "010-****-5678". Falls back to masking the middle third of any other format. */
export function maskPhone(phone: string): string {
  const parts = phone.split("-");
  if (parts.length === 3) {
    return `${parts[0]}-${"*".repeat(parts[1].length)}-${parts[2]}`;
  }
  const len = phone.length;
  if (len <= 4) return phone;
  const start = Math.floor(len / 3);
  const end = len - Math.floor(len / 3);
  return phone.slice(0, start) + "*".repeat(end - start) + phone.slice(end);
}

export function todayStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
