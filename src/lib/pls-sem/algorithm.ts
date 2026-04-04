import type { ModelConfig, PLSResult } from './types';
import { standardize, correlation, getColumn, weightedSum, olsRegression, mean, std } from './matrix';

export function runPLS(data: number[][], config: ModelConfig, maxIter = 300, tolerance = 1e-7): PLSResult {
  const n = data.length;
  const { constructs, paths } = config;

  const stdData: number[][] = [];
  const allIndices = new Set<number>();
  constructs.forEach(c => c.indicatorIndices.forEach(i => allIndices.add(i)));
  const maxIdx = Math.max(...allIndices) + 1;

  const colStd: number[][] = data.map(row => {
    const out = [...row];
    return out;
  });
  const colMeans: number[] = [];
  const colSds: number[] = [];
  for (let j = 0; j < maxIdx; j++) {
    const col = getColumn(data, j);
    colMeans.push(mean(col));
    colSds.push(std(col));
  }
  for (let i = 0; i < n; i++) {
    const row: number[] = [];
    for (let j = 0; j < maxIdx; j++) {
      row.push(colSds[j] === 0 ? 0 : (data[i][j] - colMeans[j]) / colSds[j]);
    }
    stdData.push(row);
  }

  const neighbors: Record<string, string[]> = {};
  constructs.forEach(c => { neighbors[c.name] = []; });
  paths.forEach(p => {
    if (!neighbors[p.from].includes(p.to)) neighbors[p.from].push(p.to);
    if (!neighbors[p.to].includes(p.from)) neighbors[p.to].push(p.from);
  });

  const weights: Record<string, number[]> = {};
  constructs.forEach(c => {
    weights[c.name] = c.indicatorIndices.map(() => 1 / c.indicatorIndices.length);
  });

  let scores: Record<string, number[]> = {};
  constructs.forEach(c => {
    scores[c.name] = standardize(weightedSum(stdData, c.indicatorIndices, weights[c.name]));
  });

  let iterations = 0;
  for (let iter = 0; iter < maxIter; iter++) {
    iterations = iter + 1;
    const oldWeights = JSON.parse(JSON.stringify(weights));

    const innerWeights: Record<string, Record<string, number>> = {};
    constructs.forEach(c => {
      innerWeights[c.name] = {};
      const nbrs = neighbors[c.name];
      if (nbrs.length === 0) return;

      const endogenous = paths.some(p => p.to === c.name);
      if (endogenous) {
        const predecessors = paths.filter(p => p.to === c.name).map(p => p.from);
        const successors = paths.filter(p => p.from === c.name).map(p => p.to);
        const predScores = predecessors.map(name => scores[name]);
        if (predScores.length > 0) {
          const betas = olsRegression(scores[c.name], predScores);
          predecessors.forEach((name, i) => {
            innerWeights[c.name][name] = betas[i];
          });
        }
        successors.forEach(name => {
          innerWeights[c.name][name] = correlation(scores[c.name], scores[name]);
        });
      } else {
        nbrs.forEach(name => {
          innerWeights[c.name][name] = correlation(scores[c.name], scores[name]);
        });
      }
    });

    const innerScores: Record<string, number[]> = {};
    constructs.forEach(c => {
      const nbrs = neighbors[c.name];
      if (nbrs.length === 0) {
        innerScores[c.name] = scores[c.name];
        return;
      }
      const result = new Array(n).fill(0);
      nbrs.forEach(name => {
        const w = innerWeights[c.name][name] || 0;
        for (let i = 0; i < n; i++) result[i] += w * scores[name][i];
      });
      innerScores[c.name] = standardize(result);
    });

    constructs.forEach(c => {
      if (c.type === 'reflective') {
        weights[c.name] = c.indicatorIndices.map(idx => {
          const col = getColumn(stdData, idx);
          return correlation(col, innerScores[c.name]);
        });
      } else {
        const X = c.indicatorIndices.map(idx => getColumn(stdData, idx));
        weights[c.name] = olsRegression(innerScores[c.name], X);
      }
    });

    constructs.forEach(c => {
      scores[c.name] = standardize(weightedSum(stdData, c.indicatorIndices, weights[c.name]));
    });

    let maxDelta = 0;
    constructs.forEach(c => {
      for (let j = 0; j < weights[c.name].length; j++) {
        maxDelta = Math.max(maxDelta, Math.abs(weights[c.name][j] - oldWeights[c.name][j]));
      }
    });

    if (maxDelta < tolerance) break;
  }

  const outerLoadings: Record<string, number[]> = {};
  const outerWeights: Record<string, number[]> = {};
  constructs.forEach(c => {
    outerWeights[c.name] = weights[c.name];
    outerLoadings[c.name] = c.indicatorIndices.map(idx => {
      const col = getColumn(stdData, idx);
      return correlation(col, scores[c.name]);
    });
  });

  const pathCoefficients: Record<string, Record<string, number>> = {};
  const rSquared: Record<string, number> = {};
  const fSquared: Record<string, Record<string, number>> = {};

  const endogenous = [...new Set(paths.map(p => p.to))];
  endogenous.forEach(endo => {
    const preds = paths.filter(p => p.to === endo).map(p => p.from);
    const predScores = preds.map(name => scores[name]);
    const betas = olsRegression(scores[endo], predScores);

    pathCoefficients[endo] = {};
    preds.forEach((name, i) => {
      pathCoefficients[endo][name] = betas[i];
    });

    const yHat = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      preds.forEach((name, j) => {
        yHat[i] += betas[j] * scores[name][i];
      });
    }
    const ssRes = scores[endo].reduce((s, v, i) => s + (v - yHat[i]) ** 2, 0);
    const ssTot = scores[endo].reduce((s, v) => s + v ** 2, 0);
    const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot;
    rSquared[endo] = r2;

    fSquared[endo] = {};
    preds.forEach(exclName => {
      const remainPreds = preds.filter(p => p !== exclName);
      if (remainPreds.length === 0) {
        fSquared[endo][exclName] = r2 / (1 - r2 + 1e-10);
        return;
      }
      const remScores = remainPreds.map(name => scores[name]);
      const remBetas = olsRegression(scores[endo], remScores);
      const yHatExcl = new Array(n).fill(0);
      for (let i = 0; i < n; i++) {
        remainPreds.forEach((name, j) => {
          yHatExcl[i] += remBetas[j] * scores[name][i];
        });
      }
      const ssResExcl = scores[endo].reduce((s, v, i) => s + (v - yHatExcl[i]) ** 2, 0);
      const r2Excl = ssTot === 0 ? 0 : 1 - ssResExcl / ssTot;
      fSquared[endo][exclName] = (r2 - r2Excl) / (1 - r2 + 1e-10);
    });
  });

  return {
    outerLoadings,
    outerWeights,
    pathCoefficients,
    rSquared,
    fSquared,
    latentScores: scores,
    iterations,
  };
}
