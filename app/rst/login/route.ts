// app/rst/login/route.ts (example pattern)
// ...
const attempts = new Map<string, { count: number; ts: number }>(); // per instance
function blocked(ip: string) {
  const now = Date.now();
  const rec = attempts.get(ip);
  if (!rec) return false;
  // reset after 10 minutes
  if (now - rec.ts > 10 * 60_000) { attempts.delete(ip); return false; }
  return rec.count >= 8;
}
function hit(ip: string, ok: boolean) {
  const now = Date.now();
  const rec = attempts.get(ip) || { count: 0, ts: now };
  if (!ok) {
    rec.count += 1; rec.ts = now; attempts.set(ip, rec);
  } else {
    // successful login clears
    attempts.delete(ip);
  }
}

// inside POST:
const ip = (headers.get("x-forwarded-for") || "").split(",")[0] || "unknown";
if (blocked(ip)) return NextResponse.json({ error: "Too many attempts" }, { status: 429 });

// … check password …
const ok = suppliedPassword === process.env.RST_ADMIN_PASSWORD;
hit(ip, ok);
if (!ok) return NextResponse.json({ error: "Invalid password" }, { status: 401 });
// continue with setting cookie/session…
