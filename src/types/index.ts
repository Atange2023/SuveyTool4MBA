export interface Project {
  id: string;
  title: string;
  description: string;
  research_question: string;
  hypotheses: Hypothesis[];
  status: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Hypothesis {
  id: string;
  label: string;
  from: string;
  to: string;
  description: string;
}

export interface Construct {
  id: string;
  project_id: string;
  name: string;
  description: string;
  type: 'reflective' | 'formative';
  position_x: number;
  position_y: number;
  created_at: string;
}

export interface Indicator {
  id: string;
  construct_id: string;
  project_id: string;
  code: string;
  question_text: string;
  question_type: string;
  scale_points: number;
  options: unknown[];
  sort_order: number;
  is_reverse_coded: boolean;
  created_at: string;
}

export interface Survey {
  id: string;
  project_id: string;
  share_code: string;
  is_active: boolean;
  deadline: string | null;
  welcome_message: string;
  thank_you_message: string;
  max_responses: number;
  created_at: string;
}

export interface SurveyResponse {
  id: string;
  survey_id: string;
  respondent_token: string;
  answers: Record<string, number>;
  is_complete: boolean;
  started_at: string;
  completed_at: string | null;
}

export type WorkflowStep =
  | 'story'
  | 'overview'
  | 'research'
  | 'survey-design'
  | 'suggestions'
  | 'publish'
  | 'traffic-light'
  | 'analysis'
  | 'report';
