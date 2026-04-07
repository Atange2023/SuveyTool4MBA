export interface ExampleConstruct {
  name: string;
  description: string;
  type: 'reflective' | 'formative';
}

export interface ExampleIndicator {
  code: string;
  question_text: string;
  construct: string;
  scale_points: number;
}
