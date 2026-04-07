import { mean, std, getColumn, correlation } from './pls-sem/matrix';
import type { ModelConfig } from './pls-sem/types';

export const ALPHA_THRESHOLD = 0.7;
export const AVE_THRESHOLD = 0.5;

export interface ConstructHealthResult {
  name: string;
  cronbachAlpha: number;
  ave: number;
  alphaPass: boolean;
  avePass: boolean;
  itemTotalCorrelations: { indicatorIndex: number; code: string; correlation: number }[];
  weakestItem: { indicatorIndex: number; code: string; correlation: number } | null;
}

export function computeCronbachAlpha(data: number[][], colIndices: number[]): number {
  const k = colIndices.length;
  if (k < 2) return 1;

  const cols = colIndices.map(idx => getColumn(data, idx));
  const itemVariances = cols.map(col => {
    const s = std(col);
    return s * s;
  });

  const totalScores = data.map(row =>
    colIndices.reduce((s, idx) => s + row[idx], 0)
  );
  const totalVar = std(totalScores) ** 2;

  if (totalVar === 0) return 0;

  const sumItemVar = itemVariances.reduce((s, v) => s + v, 0);
  const alpha = (k / (k - 1)) * (1 - sumItemVar / totalVar);
  return Math.max(0, alpha);
}

export function computeSimpleAVE(data: number[][], colIndices: number[]): number {
  const k = colIndices.length;
  if (k < 2) return 1;

  const cols = colIndices.map(idx => getColumn(data, idx));
  const totalScores = data.map(row =>
    colIndices.reduce((s, idx) => s + row[idx], 0)
  );

  let sumSquaredLoadings = 0;
  for (const col of cols) {
    const r = correlation(col, totalScores);
    sumSquaredLoadings += r * r;
  }

  return sumSquaredLoadings / k;
}

export function computeItemTotalCorrelations(
  data: number[][],
  colIndices: number[],
  codes: string[],
): { indicatorIndex: number; code: string; correlation: number }[] {
  const results: { indicatorIndex: number; code: string; correlation: number }[] = [];

  for (let i = 0; i < colIndices.length; i++) {
    const remaining = colIndices.filter((_, j) => j !== i);
    if (remaining.length === 0) {
      results.push({ indicatorIndex: colIndices[i], code: codes[i], correlation: 0 });
      continue;
    }

    const restTotal = data.map(row =>
      remaining.reduce((s, idx) => s + row[idx], 0)
    );
    const itemCol = getColumn(data, colIndices[i]);
    const r = correlation(itemCol, restTotal);

    results.push({
      indicatorIndex: colIndices[i],
      code: codes[i],
      correlation: isNaN(r) ? 0 : r,
    });
  }

  return results;
}

export function assessConstructHealth(
  data: number[][],
  config: ModelConfig,
  indicatorCodes: string[],
): ConstructHealthResult[] {
  const results: ConstructHealthResult[] = [];

  for (const c of config.constructs) {
    const alpha = computeCronbachAlpha(data, c.indicatorIndices);
    const ave = computeSimpleAVE(data, c.indicatorIndices);

    const codes = c.indicatorIndices.map(idx => indicatorCodes[idx] || `Q${idx + 1}`);
    const itemTotalCorrelations = computeItemTotalCorrelations(data, c.indicatorIndices, codes);

    const weakestItem = itemTotalCorrelations.length > 0
      ? itemTotalCorrelations.reduce((min, item) => item.correlation < min.correlation ? item : min)
      : null;

    results.push({
      name: c.name,
      cronbachAlpha: alpha,
      ave,
      alphaPass: alpha >= ALPHA_THRESHOLD,
      avePass: ave >= AVE_THRESHOLD,
      itemTotalCorrelations,
      weakestItem,
    });
  }

  return results;
}

export function parseCSV(text: string): { headers: string[]; data: number[][] } {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return { headers: [], data: [] };

  const separator = lines[0].includes('\t') ? '\t' : ',';
  const headers = lines[0].split(separator).map(h => h.trim().replace(/^["']|["']$/g, ''));

  const data: number[][] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cells = line.split(separator).map(c => {
      const cleaned = c.trim().replace(/^["']|["']$/g, '');
      const num = parseFloat(cleaned);
      return isNaN(num) ? NaN : num;
    });
    if (cells.length === headers.length) {
      data.push(cells);
    }
  }

  return { headers, data };
}
