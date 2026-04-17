import { MethodResult, Step } from "@/types/numerical";
import { isSafeNumber, validateMatrix, validateVector, validateDoubleValue, isDiagonallyDominant } from "./mathHelpers";

function buildErrorResult(message: string): MethodResult {
  return {
    result: [],
    iterations: 0,
    error: 0,
    converged: false,
    steps: [],
    message,
  };
}

export function jacobiMethod(
  A: number[][],
  b: number[],
  x0: number[],
  tolerance: number,
  maxIterations: number
): MethodResult {
  const n = A.length;
  const mat = validateMatrix(A);
  if (!mat.valid) return buildErrorResult(mat.error!);
  const vecB = validateVector(b, n);
  if (!vecB.valid) return buildErrorResult(vecB.error!);
  const vecX0 = validateVector(x0, n);
  if (!vecX0.valid) return buildErrorResult(vecX0.error!);
  const tolVal = validateDoubleValue(tolerance, "Tolerance");
  if (!tolVal.valid) return buildErrorResult(tolVal.error!);
  const maxIterVal = validateDoubleValue(maxIterations, "Max iterations");
  if (!maxIterVal.valid) return buildErrorResult(maxIterVal.error!);
  if (tolerance <= 0) return buildErrorResult("Tolerance must be positive");
  if (maxIterations < 1) return buildErrorResult("Max iterations must be at least 1");

  if (!isDiagonallyDominant(A)) {
    return buildErrorResult("Matrix is not diagonally dominant; Jacobi may not converge.");
  }

  let x = [...x0];
  const steps: Step[] = [];
  let error = tolerance + 1;
  let iteration = 0;

  while (iteration < maxIterations && error > tolerance) {
    const xNext = new Array<number>(n).fill(0);
    let maxError = 0;

    for (let i = 0; i < n; i++) {
      let sum = 0;
      for (let j = 0; j < n; j++) {
        if (i !== j) sum += A[i][j] * x[j];
      }
      if (Math.abs(A[i][i]) < 1e-14) {
        return buildErrorResult("Diagonal element is zero or too small; cannot divide.");
      }
      xNext[i] = (b[i] - sum) / A[i][i];
      if (!isSafeNumber(xNext[i])) return buildErrorResult("Invalid number computed during iteration.");
      maxError = Math.max(maxError, Math.abs(xNext[i] - x[i]));
    }

    const stepData: Record<string, unknown> = { iteration: iteration + 1, error: maxError };
    xNext.forEach((value, index) => {
      stepData[`x${index + 1}`] = value;
    });

    steps.push({
      iteration: iteration + 1,
      data: stepData,
      explanation: `Iteration ${iteration + 1} updated x to [${xNext.map(v => v.toFixed(6)).join(", ")}], error = ${maxError.toFixed(6)}.`,
    });

    x = xNext;
    error = maxError;
    iteration++;
  }

  return {
    result: x,
    iterations: iteration,
    error,
    converged: error <= tolerance,
    steps,
    message: error <= tolerance ? "Jacobi iteration converged." : "Jacobi iteration did not converge in the given iterations.",
  };
}

export function gaussSeidelMethod(
  A: number[][],
  b: number[],
  x0: number[],
  tolerance: number,
  maxIterations: number
): MethodResult {
  const n = A.length;
  const mat = validateMatrix(A);
  if (!mat.valid) return buildErrorResult(mat.error!);
  const vecB = validateVector(b, n);
  if (!vecB.valid) return buildErrorResult(vecB.error!);
  const vecX0 = validateVector(x0, n);
  if (!vecX0.valid) return buildErrorResult(vecX0.error!);
  const tolVal = validateDoubleValue(tolerance, "Tolerance");
  if (!tolVal.valid) return buildErrorResult(tolVal.error!);
  const maxIterVal = validateDoubleValue(maxIterations, "Max iterations");
  if (!maxIterVal.valid) return buildErrorResult(maxIterVal.error!);
  if (tolerance <= 0) return buildErrorResult("Tolerance must be positive");
  if (maxIterations < 1) return buildErrorResult("Max iterations must be at least 1");

  if (!isDiagonallyDominant(A)) {
    return buildErrorResult("Matrix is not diagonally dominant; Gauss-Seidel may not converge.");
  }

  const x = [...x0];
  const steps: Step[] = [];
  let error = tolerance + 1;
  let iteration = 0;

  while (iteration < maxIterations && error > tolerance) {
    let maxError = 0;
    const xOld = [...x];

    for (let i = 0; i < n; i++) {
      let sum = 0;
      for (let j = 0; j < n; j++) {
        if (i !== j) sum += A[i][j] * x[j];
      }
      if (Math.abs(A[i][i]) < 1e-14) {
        return buildErrorResult("Diagonal element is zero or too small; cannot divide.");
      }
      x[i] = (b[i] - sum) / A[i][i];
      if (!isSafeNumber(x[i])) return buildErrorResult("Invalid number computed during iteration.");
      maxError = Math.max(maxError, Math.abs(x[i] - xOld[i]));
    }

    const stepData: Record<string, unknown> = { iteration: iteration + 1, error: maxError };
    x.forEach((value, index) => {
      stepData[`x${index + 1}`] = value;
    });

    steps.push({
      iteration: iteration + 1,
      data: stepData,
      explanation: `Iteration ${iteration + 1} updated x sequentially to [${x.map(v => v.toFixed(6)).join(", ")}], error = ${maxError.toFixed(6)}.`,
    });

    error = maxError;
    iteration++;
  }

  return {
    result: x,
    iterations: iteration,
    error,
    converged: error <= tolerance,
    steps,
    message: error <= tolerance ? "Gauss-Seidel iteration converged." : "Gauss-Seidel iteration did not converge in the given iterations.",
  };
}

export function dolittleMethod(A: number[][], b: number[]): MethodResult {
  const n = A.length;
  const mat = validateMatrix(A);
  if (!mat.valid) return buildErrorResult(mat.error!);
  const vecB = validateVector(b, n);
  if (!vecB.valid) return buildErrorResult(vecB.error!);

  const L = Array.from({ length: n }, () => Array<number>(n).fill(0));
  const U = Array.from({ length: n }, () => Array<number>(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let k = i; k < n; k++) {
      let sum = 0;
      for (let j = 0; j < i; j++) sum += L[i][j] * U[j][k];
      U[i][k] = A[i][k] - sum;
    }

    for (let k = i; k < n; k++) {
      if (i === k) {
        L[i][i] = 1;
      } else {
        let sum = 0;
        for (let j = 0; j < i; j++) sum += L[k][j] * U[j][i];
        if (Math.abs(U[i][i]) < 1e-14) {
          return buildErrorResult("Matrix is singular or nearly singular; LU decomposition failed.");
        }
        L[k][i] = (A[k][i] - sum) / U[i][i];
      }
    }
  }

  const y = Array<number>(n).fill(0);
  for (let i = 0; i < n; i++) {
    let sum = 0;
    for (let j = 0; j < i; j++) sum += L[i][j] * y[j];
    y[i] = b[i] - sum;
    if (!isSafeNumber(y[i])) {
      return buildErrorResult("Forward substitution produced invalid value.");
    }
  }

  const x = Array<number>(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let sum = 0;
    for (let j = i + 1; j < n; j++) sum += U[i][j] * x[j];
    if (Math.abs(U[i][i]) < 1e-14) {
      return buildErrorResult("Singular matrix during back substitution.");
    }
    x[i] = (y[i] - sum) / U[i][i];
    if (!isSafeNumber(x[i])) {
      return buildErrorResult("Backward substitution produced invalid value.");
    }
  }

  return {
    result: x,
    iterations: 1,
    error: 0,
    converged: true,
    steps: [
      {
        iteration: 1,
        data: { L, U, y, x },
        explanation: "Dolittle decomposition completed; solved Ly=b and Ux=y.",
      },
    ],
    message: "Solved using Dolittle LU decomposition.",
  };
}

export function thomasMethod(A: number[][], b: number[]): MethodResult {
  const n = A.length;
  const mat = validateMatrix(A);
  if (!mat.valid) return buildErrorResult(mat.error!);
  const vecB = validateVector(b, n);
  if (!vecB.valid) return buildErrorResult(vecB.error!);

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (Math.abs(i - j) > 1 && Math.abs(A[i][j]) > 1e-12) {
        return buildErrorResult("Thomas method requires a strictly tridiagonal matrix.");
      }
    }
  }

  const a = Array<number>(n).fill(0);
  const bDiag = Array<number>(n).fill(0);
  const c = Array<number>(n).fill(0);

  for (let i = 0; i < n; i++) {
    bDiag[i] = A[i][i];
    if (i > 0) a[i] = A[i][i - 1];
    if (i < n - 1) c[i] = A[i][i + 1];
  }

  const cPrime = Array<number>(n).fill(0);
  const dPrime = Array<number>(n).fill(0);

  if (Math.abs(bDiag[0]) < 1e-14) {
    return buildErrorResult("First diagonal element is zero; Thomas algorithm failed.");
  }

  cPrime[0] = c[0] / bDiag[0];
  dPrime[0] = b[0] / bDiag[0];

  for (let i = 1; i < n; i++) {
    const denominator = bDiag[i] - a[i] * cPrime[i - 1];
    if (Math.abs(denominator) < 1e-14) {
      return buildErrorResult("Singular matrix encountered during Thomas forward elimination.");
    }
    cPrime[i] = i < n - 1 ? c[i] / denominator : 0;
    dPrime[i] = (b[i] - a[i] * dPrime[i - 1]) / denominator;
    if (!isSafeNumber(cPrime[i]) || !isSafeNumber(dPrime[i])) {
      return buildErrorResult("Invalid value during Thomas elimination.");
    }
  }

  const x = Array<number>(n).fill(0);
  x[n - 1] = dPrime[n - 1];
  for (let i = n - 2; i >= 0; i--) {
    x[i] = dPrime[i] - cPrime[i] * x[i + 1];
    if (!isSafeNumber(x[i])) {
      return buildErrorResult("Invalid value during Thomas back substitution.");
    }
  }

  return {
    result: x,
    iterations: 1,
    error: 0,
    converged: true,
    steps: [
      {
        iteration: 1,
        data: { cPrime, dPrime, x },
        explanation: "Thomas algorithm completed with forward elimination and backward substitution.",
      },
    ],
    message: "Solved using Thomas algorithm.",
  };
}
