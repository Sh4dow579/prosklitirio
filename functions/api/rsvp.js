// POST /api/rsvp — αποθηκεύει (ή ενημερώνει) την απάντηση ενός καλεσμένου
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });

const toInt = (v, min, max) => {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min;
};

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Μη έγκυρα δεδομένα." }, 400);
  }

  const name = String(body.name ?? "").trim().replace(/\s+/g, " ").slice(0, 120);
  if (name.length < 2) return json({ error: "Παρακαλούμε γράψτε το όνομά σας." }, 400);

  const attending = body.attending === true;
  const adults = attending ? toInt(body.adults, 1, 20) : 0;
  const children = attending ? toInt(body.children, 0, 20) : 0;
  const message = String(body.message ?? "").trim().slice(0, 1000);
  const now = new Date().toISOString();

  // Αν ο καλεσμένος έχει ήδη απαντήσει από την ίδια συσκευή, ενημερώνουμε την ίδια εγγραφή
  const id = typeof body.id === "string" && /^[0-9a-f-]{36}$/i.test(body.id) ? body.id : null;
  if (id) {
    const { meta } = await env.DB.prepare(
      `UPDATE rsvps SET name = ?1, attending = ?2, adults = ?3, children = ?4, message = ?5, updated_at = ?6
       WHERE id = ?7`
    ).bind(name, attending ? 1 : 0, adults, children, message, now, id).run();
    if (meta.changes > 0) return json({ id, updated: true });
    // αν διαγράφηκε από τον admin, δημιουργείται ξανά παρακάτω
  }

  const newId = crypto.randomUUID();
  await env.DB.prepare(
    `INSERT INTO rsvps (id, name, attending, adults, children, message, created_at, updated_at)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?7)`
  ).bind(newId, name, attending ? 1 : 0, adults, children, message, now).run();

  return json({ id: newId, updated: false }, 201);
}
