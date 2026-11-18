-- Παιδιά σε δύο ηλικίες (έως 4 και έως 8 ετών). Τρέχει μία φορά σε υπάρχουσα βάση:
--   npx wrangler d1 execute prosklitirio-db --remote --file=migrations/0001_kids_ages.sql
ALTER TABLE rsvps ADD COLUMN kids4 INTEGER NOT NULL DEFAULT 0;
ALTER TABLE rsvps ADD COLUMN kids8 INTEGER NOT NULL DEFAULT 0;
