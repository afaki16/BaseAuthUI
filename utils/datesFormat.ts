export function dateFormat(date: string | Date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('tr-TR');
}
