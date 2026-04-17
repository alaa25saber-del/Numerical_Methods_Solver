export type InterpolationMethod =
  | "forwardDifferenceTable"
  | "backwardDifferenceTable"
  | "newtonForward"
  | "newtonBackward"
  | "stirling"
  | "lagrange"
  | "lagrangeInverse";

export interface InterpolationData {
  xValues: number[];
  yValues: number[];
  targetValue: number;
  numberOfPoints: number;
}

export interface InterpolationResult {
  method: InterpolationMethod;
  result: number;
  isApproximate: boolean;
  forwardDifferences?: number[][];
  backwardDifferences?: number[][];
  centralDifferences?: number[][];
  centerIndex?: number;
  usedIndices: number[];
  steps: CalculationStep[];
  message: string;
}

export interface CalculationStep {
  description: string;
  value?: number | string;
  formula?: string;
  details?: string;
}

export interface ValidationError {
  type: "error" | "warning";
  message: string;
}
