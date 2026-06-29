-- AI Visibility tracking: stores each run and per-prompt results
CREATE TABLE IF NOT EXISTS ai_visibility_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  score integer NOT NULL,              -- 0-100
  mentions integer NOT NULL,
  total_prompts integer NOT NULL,
  platform text DEFAULT 'claude',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_visibility_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid REFERENCES ai_visibility_runs(id) ON DELETE CASCADE,
  prompt_id text NOT NULL,
  prompt text NOT NULL,
  category text,                        -- local | commercial | brand | branded
  response text,
  mentioned boolean DEFAULT false,
  preferred boolean DEFAULT false,      -- true if 2EZ TEK is actively recommended
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_vis_runs_created ON ai_visibility_runs(created_at DESC);
CREATE INDEX IF NOT EXISTS ai_vis_results_run ON ai_visibility_results(run_id);

ALTER TABLE ai_visibility_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_visibility_results ENABLE ROW LEVEL SECURITY;
