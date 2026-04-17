import { InterpolationData, InterpolationMethod, ValidationError } from "@/types/interpolation";
import { isEquallySpaced } from "./interpolation";

export function validateInterpolationInput(data: InterpolationData, method: InterpolationMethod): ValidationError[] {
  const errors: ValidationError[] = [];
  if (data.xValues.length !== data.yValues.length) {
    errors.push({ type: "error", message: "x and y arrays must have equal length." });
  }
  if (data.xValues.length < 2) {
    errors.push({ type: "error", message: "At least two data points are required." });
  }
  if (data.xValues.some(x => isNaN(x))) {
    errors.push({ type: "error", message: "All x values must be numeric." });
  }
  if (data.yValues.some(y => isNaN(y))) {
    errors.push({ type: "error", message: "All y values must be numeric." });
  }
  if (isNaN(data.targetValue)) {
    errors.push({ type: "error", message: "Target value must be numeric." });
  }
  const xSet = new Set(data.xValues);
  if (xSet.size !== data.xValues.length) {
    errors.push({ type: "error", message: "x values must be unique." });
  }
  if (["newtonForward", "newtonBackward", "stirling", "forwardDifferenceTable", "backwardDifferenceTable"].includes(method)) {
    if (!isEquallySpaced(data.xValues)) {
      errors.push({ type: "error", message: "This method requires equally spaced x values." });
    }
  }
  if (method === "stirling" && data.xValues.length < 3) {
    errors.push({ type: "error", message: "Stirling interpolation requires at least 3 points." });
  }
  return errors;
}

export function validateRootFindingInputs(tolerance: number, maxIterations: number): { error?: string } {
  if (!isFinite(tolerance) || tolerance <= 0) {
    return { error: "Tolerance must be a positive number" };
  }
  if (!Number.isInteger(maxIterations) || maxIterations < 1) {
    return { error: "Max iterations must be a positive integer" };
  }
  return {};
}

export function validateLinearSystemInputs(A: number[][], b: number[], x0?: number[], tolerance?: number, maxIterations?: number): { error?: string } {
  if (!Array.isArray(A) || A.length === 0) {
    return { error: "Matrix A must be a non-empty array" };
  }
  const n = A.length;
  if (n > 10) {
    return { error: "Matrix size exceeds maximum supported size of 10" };
  }
  for (let i = 0; i < n; i++) {
    if (!Array.isArray(A[i]) || A[i].length !== n) {
      return { error: "Matrix A must be square" };
    }
    for (let j = 0; j < n; j++) {
      if (!isFinite(A[i][j])) {
        return { error: `Matrix element A[${i}][${j}] must be a finite number` };
      }
    }
  }
  if (!Array.isArray(b) || b.length !== n) {
    return { error: `Vector b must have ${n} elements` };
  }
  for (let i = 0; i < n; i++) {
    if (!isFinite(b[i])) {
      return { error: `Vector element b[${i}] must be a finite number` };
    }
  }
  if (x0 && (!Array.isArray(x0) || x0.length !== n || x0.some(x => !isFinite(x)))) {
    return { error: "Initial vector x0 must be a valid numeric array of correct size" };
  }
  if (tolerance !== undefined && (!isFinite(tolerance) || tolerance <= 0)) {
    return { error: "Tolerance must be a positive number" };
  }
  if (maxIterations !== undefined && (!Number.isInteger(maxIterations) || maxIterations < 1)) {
    return { error: "Max iterations must be a positive integer" };
  }
  return {};
}