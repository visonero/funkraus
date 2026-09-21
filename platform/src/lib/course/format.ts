// "00" -> "0", "01" -> "1"; non-numeric labels stay as they are.
export function moduleLabel(num: string) {
  const value = Number(num);
  return Number.isFinite(value) ? String(value) : num;
}
