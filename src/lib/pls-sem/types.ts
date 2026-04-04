export interface ConstructConfig {
  name: string;
  type: 'reflective' | 'formative';
  indicatorIndices: number[];
}

export interface PathConfig {
  from: string;
  to: string;
}

export interface ModelConfig {
  constructs: ConstructConfig[];
  paths: PathConfig[];
}

export interface PLSResult {
  outerLoadings: Record<string, number[]>;
  outerWeights: Record<string, number[]>;
  pathCoefficients: Record<string, Record<string, number>>;
  rSquared: Record<string, number>;
  fSquared: Record<string, Record<string, number>>;
  latentScores: Record<string, number[]>;
  iterations: number;
}

export interface ReliabilityResult {
  cronbachAlpha: Record<string, number>;
  compositeReliability: Record<string, number>;
  rhoA: Record<string, number>;
  ave: Record<string, number>;
}

export interface ValidityResult {
  fornellLarcker: Record<string, Record<string, number>>;
  htmt: Record<string, Record<string, number>>;
  crossLoadings: Record<string, Record<string, number>>;
}

export interface BootstrapPathStats {
  original: number;
  mean: number;
  stdError: number;
  tValue: number;
  pValue: number;
  ci95Low: number;
  ci95High: number;
  significant: boolean;
}

export interface BootstrapResult {
  pathCoefficients: Record<string, Record<string, BootstrapPathStats>>;
  outerLoadings: Record<string, BootstrapPathStats[]>;
  nSamples: number;
}

export interface DescriptiveStats {
  means: number[];
  stdDevs: number[];
  skewness: number[];
  kurtosis: number[];
  n: number;
  missingCount: number[];
}

export interface DataQualityResult {
  originalN: number;
  cleanedN: number;
  removedRows: number;
  cleanedData: number[][];
  completionRate: number;
}

export interface FullAnalysisResult {
  pls: PLSResult;
  reliability: ReliabilityResult;
  validity: ValidityResult;
  bootstrap: BootstrapResult;
  descriptive: DescriptiveStats;
  dataQuality: DataQualityResult;
}
