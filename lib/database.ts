import { sql } from '@vercel/postgres';

async function initSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS eenheidsprijzen (
      id SERIAL PRIMARY KEY,
      post_omschrijving TEXT NOT NULL UNIQUE,
      prijs_per_eenheid DECIMAL(10,2) NOT NULL,
      dossier_datum DATE NOT NULL,
      bijgewerkt_op TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS analyses (
      id TEXT PRIMARY KEY,
      bestandsnaam TEXT,
      resultaat_json TEXT NOT NULL,
      betaald BOOLEAN DEFAULT FALSE,
      upsell_gekozen TEXT,
      aangemaakt_op TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
}

let schemaInitialized = false;
async function ensureSchema() {
  if (!schemaInitialized) {
    await initSchema();
    schemaInitialized = true;
  }
}

export async function getPrijzengeheugen(): Promise<Record<string, number>> {
  await ensureSchema();
  const { rows } = await sql`SELECT post_omschrijving, prijs_per_eenheid FROM eenheidsprijzen`;
  const result: Record<string, number> = {};
  for (const row of rows) {
    result[row.post_omschrijving as string] = Number(row.prijs_per_eenheid);
  }
  return result;
}

export async function slaEenheidsprijzenOp(prijzen: Record<string, number>, dossierDatum: string) {
  await ensureSchema();
  for (const [omschrijving, prijs] of Object.entries(prijzen)) {
    await sql`
      INSERT INTO eenheidsprijzen (post_omschrijving, prijs_per_eenheid, dossier_datum)
      VALUES (${omschrijving}, ${prijs}, ${dossierDatum})
      ON CONFLICT (post_omschrijving) DO UPDATE SET
        prijs_per_eenheid = CASE WHEN eenheidsprijzen.dossier_datum <= EXCLUDED.dossier_datum THEN EXCLUDED.prijs_per_eenheid ELSE eenheidsprijzen.prijs_per_eenheid END,
        dossier_datum     = CASE WHEN eenheidsprijzen.dossier_datum <= EXCLUDED.dossier_datum THEN EXCLUDED.dossier_datum     ELSE eenheidsprijzen.dossier_datum     END,
        bijgewerkt_op     = CASE WHEN eenheidsprijzen.dossier_datum <= EXCLUDED.dossier_datum THEN CURRENT_TIMESTAMP         ELSE eenheidsprijzen.bijgewerkt_op     END
    `;
  }
}

export async function slaAnalyseOp(id: string, bestandsnaam: string, resultaatJson: string) {
  await ensureSchema();
  await sql`
    INSERT INTO analyses (id, bestandsnaam, resultaat_json)
    VALUES (${id}, ${bestandsnaam}, ${resultaatJson})
  `;
}

export async function getAnalyse(id: string): Promise<{ resultaat_json: string; betaald: boolean; upsell_gekozen: string | null } | null> {
  await ensureSchema();
  const { rows } = await sql`SELECT resultaat_json, betaald, upsell_gekozen FROM analyses WHERE id = ${id}`;
  if (rows.length === 0) return null;
  return {
    resultaat_json: rows[0].resultaat_json as string,
    betaald: rows[0].betaald as boolean,
    upsell_gekozen: rows[0].upsell_gekozen as string | null,
  };
}

export async function markeerBetaald(id: string) {
  await ensureSchema();
  await sql`UPDATE analyses SET betaald = TRUE WHERE id = ${id}`;
}

export async function slaUpsellOp(id: string, upsell: string) {
  await ensureSchema();
  await sql`UPDATE analyses SET upsell_gekozen = ${upsell} WHERE id = ${id}`;
}
