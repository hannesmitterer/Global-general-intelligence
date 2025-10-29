export type Sample = { ts: number; sorrow: number; hope: number };
const buf: Sample[] = [];
const maxAgeMs = () => (Number(process.env.SEED003_ROLLING_WINDOW_SEC ?? 120) * 1000) || 120000;
export function pushSample(sorrow: number, hope: number) {
  const ts = Date.now(); buf.push({ ts, sorrow, hope });
  const cutoff = ts - maxAgeMs(); while (buf.length && buf[0].ts < cutoff) buf.shift();
}
export function getRollingKpi() {
  const now = Date.now(); const cutoff = now - maxAgeMs();
  const window = buf.filter(s => s.ts >= cutoff);
  const avgSorrow = window.length ? window.reduce((a, s) => a + s.sorrow, 0) / window.length : 0;
  const avgHope = window.length ? window.reduce((a, s) => a + s.hope, 0) / window.length : 0;
  const ratio = avgSorrow > 0 ? avgHope / avgSorrow : (avgHope > 0 ? 2 : 0);
  return { avgSorrow, avgHope, ratio, samples: window.length, windowSec: Math.floor(maxAgeMs()/1000) };
}
