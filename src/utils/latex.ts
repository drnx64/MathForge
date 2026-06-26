const ALL_VARS = ['x', 'y', 'z', 'a', 'b', 'c', 'n', 'm', 't', 'i', 'j', 'k', 'u', 'v', 'w', 'p', 'q', 'r', 's'];

const USED = new Set<string>();

export function randomVariable(): string {
  const available = ALL_VARS.filter(v => !USED.has(v));
  const pool = available.length > 0 ? available : ALL_VARS;
  const chosen = pool[Math.floor(Math.random() * pool.length)];
  USED.add(chosen);
  return chosen;
}

export function resetVariables() {
  USED.clear();
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function timeout(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
