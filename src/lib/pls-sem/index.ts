import { runPLS } from './algorithm';
import { computeReliability } from './reliability';
import { computeValidity } from './validity';
import { bootstrap } from './bootstrap';
import { assessDataQuality } from './data-quality';
import { mean, std, skewness, kurtosis, getColumn } from './matrix';
import type { ModelConfig, FullAnalysisResult, DescriptiveStats } from './types';

export function runFullAnalysis(
  rawData: number[][],
  config: ModelConfig,
  nBoot = 500,
): FullAnalysisResult {
  const allIndices = config.constructs.flatMap(c => c.indicatorIndices);
  const numIndicators = Math.max(...allIndices) + 1;

  const dataQuality = assessDataQuality(rawData, numIndicators);
  const data = dataQuality.cleanedData;

  const descriptive = computeDescriptive(data, numIndicators);
  const pls = runPLS(data, config);
  const reliability = computeReliability(data, config, pls);
  const validity = computeValidity(data, config, pls, reliability);
  const bootstrapResult = bootstrap(data, config, nBoot);

  return { pls, reliability, validity, bootstrap: bootstrapResult, descriptive, dataQuality };
}

function computeDescriptive(data: number[][], numCols: number): DescriptiveStats {
  const n = data.length;
  const means: number[] = [];
  const stdDevs: number[] = [];
  const skewnessVals: number[] = [];
  const kurtosisVals: number[] = [];
  const missingCount: number[] = [];

  for (let col = 0; col < numCols; col++) {
    const colData = getColumn(data, col);
    const valid = colData.filter(v => !isNaN(v));
    means.push(mean(valid));
    stdDevs.push(std(valid));
    skewnessVals.push(skewness(valid));
    kurtosisVals.push(kurtosis(valid));
    missingCount.push(colData.length - valid.length);
  }

  return {
    means, stdDevs, skewness: skewnessVals, kurtosis: kurtosisVals,
    n, missingCount,
  };
}

export type { ModelConfig, FullAnalysisResult, BootstrapPathStats } from './types';
export { runPLS } from './algorithm';
export { bootstrap } from './bootstrap';
