// /api/admin — μόνο για το ζευγάρι, προστατεύεται με τον κωδικό ADMIN_PASSWORD
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });

async function sha256(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return new Uint8Array(buf);
}

// Σύγκριση σε σταθερό χρόνο (συγκρίνουμε hashes ώστε να έχουν ίδιο μήκος)
async function isAuthorized(request, env) {
  if (!env.ADMIN_PASSWORD) return false;
  const header = request.headers.get("Authorization") || "";
  const given = header.startsWith("Bearer ") ? header.slice(7) : "";
  const [a, b] = await Promise.all([sha256(given), sha256(env.ADMIN_PASSWORD)]);
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function onRequest({ request, env }) {
  if (!env.ADMIN_PASSWORD) {
    return json({ error: "Δεν έχει οριστεί ADMIN_PASSWORD στο Cloudflare." }, 500);
  }
  if (!(await isAuthorized(request, env))) {
    return json({ error: "Λάθος κωδικός." }, 401);
  }

  if (request.method === "GET") {
    const { results } = await env.DB.prepare(
      `SELECT id, name, attending, adults, children, message, created_at, updated_at
       FROM rsvps ORDER BY updated_at DESC`
    ).all();

    const totals = { responses: results.length, yes: 0, no: 0, adults: 0, children: 0, guests: 0 };
    for (const r of results) {
      r.attending = r.attending === 1;
      if (r.attending) {
        totals.yes++;
        totals.adults += r.adults;
        totals.children += r.children;
      } else {
        totals.no++;
      }
    }
    totals.guests = totals.adults + totals.children;
    return json({ totals, rsvps: results });
  }

  if (request.method === "DELETE") {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return json({ error: "Λείπει το id." }, 400);
    const { meta } = await env.DB.prepare("DELETE FROM rsvps WHERE id = ?1").bind(id).run();
    return json({ deleted: meta.changes });
  }

  return json({ error: "Method not allowed" }, 405);
}
