import type { ModelConfig, PLSResult, ReliabilityResult } from './types';
import { getColumn, std } from './matrix';

export function computeReliability(
  data: number[][],
  config: ModelConfig,
  pls: PLSResult,
): ReliabilityResult {
  const cronbachAlpha: Record<string, number> = {};
  const compositeReliability: Record<string, number> = {};
  const rhoA: Record<string, number> = {};
  const ave: Record<string, number> = {};

  config.constructs.forEach(c => {
    const k = c.indicatorIndices.length;
    const loadings = pls.outerLoadings[c.name] || [];

    if (k < 2) {
      cronbachAlpha[c.name] = 1;
      compositeReliability[c.name] = 1;
      rhoA[c.name] = 1;
      ave[c.name] = loadings.length > 0 ? loadings[0] ** 2 : 0;
      return;
    }

    const cols = c.indicatorIndices.map(idx => getColumn(data, idx));
    const itemVariances = cols.map(col => std(col) ** 2);
    const totalScores = data.map(row =>
      c.indicatorIndices.reduce((s, idx) => s + row[idx], 0)
    );
    const totalVar = std(totalScores) ** 2;
    const sumItemVar = itemVariances.reduce((s, v) => s + v, 0);
    const alpha = totalVar > 0 ? (k / (k - 1)) * (1 - sumItemVar / totalVar) : 0;
    cronbachAlpha[c.name] = Math.max(0, alpha);

    const sumL = loadings.reduce((s, l) => s + l, 0);
    const sumL2 = loadings.reduce((s, l) => s + l * l, 0);
    const sumError = loadings.reduce((s, l) => s + (1 - l * l), 0);
    const cr = sumL * sumL / (sumL * sumL + sumError);
    compositeReliability[c.name] = Math.max(0, cr);

    ave[c.name] = sumL2 / k;

    const weights = pls.outerWeights[c.name] || [];
    const sumW = weights.reduce((s, w) => s + w, 0);
    const sumW2 = weights.reduce((s, w) => s + w * w, 0);

    if (sumW2 > 0) {
      let sumCorr = 0;
      for (let i = 0; i < k; i++) {
        for (let j = 0; j < k; j++) {
          if (i !== j) {
            let sxy = 0;
            const mi = cols[i].reduce((a, b) => a + b, 0) / cols[i].length;
            const mj = cols[j].reduce((a, b) => a + b, 0) / cols[j].length;
            const si = std(cols[i]);
            const sj = std(cols[j]);
            if (si > 0 && sj > 0) {
              for (let r = 0; r < cols[i].length; r++) {
                sxy += (cols[i][r] - mi) * (cols[j][r] - mj);
              }
              sumCorr += weights[i] * weights[j] * sxy / (cols[i].length - 1);
            }
          }
        }
      }
      const wDiag = weights.reduce((s, w, i) => {
        const v = std(cols[i]) ** 2;
        return s + w * w * v;
      }, 0);

      const rhoAVal = (sumW * sumW / (sumW * sumW - sumW2)) *
        (1 - sumW2 * wDiag / (sumW * sumW * (totalVar > 0 ? totalVar / (data.length - 1) * (data.length - 1) / data.length : 1)  ));
      rhoA[c.name] = Math.max(0, Math.min(1, isNaN(rhoAVal) ? alpha : rhoAVal));
    } else {
      rhoA[c.name] = alpha;
    }
  });

  return { cronbachAlpha, compositeReliability, rhoA, ave };
}
