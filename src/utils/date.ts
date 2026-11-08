export function dateKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function parseDate(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
}
export function addDays(value: string, days: number): string {
  const d = parseDate(value);
  d.setDate(d.getDate() + days);
  return dateKey(d);
}
export function shortDate(value: string): string {
  return value
    ? parseDate(value).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : "No date";
}
export function daysBack(count: number, end = dateKey()): string[] {
  return Array.from({ length: count }, (_, i) => addDays(end, i - count + 1));
}
export function validDate(value: string): boolean {
  return (
    !value ||
    (/^\d{4}-\d{2}-\d{2}$/.test(value) && dateKey(parseDate(value)) === value)
  );
}
export function nextDate(value: string, recurrence: string): string {
  if (recurrence === "monthly") {
    const d = parseDate(value);
    const day = d.getDate();
    d.setDate(1);
    d.setMonth(d.getMonth() + 1);
    const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    d.setDate(Math.min(day, last));
    return dateKey(d);
  }
  return addDays(value, recurrence === "weekly" ? 7 : 1);
}
export const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
export const stamp = () => {
  const now = new Date().toISOString();
  return { id: uid(), createdAt: now, updatedAt: now };
};
