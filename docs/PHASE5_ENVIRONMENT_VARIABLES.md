# Phase 5 — Environment variables

## Requirement

Each repo must include **.env.example** with the Empire variables. Rules: never commit the service role key, use different keys for production vs development, and add .env to .gitignore.

---

## .env.example (in each repo and in /empire)

```
# Empire OS — Copy to .env. Never commit .env or SUPABASE_SERVICE_ROLE_KEY.
# Use different keys for production vs development.

SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

EMPIRE_PROJECT_NAME=
EMPIRE_ENV=development
EMPIRE_CRON_SECRET=

LOG_LEVEL=info
```

---

## Variables

| Variable | Purpose |
|----------|---------|
| SUPABASE_URL | Supabase project URL (central Empire tables) |
| SUPABASE_ANON_KEY | Public key for client/dashboard (RLS applies) |
| SUPABASE_SERVICE_ROLE_KEY | Server-side only; for bridge/cron inserts. **Never commit.** |
| EMPIRE_PROJECT_NAME | Project id for this repo (e.g. omniwtms, myapproved) |
| EMPIRE_ENV | development \| production |
| EMPIRE_CRON_SECRET | Optional secret for cron/webhook auth |
| LOG_LEVEL | info \| debug \| warn \| error |

---

## Rules

- **Never commit the service role key.** Only SUPABASE_URL and SUPABASE_ANON_KEY may appear in docs/examples; keep SUPABASE_SERVICE_ROLE_KEY in .env only.
- **Use different keys for production vs development.** Use separate Supabase projects or env-specific .env files.
- **Add .env to .gitignore** in every repo so .env is never committed.

---

## Status

- **.env.example** added to: empire root, khamareclarke.com, omniwtms, myapproved, adstarter, seoinforce, identitymarketing, leveragejournal, leverageacademy.
- **.env** added to .gitignore in all 8 repos (and empire root if applicable).
