# BevingsAdvies Groningen

Onafhankelijke AI-tool voor het controleren van adviesrapporten aardbevingsschade in Groningen.

## Lokaal starten

```bash
npm run dev
```

Open http://localhost:3000 in uw browser.

## Environment variables

Vul `.env.local` in met de volgende waarden:

| Variabele | Beschrijving |
|-----------|-------------|
| `ANTHROPIC_API_KEY` | Uw Anthropic API key (haal op via console.anthropic.com) |
| `STRIPE_SECRET_KEY` | Stripe secret key (test: `sk_test_...`, productie: `sk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret van uw Stripe webhook endpoint |
| `NEXT_PUBLIC_BASE_URL` | Optioneel: basis-URL voor payment redirects |

## Testen zonder betaling

Upload een PDF met het query-parameter `?test=true` om de betaalwall over te slaan:

```
http://localhost:3000/?test=true
```

Na de analyse wordt u automatisch doorgestuurd naar het volledige rapport zonder betaling.

## Nieuwe regels toevoegen

De volledige regelset staat in `lib/herstelregels.ts` als de constante `SYSTEEM_PROMPT`.

1. Voeg de nieuwe regel toe aan de prompt-tekst in `SYSTEEM_PROMPT`
2. Voeg eventueel een nieuwe categorie toe aan het `categorieen` array in de JSON-instructie onderaan de prompt
3. Voeg dezelfde categorienaam toe in `app/page.tsx` (de `CONTROLE_TEGELS` array en de categorieweergave in het resultaatscherm)

## Database

SQLite voor lokale ontwikkeling, opgeslagen in `data/bevingsadvies.db` (wordt automatisch aangemaakt).

Voor productie: migreer naar Postgres door `better-sqlite3` te vervangen door `@neondatabase/serverless` of `pg`. De SQL-schema's zijn standaard compatible.

## Deployment

Voor Vercel:
1. Voeg de environment variables toe via het Vercel dashboard
2. Gebruik Vercel Postgres of Neon voor de database (vervang better-sqlite3)
3. Configureer de Stripe webhook URL naar `https://uwdomein.nl/api/webhook`
