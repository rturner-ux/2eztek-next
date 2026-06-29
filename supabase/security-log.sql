-- FORT 2EZ TEK — Security incident log
CREATE TABLE IF NOT EXISTS security_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip text,
  user_agent text,
  path text,
  method text,
  query text,
  referer text,
  threat_type text,  -- PROBE | INJECT | TRAVERSAL | BOT | SIEGE | GHOST | RECON
  severity text,     -- ELEVATED | HIGH | CRITICAL
  detail text,
  blocked boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sec_log_created  ON security_log(created_at DESC);
CREATE INDEX IF NOT EXISTS sec_log_ip       ON security_log(ip);
CREATE INDEX IF NOT EXISTS sec_log_severity ON security_log(severity);

ALTER TABLE security_log ENABLE ROW LEVEL SECURITY;
