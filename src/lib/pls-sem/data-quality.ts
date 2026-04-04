import type { DataQualityResult } from './types';

export function assessDataQuality(
  data: number[][],
  numIndicators: number,
): DataQualityResult {
  const originalN = data.length;

  const cleaned = data.filter(row => {
    if (row.length < numIndicators) return false;
    let valid = 0;
    for (let i = 0; i < numIndicators; i++) {
      if (!isNaN(row[i]) && row[i] !== null && row[i] !== undefined) valid++;
    }
    return valid / numIndicators >= 0.8;
  });

  const filledData = cleaned.map(row => {
    const newRow = [...row];
    const colMeans: number[] = [];
    for (let i = 0; i < numIndicators; i++) {
      let sum = 0, count = 0;
      for (const r of cleaned) {
        if (!isNaN(r[i])) { sum += r[i]; count++; }
      }
      colMeans.push(count > 0 ? sum / count : 4);
    }
    for (let i = 0; i < numIndicators; i++) {
      if (isNaN(newRow[i]) || newRow[i] === null || newRow[i] === undefined) {
        newRow[i] = colMeans[i];
      }
    }
    return newRow;
  });

  return {
    originalN,
    cleanedN: filledData.length,
    removedRows: originalN - filledData.length,
    cleanedData: filledData,
    completionRate: originalN > 0 ? filledData.length / originalN : 0,
  };
}
