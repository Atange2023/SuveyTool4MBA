/*
  # Create research project tables

  1. New Tables
    - `projects` - stores research project metadata
      - `id` (uuid, primary key)
      - `title` (text) - project title
      - `description` (text) - project description / background
      - `research_question` (text) - core research question
      - `status` (text) - project status (draft, active, completed)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `constructs` - latent variables in PLS-SEM model
      - `id` (uuid, primary key)
      - `project_id` (uuid, FK -> projects)
      - `name` (text) - construct name
      - `description` (text)
      - `type` (text) - reflective or formative
      - `sort_order` (int)
      - `created_at` (timestamptz)

    - `hypotheses` - research hypotheses linking constructs
      - `id` (uuid, primary key)
      - `project_id` (uuid, FK -> projects)
      - `label` (text) - e.g. H1, H2
      - `from_construct` (text) - source construct name
      - `to_construct` (text) - target construct name
      - `description` (text)
      - `sort_order` (int)
      - `created_at` (timestamptz)

    - `indicators` - measurement items for constructs
      - `id` (uuid, primary key)
      - `project_id` (uuid, FK -> projects)
      - `construct_name` (text) - linked construct name
      - `code` (text) - item code e.g. PEOU1
      - `question_text` (text)
      - `scale_points` (int) - Likert scale points (default 7)
      - `sort_order` (int)
      - `is_reverse_coded` (boolean)
      - `created_at` (timestamptz)

    - `surveys` - published survey configuration
      - `id` (uuid, primary key)
      - `project_id` (uuid, FK -> projects)
      - `share_code` (text, unique) - short sharing code
      - `is_active` (boolean)
      - `deadline` (timestamptz, nullable)
      - `welcome_message` (text)
      - `thank_you_message` (text)
      - `max_responses` (int)
      - `created_at` (timestamptz)

    - `survey_responses` - collected survey answers
      - `id` (uuid, primary key)
      - `survey_id` (uuid, FK -> surveys)
      - `respondent_token` (text)
      - `answers` (jsonb) - map of indicator_code -> score
      - `is_complete` (boolean)
      - `started_at` (timestamptz)
      - `completed_at` (timestamptz, nullable)

  2. Security
    - RLS enabled on all tables
    - No open policies yet (will be added when auth is implemented)
    - Tables are locked down by default after enabling RLS

  3. Notes
    - `indicators.construct_name` uses a string reference (not FK to constructs.id)
      to match the in-memory data model where indicators reference constructs by name
    - `hypotheses.from_construct` / `to_construct` similarly use string references
    - `surveys.share_code` uses random hex for unique short URLs
*/

-- Projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  research_question text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Constructs table
CREATE TABLE IF NOT EXISTS public.constructs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'reflective' CHECK (type IN ('reflective', 'formative')),
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.constructs ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_constructs_project_id ON public.constructs(project_id);

-- Hypotheses table
CREATE TABLE IF NOT EXISTS public.hypotheses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  label text NOT NULL,
  from_construct text NOT NULL,
  to_construct text NOT NULL,
  description text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.hypotheses ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_hypotheses_project_id ON public.hypotheses(project_id);

-- Indicators table
CREATE TABLE IF NOT EXISTS public.indicators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  construct_name text NOT NULL,
  code text NOT NULL,
  question_text text NOT NULL DEFAULT '',
  scale_points int NOT NULL DEFAULT 7,
  sort_order int NOT NULL DEFAULT 0,
  is_reverse_coded boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.indicators ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_indicators_project_id ON public.indicators(project_id);

-- Surveys table
CREATE TABLE IF NOT EXISTS public.surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  share_code text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(6), 'hex'),
  is_active boolean NOT NULL DEFAULT false,
  deadline timestamptz,
  welcome_message text NOT NULL DEFAULT '',
  thank_you_message text NOT NULL DEFAULT '',
  max_responses int NOT NULL DEFAULT 1000,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_surveys_project_id ON public.surveys(project_id);
CREATE INDEX IF NOT EXISTS idx_surveys_share_code ON public.surveys(share_code);

-- Survey responses table
CREATE TABLE IF NOT EXISTS public.survey_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id uuid NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  respondent_token text NOT NULL,
  answers jsonb NOT NULL DEFAULT '{}',
  is_complete boolean NOT NULL DEFAULT false,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_survey_responses_survey_id ON public.survey_responses(survey_id);