# Ηλεκτρονικό προσκλητήριο γάμου (Cloudflare)

- `public/index.html`: το προσκλητήριο με τη φόρμα απάντησης (RSVP)
- `public/admin/`: η σελίδα σας με τα σύνολα και τη λίστα απαντήσεων (κλειδωμένη με κωδικό)
- `functions/api/`: το backend (Cloudflare Pages Functions)
- `schema.sql`: ο πίνακας της βάσης (Cloudflare D1)

## 1. Αλλάξτε τα στοιχεία του γάμου

Στο `public/index.html` βρείτε το `const CONFIG = { ... }` και συμπληρώστε ονόματα, ημερομηνία, εκκλησία, δεξίωση, links χάρτη και προθεσμία απάντησης.

## 2. Τοπική δοκιμή

```bash
npm install
npm run db:init:local     # φτιάχνει την τοπική βάση (μία φορά)
npm run dev               # http://localhost:8788  και  http://localhost:8788/admin/
```

Τοπικά ο κωδικός του admin είναι `test1234` (αρχείο `.dev.vars`).

## 3. Ανέβασμα στο Cloudflare (δωρεάν)

```bash
npx wrangler login                         # ανοίγει browser για σύνδεση στον λογαριασμό Cloudflare
npm run db:create                          # τυπώνει ένα database_id
```

Αντιγράψτε το `database_id` στο `wrangler.toml` και συνεχίστε:

```bash
npm run db:init:remote                     # δημιουργεί τον πίνακα στη βάση του Cloudflare
npx wrangler pages project create prosklitirio --production-branch main
npm run set-password                       # ορίζετε τον κωδικό για τη σελίδα admin
npm run deploy
```

Θα πάρετε ένα link σαν `https://prosklitirio.pages.dev`:

- **Αυτό στέλνετε στους καλεσμένους:** `https://prosklitirio.pages.dev`
- **Εδώ βλέπετε τις απαντήσεις:** `https://prosklitirio.pages.dev/admin/`

Κάθε φορά που αλλάζετε κάτι, τρέχετε ξανά `npm run deploy`.

## Χρήσιμα

- Αν ένας καλεσμένος ξανανοίξει το link από την ίδια συσκευή, βλέπει την απάντησή του και μπορεί να την αλλάξει. Δεν δημιουργείται διπλή εγγραφή.
- Ένα link που τελειώνει σε `#rsvp` (π.χ. για υπενθύμιση) πηγαίνει κατευθείαν στη φόρμα, χωρίς τον φάκελο.
- Από το admin μπορείτε να κατεβάσετε τις απαντήσεις σε CSV (ανοίγει στο Excel) και να σβήσετε διπλές ή λάθος εγγραφές.
- Αν θέλετε δικό σας domain (π.χ. `mariagiorgos.gr`): Cloudflare dashboard → Workers & Pages → prosklitirio → Custom domains.
