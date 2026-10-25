export function computeStars(correct: number, total: number): 0 | 1 | 2 | 3 {
  if (total <= 0) {
    return 0;
  }
  const pct = (correct / total) * 100;
  if (pct >= 100) {
    return 3;
  }
  if (pct >= 75) {
    return 2;
  }
  if (pct >= 50) {
    return 1;
  }
  return 0;
}
