-- Allow dashboard to read with anon key (no login required).
-- Run in Supabase SQL Editor if your dashboard uses anon key and you are not using Supabase Auth for admin.
-- Optional: remove these policies later when you add auth and set user role = admin.

DROP POLICY IF EXISTS "empire_leads_read_anon" ON empire_leads;
CREATE POLICY "empire_leads_read_anon" ON empire_leads FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "empire_reports_read_anon" ON empire_reports;
CREATE POLICY "empire_reports_read_anon" ON empire_reports FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "empire_agent_activity_read_anon" ON empire_agent_activity;
CREATE POLICY "empire_agent_activity_read_anon" ON empire_agent_activity FOR SELECT TO anon USING (true);
