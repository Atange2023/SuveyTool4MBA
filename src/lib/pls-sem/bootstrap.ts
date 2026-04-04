import type { ModelConfig, BootstrapResult, BootstrapPathStats } from './types';
import { runPLS } from './algorithm';

export function bootstrap(
  data: number[][],
  config: ModelConfig,
  nSamples = 500,
  seed = 42,
): BootstrapResult {
  const originalPLS = runPLS(data, config);
  const n = data.length;

  let rng = seed;
  const nextRand = () => {
    rng = (rng * 1103515245 + 12345) & 0x7fffffff;
    return rng / 0x7fffffff;
  };

  const pathSamples: Record<string, Record<string, number[]>> = {};
  const endogenous = [...new Set(config.paths.map(p => p.to))];
  endogenous.forEach(endo => {
    pathSamples[endo] = {};
    const preds = config.paths.filter(p => p.to === endo).map(p => p.from);
    preds.forEach(pred => {
      pathSamples[endo][pred] = [];
    });
  });

  const loadingSamples: Record<string, number[][]> = {};
  config.constructs.forEach(c => {
    loadingSamples[c.name] = c.indicatorIndices.map(() => []);
  });

  for (let b = 0; b < nSamples; b++) {
    const indices: number[] = [];
    for (let i = 0; i < n; i++) {
      indices.push(Math.floor(nextRand() * n));
    }
    const sample = indices.map(i => data[i]);

    try {
      const result = runPLS(sample, config, 100, 1e-5);

      endogenous.forEach(endo => {
        const preds = config.paths.filter(p => p.to === endo).map(p => p.from);
        preds.forEach(pred => {
          const coef = result.pathCoefficients[endo]?.[pred] ?? 0;
          pathSamples[endo][pred].push(coef);
        });
      });

      config.constructs.forEach(c => {
        const loadings = result.outerLoadings[c.name] || [];
        loadings.forEach((l, i) => {
          loadingSamples[c.name][i].push(l);
        });
      });
    } catch {
      // skip failed bootstrap samples
    }
  }

  const pathCoefficients: Record<string, Record<string, BootstrapPathStats>> = {};
  endogenous.forEach(endo => {
    pathCoefficients[endo] = {};
    const preds = config.paths.filter(p => p.to === endo).map(p => p.from);
    preds.forEach(pred => {
      const samples = pathSamples[endo][pred];
      const original = originalPLS.pathCoefficients[endo]?.[pred] ?? 0;
      pathCoefficients[endo][pred] = computeStats(original, samples);
    });
  });

  const outerLoadings: Record<string, BootstrapPathStats[]> = {};
  config.constructs.forEach(c => {
    const origLoadings = originalPLS.outerLoadings[c.name] || [];
    outerLoadings[c.name] = origLoadings.map((orig, i) => {
      return computeStats(orig, loadingSamples[c.name][i]);
    });
  });

  return { pathCoefficients, outerLoadings, nSamples };
}

function computeStats(original: number, samples: number[]): BootstrapPathStats {
  if (samples.length === 0) {
    return {
      original, mean: original, stdError: 0,
      tValue: 0, pValue: 1, ci95Low: original, ci95High: original,
      significant: false,
    };
  }

  const n = samples.length;
  const meanVal = samples.reduce((s, v) => s + v, 0) / n;
  const variance = samples.reduce((s, v) => s + (v - meanVal) ** 2, 0) / (n - 1);
  const stdError = Math.sqrt(variance);
  const tValue = stdError > 0 ? Math.abs(original / stdError) : 0;

  const df = n - 1;
  const pValue = tDistPValue(tValue, df);

  const sorted = [...samples].sort((a, b) => a - b);
  const lowIdx = Math.floor(0.025 * n);
  const highIdx = Math.min(Math.floor(0.975 * n), n - 1);

  return {
    original,
    mean: meanVal,
    stdError,
    tValue,
    pValue,
    ci95Low: sorted[lowIdx],
    ci95High: sorted[highIdx],
    significant: pValue < 0.05,
  };
}

function tDistPValue(t: number, df: number): number {
  const x = df / (df + t * t);
  const a = df / 2;
  const b = 0.5;
  const beta = incompleteBeta(x, a, b);
  return beta;
}

function incompleteBeta(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;

  const maxIter = 200;
  const eps = 1e-10;

  const lnBeta = lnGamma(a) + lnGamma(b) - lnGamma(a + b);
  const front = Math.exp(Math.log(x) * a + Math.log(1 - x) * b - lnBeta);

  let f = 1, c = 1, d = 0;
  for (let i = 0; i <= maxIter; i++) {
    let m = Math.floor(i / 2);
    let numerator: number;
    if (i === 0) {
      numerator = 1;
    } else if (i % 2 === 0) {
      numerator = (m * (b - m) * x) / ((a + 2 * m - 1) * (a + 2 * m));
    } else {
      numerator = -((a + m) * (a + b + m) * x) / ((a + 2 * m) * (a + 2 * m + 1));
    }

    d = 1 + numerator * d;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    d = 1 / d;
    c = 1 + numerator / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    const cd = c * d;
    f *= cd;
    if (Math.abs(cd - 1) < eps) break;
  }

  return front * (f - 1) / a;
}

function lnGamma(z: number): number {
  const g = 7;
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];

  if (z < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * z)) - lnGamma(1 - z);
  }

  z -= 1;
  let x = c[0];
  for (let i = 1; i < g + 2; i++) {
    x += c[i] / (z + i);
  }
  const t = z + g + 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}
