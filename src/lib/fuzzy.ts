/** Lower case, letters and digits only: "Dark_World" and "dark world" compare the same. */
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '');

/** Edit distance (insertions, deletions, substitutions) between two strings. */
function distance(a: string, b: string): number {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = row;
  }
  return prev[b.length];
}

/**
 * The item whose keys come closest to `query` (a typo, a missing word, a wrong separator), or
 * null if nothing is close enough to be a useful suggestion.
 */
export function closest<T>(query: string, items: T[], keys: (item: T) => string[]): T | null {
  const q = norm(query);
  if (q.length < 2) return null;
  let best: T | null = null;
  let bestScore = Infinity;
  for (const item of items) {
    for (const key of keys(item).map(norm)) {
      if (!key) continue;
      // One contains the other ("gear" -> "ancientgear"): a strong match
      const score = key.includes(q) || q.includes(key) ? Math.abs(key.length - q.length) * 0.1 : distance(q, key);
      if (score < bestScore) {
        bestScore = score;
        best = item;
      }
    }
  }
  // Allow about one typo per three letters
  return bestScore <= Math.max(2, Math.ceil(q.length / 3)) ? best : null;
}
