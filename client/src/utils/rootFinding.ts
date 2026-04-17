import { MethodResult, Step } from "@/types/numerical";
import {
  createFunctionDerivative,
  createFunctionEvaluator,
  isSafeNumber,
  validateDoubleValue,
} from "./mathHelpers";
import { validateRootFindingInputs } from "./validation";

function buildFunctionSafe(fStr: string): { error?: string; evaluate?: (x: number) => number } {
  try {
    return { evaluate: createFunctionEvaluator(fStr) };
  } catch (error) {
    return { error: `Function syntax error: ${(error as Error).message}` };
  }
}

function buildDerivativeSafe(fStr: string): { error?: string; evaluate?: (x: number) => number } {
  try {
    return { evaluate: createFunctionDerivative(fStr) };
  } catch (error) {
    return { error: `Derivative computation failed: ${(error as Error).message}` };
  }
}

function buildErrorResult(message: string): MethodResult {
  return {
    result: 0,
    iterations: 0,
    error: 0,
    converged: false,
    steps: [],
    message,
  };
}

export function bisectionMethod(
  fStr: string,
  a: number,
  b: number,
  tolerance: number,
  maxIterations: number
): MethodResult {
  const validation = validateRootFindingInputs(tolerance, maxIterations);
  if (validation.error) return buildErrorResult(validation.error);

  const functionResult = buildFunctionSafe(fStr);
  if (functionResult.error) return buildErrorResult(functionResult.error);
  const f = functionResult.evaluate!;

  const fa = f(a);
  const fb = f(b);

  if (!isSafeNumber(fa) || !isSafeNumber(fb)) {
    return buildErrorResult("Function evaluation failed at interval endpoints");
  }

  if (fa * fb > 0) {
    return buildErrorResult("f(a) and f(b) must have opposite signs");
  }

  const steps: Step[] = [];
  let left = a;
  let right = b;
  let c = left;
  let error = Math.abs(right - left);
  let iteration = 0;

  while (iteration < maxIterations && error > tolerance) {
    c = (left + right) / 2;
    const fc = f(c);
    const fl = f(left);
    const fr = f(right);

    if (!isSafeNumber(fc)) {
      return buildErrorResult("Function evaluation failed during bisection");
    }

    steps.push({
      iteration: iteration + 1,
      data: {
        a: left,
        b: right,
        c,
        "f(a)": fl,
        "f(b)": fr,
        "f(c)": fc,
        error,
      },
      explanation: `Midpoint c computed as (${left.toFixed(6)} + ${right.toFixed(6)}) / 2 = ${c.toFixed(6)}. Sign test uses f(a)·f(c) ${fl * fc < 0 ? "< 0" : "> 0"}.`,
    });

    if (fc === 0) {
      return {
        result: c,
        iterations: iteration + 1,
        error: 0,
        converged: true,
        steps,
        message: "Root found exactly",
      };
    }

    if (fl * fc < 0) {
      right = c;
    } else {
      left = c;
    }

    error = Math.abs(right - left);
    iteration++;
  }

  return {
    result: c,
    iterations: iteration,
    error,
    converged: error <= tolerance,
    steps,
    message: error <= tolerance ? "Converged successfully" : "Did not converge within maximum iterations",
  };
}

export function falsePositionMethod(
  fStr: string,
  a: number,
  b: number,
  tolerance: number,
  maxIterations: number
): MethodResult {
  const validation = validateRootFindingInputs(tolerance, maxIterations);
  if (validation.error) return buildErrorResult(validation.error);

  const functionResult = buildFunctionSafe(fStr);
  if (functionResult.error) return buildErrorResult(functionResult.error);

  const f = functionResult.evaluate!;
  const fa = f(a);
  const fb = f(b);

  if (!isSafeNumber(fa) || !isSafeNumber(fb)) {
    return buildErrorResult("Function evaluation failed at interval endpoints");
  }

  if (fa * fb > 0) {
    return buildErrorResult("f(a) and f(b) must have opposite signs");
  }

  const steps: Step[] = [];
  let left = a;
  let right = b;
  let c = left;
  let error = Math.abs(right - left);
  let iteration = 0;

  while (iteration < maxIterations && error > tolerance) {
    const fl = f(left);
    const fr = f(right);
    c = (left * fr - right * fl) / (fr - fl);
    const fc = f(c);

    if (!isSafeNumber(fc) || !isSafeNumber(fl) || !isSafeNumber(fr)) {
      return buildErrorResult("Function evaluation failed during false position iteration");
    }

    steps.push({
      iteration: iteration + 1,
      data: {
        a: left,
        b: right,
        c,
        "f(a)": fl,
        "f(b)": fr,
        "f(c)": fc,
        error,
      },
      explanation: `Secant-based root estimate c = (a·f(b) - b·f(a)) / (f(b) - f(a)) = ${c.toFixed(6)}; interval updated by sign of f(c).`,
    });

    if (fc === 0) {
      return {
        result: c,
        iterations: iteration + 1,
        error: 0,
        converged: true,
        steps,
        message: "Root found exactly",
      };
    }

    if (fl * fc < 0) {
      right = c;
    } else {
      left = c;
    }

    error = Math.abs(right - left);
    iteration++;
  }

  return {
    result: c,
    iterations: iteration,
    error,
    converged: error <= tolerance,
    steps,
    message: error <= tolerance ? "Converged successfully" : "Did not converge within maximum iterations",
  };
}

export function newtonRaphsonMethod(
  fStr: string,
  x0: number,
  tolerance: number,
  maxIterations: number
): MethodResult {
  const validation = validateRootFindingInputs(tolerance, maxIterations);
  if (validation.error) return buildErrorResult(validation.error);

  const functionResult = buildFunctionSafe(fStr);
  if (functionResult.error) return buildErrorResult(functionResult.error);

  const f = functionResult.evaluate!;
  const derivativeResult = buildDerivativeSafe(fStr);
  if (derivativeResult.error) return buildErrorResult(derivativeResult.error);

  const df = derivativeResult.evaluate!;

  const steps: Step[] = [];
  let x = x0;
  let iteration = 0;
  let error = tolerance + 1;

  while (iteration < maxIterations && error > tolerance) {
    const fx = f(x);
    const dfx = df(x);

    if (!isSafeNumber(fx) || !isSafeNumber(dfx)) {
      return buildErrorResult("Function or derivative evaluation produced invalid value");
    }

    if (Math.abs(dfx) < 1e-14) {
      return buildErrorResult("Derivative is too small or zero; cannot continue");
    }

    const next = x - fx / dfx;
    error = Math.abs(next - x);

    steps.push({
      iteration: iteration + 1,
      data: {
        x,
        "f(x)": fx,
        "f'(x)": dfx,
        "x_{next}": next,
        error,
      },
      explanation: `x_{next} = x - f(x)/f'(x) = ${x.toFixed(6)} - ${fx.toFixed(6)}/${dfx.toFixed(6)} = ${next.toFixed(6)}`,
    });

    x = next;
    iteration++;
  }

  return {
    result: x,
    iterations: iteration,
    error,
    converged: error <= tolerance,
    steps,
    message: error <= tolerance ? "Converged successfully" : "Did not converge within maximum iterations",
  };
}

export function secantMethod(
  fStr: string,
  x0: number,
  x1: number,
  tolerance: number,
  maxIterations: number
): MethodResult {
  const validation = validateRootFindingInputs(tolerance, maxIterations);
  if (validation.error) return buildErrorResult(validation.error);

  const functionResult = buildFunctionSafe(fStr);
  if (functionResult.error) return buildErrorResult(functionResult.error);

  const f = functionResult.evaluate!;
  let xPrev = x0;
  let xCurr = x1;
  let iteration = 0;
  let error = tolerance + 1;
  const steps: Step[] = [];

  while (iteration < maxIterations && error > tolerance) {
    const fPrev = f(xPrev);
    const fCurr = f(xCurr);

    if (!isSafeNumber(fPrev) || !isSafeNumber(fCurr)) {
      return buildErrorResult("Function evaluation failed during Secant iteration");
    }

    const denominator = fCurr - fPrev;
    if (Math.abs(denominator) < 1e-14) {
      return buildErrorResult("Denominator is too small; cannot continue");
    }

    const xNext = xCurr - (fCurr * (xCurr - xPrev)) / denominator;
    error = Math.abs(xNext - xCurr);

    if (!isSafeNumber(xNext)) {
      return buildErrorResult("Iteration produced invalid value");
    }

    steps.push({
      iteration: iteration + 1,
      data: {
        "x_{n-1}": xPrev,
        x_n: xCurr,
        "f(x_{n-1})": fPrev,
        "f(x_n)": fCurr,
        "x_{n+1}": xNext,
        error,
      },
      explanation: `x_{next} = x_n - f(x_n)(x_n - x_{n-1})/(f(x_n) - f(x_{n-1})) = ${xNext.toFixed(6)}`,
    });

    xPrev = xCurr;
    xCurr = xNext;
    iteration++;
  }

  return {
    result: xCurr,
    iterations: iteration,
    error,
    converged: error <= tolerance,
    steps,
    message: error <= tolerance ? "Converged successfully" : "Did not converge within maximum iterations",
  };
}
