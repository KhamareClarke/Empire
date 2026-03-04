-- EMPIRE OS — Central tables for Sovereign Control Panel
-- Run this in your Supabase SQL Editor (project used by KhamareClarke.com)
-- Use service role only for server-side inserts; RLS restricts reads to admin.

-- ---------------------------------------------------------------------------
-- empire_leads
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS empire_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL,
  source TEXT,
  email TEXT,
  name TEXT,
  payload JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_empire_leads_project ON empire_leads(project_id);
CREATE INDEX IF NOT EXISTS idx_empire_leads_created ON empire_leads(created_at DESC);

COMMENT ON TABLE empire_leads IS 'Unified leads from all 8 Empire projects';

-- ---------------------------------------------------------------------------
-- empire_reports
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS empire_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL,
  report_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error')),
  title TEXT,
  body TEXT,
  payload JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_empire_reports_project ON empire_reports(project_id);
CREATE INDEX IF NOT EXISTS idx_empire_reports_created ON empire_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_empire_reports_severity ON empire_reports(severity) WHERE severity = 'error';

COMMENT ON TABLE empire_reports IS 'Reports and failures from agents and cron';

-- ---------------------------------------------------------------------------
-- empire_agent_activity
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS empire_agent_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  action TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'started' CHECK (status IN ('started', 'finished', 'failed')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  payload JSONB DEFAULT '{}',
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_empire_agent_activity_project ON empire_agent_activity(project_id);
CREATE INDEX IF NOT EXISTS idx_empire_agent_activity_agent ON empire_agent_activity(agent_id);
CREATE INDEX IF NOT EXISTS idx_empire_agent_activity_started ON empire_agent_activity(started_at DESC);

COMMENT ON TABLE empire_agent_activity IS 'Structured logging for all 29 agents across projects';

-- ---------------------------------------------------------------------------
-- RLS: allow read only for admin users; inserts via service role only
-- ---------------------------------------------------------------------------
ALTER TABLE empire_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE empire_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE empire_agent_activity ENABLE ROW LEVEL SECURITY;

-- Policy: admins can read (adjust to match your auth: JWT role or user metadata)
DROP POLICY IF EXISTS "empire_leads_read_admin" ON empire_leads;
CREATE POLICY "empire_leads_read_admin" ON empire_leads
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'admin'
    OR EXISTS (SELECT 1 FROM auth.users u WHERE u.id = auth.uid() AND u.raw_user_meta_data->>'role' = 'admin')
  );

DROP POLICY IF EXISTS "empire_reports_read_admin" ON empire_reports;
CREATE POLICY "empire_reports_read_admin" ON empire_reports
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'admin'
    OR EXISTS (SELECT 1 FROM auth.users u WHERE u.id = auth.uid() AND u.raw_user_meta_data->>'role' = 'admin')
  );

DROP POLICY IF EXISTS "empire_agent_activity_read_admin" ON empire_agent_activity;
CREATE POLICY "empire_agent_activity_read_admin" ON empire_agent_activity
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'admin'
    OR EXISTS (SELECT 1 FROM auth.users u WHERE u.id = auth.uid() AND u.raw_user_meta_data->>'role' = 'admin')
  );

-- No INSERT/UPDATE/DELETE policies for anon or authenticated;
-- use Supabase service_role key server-side to bypass RLS for inserts.

-- Optional: if you use a dedicated admin table
-- CREATE POLICY "empire_leads_read_admin" ON empire_leads FOR SELECT USING (public.is_empire_admin(auth.uid()));
