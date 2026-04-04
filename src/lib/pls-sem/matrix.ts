export function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

export function std(arr: number[]): number {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  const variance = arr.reduce((s, v) => s + (v - m) ** 2, 0) / (arr.length - 1);
  return Math.sqrt(variance);
}

export function skewness(arr: number[]): number {
  const n = arr.length;
  if (n < 3) return 0;
  const m = mean(arr);
  const s = std(arr);
  if (s === 0) return 0;
  const sum = arr.reduce((acc, v) => acc + ((v - m) / s) ** 3, 0);
  return (n / ((n - 1) * (n - 2))) * sum;
}

export function kurtosis(arr: number[]): number {
  const n = arr.length;
  if (n < 4) return 0;
  const m = mean(arr);
  const s = std(arr);
  if (s === 0) return 0;
  const sum = arr.reduce((acc, v) => acc + ((v - m) / s) ** 4, 0);
  const k = ((n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3))) * sum;
  return k - (3 * (n - 1) ** 2) / ((n - 2) * (n - 3));
}

export function getColumn(data: number[][], col: number): number[] {
  return data.map(row => row[col]);
}

export function standardize(arr: number[]): number[] {
  const m = mean(arr);
  const s = std(arr);
  if (s === 0) return arr.map(() => 0);
  return arr.map(v => (v - m) / s);
}

export function correlation(a: number[], b: number[]): number {
  const n = a.length;
  if (n < 2) return 0;
  const ma = mean(a);
  const mb = mean(b);
  let num = 0, da = 0, db = 0;
  for (let i = 0; i < n; i++) {
    const diffA = a[i] - ma;
    const diffB = b[i] - mb;
    num += diffA * diffB;
    da += diffA * diffA;
    db += diffB * diffB;
  }
  const denom = Math.sqrt(da * db);
  return denom === 0 ? 0 : num / denom;
}

export function correlationMatrix(data: number[][], indices: number[]): number[][] {
  const n = indices.length;
  const cols = indices.map(i => getColumn(data, i));
  const mat: number[][] = [];
  for (let i = 0; i < n; i++) {
    mat[i] = [];
    for (let j = 0; j < n; j++) {
      mat[i][j] = i === j ? 1 : correlation(cols[i], cols[j]);
    }
  }
  return mat;
}

export function olsRegression(y: number[], X: number[][]): number[] {
  const n = y.length;
  const p = X.length;
  if (p === 0 || n === 0) return [];

  if (p === 1) {
    const x = X[0];
    const r = correlation(x, y);
    const sy = std(y);
    const sx = std(x);
    return sx === 0 ? [0] : [r * sy / sx];
  }

  const XtX: number[][] = [];
  const XtY: number[] = [];
  for (let i = 0; i < p; i++) {
    XtX[i] = [];
    for (let j = 0; j < p; j++) {
      let sum = 0;
      for (let k = 0; k < n; k++) sum += X[i][k] * X[j][k];
      XtX[i][j] = sum;
    }
    let sum = 0;
    for (let k = 0; k < n; k++) sum += X[i][k] * y[k];
    XtY[i] = sum;
  }

  return solveLinear(XtX, XtY);
}

function solveLinear(A: number[][], b: number[]): number[] {
  const n = A.length;
  const aug: number[][] = A.map((row, i) => [...row, b[i]]);

  for (let col = 0; col < n; col++) {
    let maxRow = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) maxRow = row;
    }
    [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];

    const pivot = aug[col][col];
    if (Math.abs(pivot) < 1e-12) continue;
    for (let j = col; j <= n; j++) aug[col][j] /= pivot;

    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = aug[row][col];
      for (let j = col; j <= n; j++) aug[row][j] -= factor * aug[col][j];
    }
  }

  return aug.map(row => row[n]);
}

export function weightedSum(data: number[][], indices: number[], weights: number[]): number[] {
  const n = data.length;
  const result: number[] = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < indices.length; j++) {
      result[i] += data[i][indices[j]] * weights[j];
    }
  }
  return result;
}
