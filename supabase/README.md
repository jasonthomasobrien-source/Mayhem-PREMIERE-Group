# Supabase Migrations

## Running migrations locally (if using Supabase CLI)

```bash
supabase migration up
```

## Running migrations on production (Supabase dashboard)

1. Go to Supabase dashboard → SQL Editor
2. Paste the full contents of `0001_init.sql`
3. Click "Run"
4. Verify all tables created without errors

## After first deployment

Edit agent names in the dashboard:
- Go to Supabase → agents table
- Replace "TBD" names with real agent names
- Keep emoji intact (or customize per agent)

## Notes

- All tables have RLS enabled for security
- Anon key can read all tables and insert to outreach
- Service role key used for /admin operations (agent management)
- Outreach table is published to Realtime
