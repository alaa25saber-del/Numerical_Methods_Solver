import {
  InterpolationMethod,
  InterpolationData,
  InterpolationResult,
  CalculationStep,
  ValidationError,
} from "@/types/interpolation";
import { factorial } from "@/utils/mathHelpers";
import { validateInterpolationInput } from "@/utils/validation";

const DECIMAL_PLACES = 6;

export function isEquallySpaced(xValues: number[]): boolean {
  if (xValues.length < 2) return true;
  const h = xValues[1] - xValues[0];
  for (let i = 2; i < xValues.length; i++) {
    if (Math.abs((xValues[i] - xValues[i - 1]) - h) > 1e-10) {
      return false;
    }
  }
  return true;
}

export const validateInput = validateInterpolationInput;

export function generateForwardDifferences(yValues: number[]): number[][] {
  const differences: number[][] = [yValues.slice()];
  let currentRow = yValues.slice();
  while (currentRow.length > 1) {
    const nextRow: number[] = [];
    for (let i = 0; i < currentRow.length - 1; i++) {
      nextRow.push(currentRow[i + 1] - currentRow[i]);
    }
    differences.push(nextRow);
    currentRow = nextRow;
  }
  return differences;
}

export function generateBackwardDifferences(yValues: number[]): number[][] {
  const differences: number[][] = [yValues.slice()];
  let currentRow = yValues.slice();
  while (currentRow.length > 1) {
    const nextRow: number[] = [];
    for (let i = currentRow.length - 1; i > 0; i--) {
      nextRow.unshift(currentRow[i] - currentRow[i - 1]);
    }
    differences.push(nextRow);
    currentRow = nextRow;
  }
  return differences;
}

export function generateCentralDifferences(yValues: number[]): number[][] {
  return generateForwardDifferences(yValues);
}

export function calculateInterpolation(data: InterpolationData, method: InterpolationMethod): InterpolationResult {
  switch (method) {
    case "forwardDifferenceTable":
      return calculateForwardDifferenceTable(data);
    case "backwardDifferenceTable":
      return calculateBackwardDifferenceTable(data);
    case "newtonForward":
      return calculateNewtonForward(data);
    case "newtonBackward":
      return calculateNewtonBackward(data);
    case "stirling":
      return calculateStirling(data);
    case "lagrange":
      return calculateLagrange(data);
    case "lagrangeInverse":
      return calculateLagrangeInverse(data);
    default:
      return {
        method,
        result: 0,
        isApproximate: false,
        usedIndices: [],
        steps: [],
        message: "Unknown interpolation method.",
      };
  }
}

function calculateForwardDifferenceTable(data: InterpolationData): InterpolationResult {
  const forwardDifferences = generateForwardDifferences(data.yValues);
  return {
    method: "forwardDifferenceTable",
    result: 0,
    isApproximate: false,
    forwardDifferences,
    usedIndices: [],
    steps: [
      {
        description: "Forward difference table generated.",
        details: "Δy_i = y_{i+1} - y_i",
      },
    ],
    message: "Forward difference table generated successfully.",
  };
}

function calculateBackwardDifferenceTable(data: InterpolationData): InterpolationResult {
  const backwardDifferences = generateBackwardDifferences(data.yValues);
  return {
    method: "backwardDifferenceTable",
    result: 0,
    isApproximate: false,
    backwardDifferences,
    usedIndices: [],
    steps: [
      {
        description: "Backward difference table generated.",
        details: "∇y_i = y_i - y_{i-1}",
      },
    ],
    message: "Backward difference table generated successfully.",
  };
}

function calculateNewtonForward(data: InterpolationData): InterpolationResult {
  const { xValues, yValues, targetValue } = data;
  const h = xValues[1] - xValues[0];
  const x0 = xValues[0];
  const p = (targetValue - x0) / h;
  const forwardDifferences = generateForwardDifferences(yValues);
  const steps: CalculationStep[] = [
    { description: "Check equal spacing", value: `h = ${h.toFixed(DECIMAL_PLACES)}` },
    { description: "Compute parameter p", formula: `p = (x - x0)/h`, value: p.toFixed(DECIMAL_PLACES) },
  ];
  let result = yValues[0];
  let termFactor = 1;
  const usedIndices = [0];

  for (let order = 1; order < forwardDifferences.length; order++) {
    const diff = forwardDifferences[order][0];
    termFactor *= order === 1 ? p : p - (order - 1);
    const term = (termFactor * diff) / factorial(order);
    result += term;
    usedIndices.push(order);
    steps.push({
      description: `Term ${order}`,
      formula: `${order === 1 ? "p" : `p(p-1)...(p-${order - 1})`} / ${order}! × Δ^${order}y_0`,
      value: term.toFixed(DECIMAL_PLACES),
    });
  }

  steps.push({ description: "Final result", value: result.toFixed(DECIMAL_PLACES) });

  return {
    method: "newtonForward",
    result,
    isApproximate: true,
    forwardDifferences,
    usedIndices,
    steps,
    message: `f(${targetValue}) ≈ ${result.toFixed(DECIMAL_PLACES)}`,
  };
}

function calculateNewtonBackward(data: InterpolationData): InterpolationResult {
  const { xValues, yValues, targetValue } = data;
  const h = xValues[1] - xValues[0];
  const xn = xValues[xValues.length - 1];
  const p = (targetValue - xn) / h;
  const backwardDifferences = generateBackwardDifferences(yValues);
  const steps: CalculationStep[] = [
    { description: "Check equal spacing", value: `h = ${h.toFixed(DECIMAL_PLACES)}` },
    { description: "Compute parameter p", formula: `p = (x - x_n)/h`, value: p.toFixed(DECIMAL_PLACES) },
  ];
  let result = yValues[yValues.length - 1];
  let termFactor = 1;
  const usedIndices = [yValues.length - 1];

  for (let order = 1; order < backwardDifferences.length; order++) {
    const diff = backwardDifferences[order][backwardDifferences[order].length - 1];
    termFactor *= order === 1 ? p : p + (order - 1);
    const term = (termFactor * diff) / factorial(order);
    result += term;
    usedIndices.push(yValues.length - 1 - order);
    steps.push({
      description: `Term ${order}`,
      formula: `${order === 1 ? "p" : `p(p+1)...(p+${order - 1})`} / ${order}! × ∇^${order}y_n`,
      value: term.toFixed(DECIMAL_PLACES),
    });
  }

  steps.push({ description: "Final result", value: result.toFixed(DECIMAL_PLACES) });

  return {
    method: "newtonBackward",
    result,
    isApproximate: true,
    backwardDifferences,
    usedIndices,
    steps,
    message: `f(${targetValue}) ≈ ${result.toFixed(DECIMAL_PLACES)}`,
  };
}

function calculateStirling(data: InterpolationData): InterpolationResult {
  const { xValues, yValues, targetValue } = data;
  const h = xValues[1] - xValues[0];
  const centerIndex = Math.floor(xValues.length / 2);
  const x0 = xValues[centerIndex];
  const p = (targetValue - x0) / h;
  const centralDifferences = generateCentralDifferences(yValues);
  const steps: CalculationStep[] = [
    { description: "Check equal spacing", value: `h = ${h.toFixed(DECIMAL_PLACES)}` },
    { description: "Choose center point", formula: `x_0 = x[${centerIndex}]`, value: x0.toFixed(DECIMAL_PLACES) },
    { description: "Compute p", formula: `p = (x - x_0)/h`, value: p.toFixed(DECIMAL_PLACES) },
  ];

  let result = yValues[centerIndex];
  const usedIndices = [centerIndex];

  if (centralDifferences.length > 1 && centerIndex > 0) {
    const deltaForward = centralDifferences[1][centerIndex];
    const deltaBackward = centralDifferences[1][centerIndex - 1];
    const muDelta = (deltaForward + deltaBackward) / 2;
    const term = p * muDelta;
    result += term;
    usedIndices.push(centerIndex + 1, centerIndex - 1);
    steps.push({ description: "Term 1: p·μδy₀", value: term.toFixed(DECIMAL_PLACES) });
  }

  if (centralDifferences.length > 2) {
    const delta2y = centralDifferences[2][Math.max(0, centerIndex - 1)];
    const term = (p * p / 2) * delta2y;
    result += term;
    steps.push({ description: "Term 2: (p²/2!)·δ²y₀", value: term.toFixed(DECIMAL_PLACES) });
  }

  steps.push({ description: "Final result", value: result.toFixed(DECIMAL_PLACES) });

  return {
    method: "stirling",
    result,
    isApproximate: true,
    centralDifferences,
    centerIndex,
    usedIndices,
    steps,
    message: `f(${targetValue}) ≈ ${result.toFixed(DECIMAL_PLACES)}`,
  };
}

type Rational = { n: number; d: number };

function gcd(a: number, b: number): number {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 1;
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

function normalizeRational(value: Rational): Rational {
  if (value.d === 0) {
    return { n: 0, d: 1 };
  }
  const sign = value.d < 0 ? -1 : 1;
  const numerator = value.n * sign;
  const denominator = Math.abs(value.d);
  const divisor = gcd(numerator, denominator);
  return { n: numerator / divisor, d: denominator / divisor };
}

function rationalFromNumber(value: number): Rational {
  if (!Number.isFinite(value)) return { n: 0, d: 1 };
  if (Number.isInteger(value)) return { n: value, d: 1 };
  const text = value.toString();
  if (text.includes("e")) {
    const [mantissa, exponentText] = text.split("e");
    const exponent = parseInt(exponentText, 10);
    const decimalIndex = mantissa.indexOf(".");
    const digits = mantissa.replace('.', '');
    const scale = decimalIndex >= 0 ? digits.length - decimalIndex : 0;
    const numerator = Number(digits) * Math.pow(10, exponent - scale);
    const denominator = Math.pow(10, Math.max(0, scale));
    return normalizeRational({ n: numerator, d: denominator });
  }
  const decimals = text.includes(".") ? text.split(".")[1].length : 0;
  const denominator = Math.pow(10, decimals);
  const numerator = Math.round(value * denominator);
  return normalizeRational({ n: numerator, d: denominator });
}

function addRational(a: Rational, b: Rational): Rational {
  const numerator = a.n * b.d + b.n * a.d;
  const denominator = a.d * b.d;
  return normalizeRational({ n: numerator, d: denominator });
}

function multiplyRational(a: Rational, b: Rational): Rational {
  return normalizeRational({ n: a.n * b.n, d: a.d * b.d });
}

function divideRational(a: Rational, b: Rational): Rational {
  return normalizeRational({ n: a.n * b.d, d: a.d * b.n });
}

function polyAdd(a: Rational[], b: Rational[]): Rational[] {
  const length = Math.max(a.length, b.length);
  const result: Rational[] = [];
  for (let i = 0; i < length; i++) {
    const coeffA = a[i] || { n: 0, d: 1 };
    const coeffB = b[i] || { n: 0, d: 1 };
    result[i] = addRational(coeffA, coeffB);
  }
  return result;
}

function polyMultiply(a: Rational[], b: Rational[]): Rational[] {
  const result: Rational[] = Array(a.length + b.length - 1).fill({ n: 0, d: 1 });
  for (let i = 0; i < result.length; i++) {
    result[i] = { n: 0, d: 1 };
  }
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      const product = multiplyRational(a[i], b[j]);
      result[i + j] = addRational(result[i + j], product);
    }
  }
  return result;
}

function polyScale(poly: Rational[], scalar: Rational): Rational[] {
  return poly.map(coefficient => multiplyRational(coefficient, scalar));
}

function rationalToString(value: Rational): string {
  if (value.d === 1) return `${value.n}`;
  return `${value.n}/${value.d}`;
}

function formatValue(value: number): string {
  if (Number.isInteger(value)) return `${value}`;
  const formatted = value.toFixed(6).replace(/\.?(0+)$/, "");
  return formatted;
}

function formatSignedValue(value: number): string {
  if (value < 0) return `(${formatValue(value)})`;
  return formatValue(value);
}

function buildFactor(variable: string, value: number): string {
  return `(${variable} - ${formatSignedValue(value)})`;
}

function buildLagrangePolynomial(xValues: number[], yValues: number[]): string {
  const n = xValues.length;
  let polynomial: Rational[] = [{ n: 0, d: 1 }];
  for (let i = 0; i < n; i++) {
    let basis: Rational[] = [{ n: 1, d: 1 }];
    let denominator: Rational = { n: 1, d: 1 };
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      const factor: Rational[] = [rationalFromNumber(-xValues[j]), { n: 1, d: 1 }];
      basis = polyMultiply(basis, factor);
      denominator = multiplyRational(denominator, rationalFromNumber(xValues[i] - xValues[j]));
    }
    const coefficient = divideRational(rationalFromNumber(yValues[i]), denominator);
    const termPolynomial = polyScale(basis, coefficient);
    polynomial = polyAdd(polynomial, termPolynomial);
  }
  return stringifyPolynomial(polynomial);
}

function stringifyPolynomial(coefficients: Rational[]): string {
  const terms: string[] = [];
  for (let degree = coefficients.length - 1; degree >= 0; degree--) {
    const coeff = normalizeRational(coefficients[degree]);
    if (coeff.n === 0) continue;
    const absValue = { n: Math.abs(coeff.n), d: coeff.d };
    const absString = rationalToString(absValue);
    let term = "";
    if (degree === 0) {
      term = absString;
    } else if (degree === 1) {
      term = absString === "1" ? "x" : `${absString}x`;
    } else {
      term = absString === "1" ? `x^${degree}` : `${absString}x^${degree}`;
    }
    if (coeff.n < 0) {
      terms.push(terms.length === 0 ? `-${term}` : `- ${term}`);
    } else {
      terms.push(terms.length === 0 ? `${term}` : `+ ${term}`);
    }
  }
  return terms.length > 0 ? terms.join(" ") : "0";
}

function calculateLagrange(data: InterpolationData): InterpolationResult {
  const { xValues, yValues, targetValue } = data;
  const n = xValues.length;
  const steps: CalculationStep[] = [];
  const usedIndices: number[] = [];

  const knownValues = [
    `x_0 = ${formatValue(xValues[0])}`,
    ...xValues.slice(1).map((x, i) => `x_${i + 1} = ${formatValue(x)}`),
    `y_0 = ${formatValue(yValues[0])}`,
    ...yValues.slice(1).map((y, i) => `y_${i + 1} = ${formatValue(y)}`),
    `x = ${formatValue(targetValue)}`,
  ];

  steps.push({
    description: "List known values",
    details: knownValues.join(", "),
  });

  steps.push({
    description: "Write the general Lagrange formula",
    formula:
      "f(x) = Σ y_i · L_i(x)\nL_i(x) = Π [(x - x_j)/(x_i - x_j)] for j ≠ i",
  });

  const substitutionTerms: string[] = [];
  const termSteps: CalculationStep[] = [];
  let result = 0;

  for (let i = 0; i < n; i++) {
    const numeratorFactors: string[] = [];
    const denominatorFactors: string[] = [];
    let numeratorValue = 1;
    let denominatorValue = 1;

    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      const numeratorFactor = targetValue - xValues[j];
      const denominatorFactor = xValues[i] - xValues[j];
      numeratorFactors.push(buildFactor("x", xValues[j]));
      denominatorFactors.push(`(${formatValue(xValues[i])} - ${formatSignedValue(xValues[j])})`);
      numeratorValue *= numeratorFactor;
      denominatorValue *= denominatorFactor;
    }

    const basisValue = numeratorValue / denominatorValue;
    const termValue = yValues[i] * basisValue;
    result += termValue;
    usedIndices.push(i);

    const termFormula =
      `[( ${numeratorFactors.join("")}) ] / [( ${denominatorFactors.join("")}) ] * ${formatSignedValue(yValues[i])}`;
    substitutionTerms.push(termFormula);

    termSteps.push({
      description: `Simplify term for i = ${i}`,
      formula: termFormula,
      details:
        `Numerator = ${formatValue(numeratorValue)}, Denominator = ${formatValue(denominatorValue)}, L_${i}(x) = ${formatValue(basisValue)}, term = ${formatValue(termValue)}`,
      value: termValue,
    });
  }

  steps.push({
    description: "Substitute all terms into the formula",
    formula: `f(${formatValue(targetValue)}) =\n${substitutionTerms.join(" +\n")}`,
  });

  steps.push(...termSteps);

  const polynomialExpression = buildLagrangePolynomial(xValues, yValues);
  steps.push({
    description: "Construct the interpolating polynomial",
    formula: `f(x) = ${polynomialExpression}`,
    details: "The polynomial is produced by simplifying the sum of Lagrange basis terms.",
  });

  steps.push({
    description: "Final answer",
    details: `f(${formatValue(targetValue)}) = ${formatValue(result)}`,
    value: result,
  });

  return {
    method: "lagrange",
    result,
    isApproximate: !Number.isInteger(result),
    usedIndices,
    steps,
    message: `f(${formatValue(targetValue)}) = ${formatValue(result)}`,
  };
}

function calculateLagrangeInverse(data: InterpolationData): InterpolationResult {
  const { xValues, yValues, targetValue } = data;
  const n = xValues.length;
  const steps: CalculationStep[] = [];
  const usedIndices: number[] = [];

  const knownValues = [
    `x_0 = ${formatValue(xValues[0])}`,
    ...xValues.slice(1).map((x, i) => `x_${i + 1} = ${formatValue(x)}`),
    `y_0 = ${formatValue(yValues[0])}`,
    ...yValues.slice(1).map((y, i) => `y_${i + 1} = ${formatValue(y)}`),
    `y = ${formatValue(targetValue)}`,
  ];

  steps.push({
    description: "List known values",
    details: knownValues.join(", "),
  });

  steps.push({
    description: "Write the general inverse Lagrange formula",
    formula:
      "x = Σ x_i · L_i(y)\nL_i(y) = Π [(y - y_j)/(y_i - y_j)] for j ≠ i",
  });

  const substitutionTerms: string[] = [];
  const termSteps: CalculationStep[] = [];
  let result = 0;

  for (let i = 0; i < n; i++) {
    const numeratorFactors: string[] = [];
    const denominatorFactors: string[] = [];
    let numeratorValue = 1;
    let denominatorValue = 1;

    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      const numeratorFactor = targetValue - yValues[j];
      const denominatorFactor = yValues[i] - yValues[j];
      numeratorFactors.push(buildFactor("y", yValues[j]));
      denominatorFactors.push(`(${formatValue(yValues[i])} - ${formatSignedValue(yValues[j])})`);
      numeratorValue *= numeratorFactor;
      denominatorValue *= denominatorFactor;
    }

    const basisValue = numeratorValue / denominatorValue;
    const termValue = xValues[i] * basisValue;
    result += termValue;
    usedIndices.push(i);

    const termFormula =
      `[( ${numeratorFactors.join("")}) ] / [( ${denominatorFactors.join("")}) ] * ${formatSignedValue(xValues[i])}`;
    substitutionTerms.push(termFormula);

    termSteps.push({
      description: `Simplify term for i = ${i}`,
      formula: termFormula,
      details:
        `Numerator = ${formatValue(numeratorValue)}, Denominator = ${formatValue(denominatorValue)}, L_${i}(y) = ${formatValue(basisValue)}, term = ${formatValue(termValue)}`,
      value: termValue,
    });
  }

  steps.push({
    description: "Substitute all terms into the inverse formula",
    formula: `x =\n${substitutionTerms.join(" +\n")}`,
  });

  steps.push(...termSteps);

  steps.push({
    description: "Final answer",
    details: `x = ${formatValue(result)}`,
    value: result,
  });

  return {
    method: "lagrangeInverse",
    result,
    isApproximate: !Number.isInteger(result),
    usedIndices,
    steps,
    message: `x when y = ${formatValue(targetValue)} = ${formatValue(result)}`,
  };
}

export function generateExample(method: InterpolationMethod): InterpolationData {
  const examples: Record<InterpolationMethod, InterpolationData> = {
    newtonForward: {
      xValues: [0, 0.1, 0.2, 0.3, 0.4],
      yValues: [1, 1.3499, 1.8221, 2.4596, 3.3201],
      targetValue: 0.05,
      numberOfPoints: 5,
    },
    newtonBackward: {
      xValues: [40, 50, 60, 70, 80, 90],
      yValues: [204, 224, 246, 270, 296, 324],
      targetValue: 84,
      numberOfPoints: 6,
    },
    stirling: {
      xValues: [20, 25, 30, 35, 40],
      yValues: [48234, 47354, 46267, 44978, 43389],
      targetValue: 28,
      numberOfPoints: 5,
    },
    lagrange: {
      xValues: [5, 6, 9, 11],
      yValues: [380, -2, 196, 508],
      targetValue: 10,
      numberOfPoints: 4,
    },
    lagrangeInverse: {
      xValues: [1, 2, 5, 7],
      yValues: [1, 12, 117, 317],
      targetValue: 250,
      numberOfPoints: 4,
    },
    forwardDifferenceTable: {
      xValues: [0, 1, 2, 3, 4],
      yValues: [1, 7, 23, 55, 109],
      targetValue: 0,
      numberOfPoints: 5,
    },
    backwardDifferenceTable: {
      xValues: [21, 25, 29, 33, 37],
      yValues: [18.4708, 17.8144, 17.1070, 16.3432, 15.5154],
      targetValue: 30,
      numberOfPoints: 5,
    },
  };

  return examples[method];
}
