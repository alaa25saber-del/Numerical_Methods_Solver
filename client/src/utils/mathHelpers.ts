import { compile, derivative } from "mathjs";

export function isSafeNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function validateDoubleValue(value: number, name: string): { valid: boolean; error?: string } {
  if (!isSafeNumber(value)) {
    return { valid: false, error: `${name} must be a finite number` };
  }
  return { valid: true };
}

export function createFunctionEvaluator(fStr: string) {
  const compiled = compile(fStr);
  return (x: number) => {
    try {
      const value = compiled.evaluate({ x });
      return isSafeNumber(value) ? value : NaN;
    } catch {
      return NaN;
    }
  };
}

export function createFunctionDerivative(fStr: string) {
  const derivativeExpression = derivative(fStr, "x");
  return (x: number) => {
    try {
      const value = derivativeExpression.evaluate({ x });
      return isSafeNumber(value) ? value : NaN;
    } catch {
      return NaN;
    }
  };
}

export function validateMatrix(A: number[][], maxSize = 10): { valid: boolean; error?: string } {
  if (!Array.isArray(A) || A.length === 0) {
    return { valid: false, error: "Matrix must be a non-empty square array." };
  }
  const n = A.length;
  if (n > maxSize) {
    return { valid: false, error: `Matrix exceeds maximum supported size of ${maxSize}.` };
  }
  for (let i = 0; i < n; i++) {
    if (!Array.isArray(A[i]) || A[i].length !== n) {
      return { valid: false, error: "Matrix must be square." };
    }
    for (let j = 0; j < n; j++) {
      if (!isSafeNumber(A[i][j])) {
        return { valid: false, error: `Matrix element A[${i}][${j}] must be a finite number.` };
      }
    }
  }
  return { valid: true };
}

export function validateVector(v: number[], expectedSize: number): { valid: boolean; error?: string } {
  if (!Array.isArray(v) || v.length !== expectedSize) {
    return { valid: false, error: `Vector must contain ${expectedSize} entries.` };
  }
  for (let i = 0; i < v.length; i++) {
    if (!isSafeNumber(v[i])) {
      return { valid: false, error: `Vector element b[${i}] must be a finite number.` };
    }
  }
  return { valid: true };
}

export function factorial(n: number): number {
  if (!Number.isInteger(n) || n < 0) {
    return NaN;
  }
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

export function isDiagonallyDominant(A: number[][]): boolean {
  if (!Array.isArray(A) || A.length === 0) {
    return false;
  }

  return A.every((row, i) => {
    const diagonal = Math.abs(row[i]);
    const offDiagonalSum = row.reduce(
      (sum, value, j) => (j === i ? sum : sum + Math.abs(value)),
      0
    );
    return diagonal >= offDiagonalSum;
  });
}
