import type { ModelConfig, PLSResult, ReliabilityResult, ValidityResult } from './types';
import { correlation, getColumn } from './matrix';

export function computeValidity(
  data: number[][],
  config: ModelConfig,
  pls: PLSResult,
  reliability: ReliabilityResult,
): ValidityResult {
  const names = config.constructs.map(c => c.name);

  const fornellLarcker: Record<string, Record<string, number>> = {};
  names.forEach(ci => {
    fornellLarcker[ci] = {};
    names.forEach(cj => {
      if (ci === cj) {
        fornellLarcker[ci][cj] = Math.sqrt(reliability.ave[ci] || 0);
      } else {
        const scoresI = pls.latentScores[ci];
        const scoresJ = pls.latentScores[cj];
        fornellLarcker[ci][cj] = scoresI && scoresJ ? correlation(scoresI, scoresJ) : 0;
      }
    });
  });

  const htmt: Record<string, Record<string, number>> = {};
  names.forEach(ci => {
    htmt[ci] = {};
    names.forEach(cj => {
      if (ci === cj) {
        htmt[ci][cj] = 0;
        return;
      }

      const consI = config.constructs.find(c => c.name === ci)!;
      const consJ = config.constructs.find(c => c.name === cj)!;
      const colsI = consI.indicatorIndices.map(idx => getColumn(data, idx));
      const colsJ = consJ.indicatorIndices.map(idx => getColumn(data, idx));

      let heteroSum = 0, heteroCount = 0;
      for (const a of colsI) {
        for (const b of colsJ) {
          heteroSum += Math.abs(correlation(a, b));
          heteroCount++;
        }
      }
      const heteroMean = heteroCount > 0 ? heteroSum / heteroCount : 0;

      const monoI = monotraitMean(colsI);
      const monoJ = monotraitMean(colsJ);

      const denom = Math.sqrt(monoI * monoJ);
      htmt[ci][cj] = denom > 0 ? heteroMean / denom : 0;
    });
  });

  const crossLoadings: Record<string, Record<string, number>> = {};
  config.constructs.forEach(c => {
    c.indicatorIndices.forEach((idx, i) => {
      const col = getColumn(data, idx);
      const code = `${c.name}_${i}`;
      crossLoadings[code] = {};
      names.forEach(cName => {
        const scores = pls.latentScores[cName];
        crossLoadings[code][cName] = scores ? correlation(col, scores) : 0;
      });
    });
  });

  return { fornellLarcker, htmt, crossLoadings };
}

function monotraitMean(cols: number[][]): number {
  if (cols.length < 2) return 1;
  let sum = 0, count = 0;
  for (let i = 0; i < cols.length; i++) {
    for (let j = i + 1; j < cols.length; j++) {
      sum += Math.abs(correlation(cols[i], cols[j]));
      count++;
    }
  }
  return count > 0 ? sum / count : 1;
}
