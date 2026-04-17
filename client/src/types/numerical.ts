export interface Step {
  iteration: number;
  data: Record<string, unknown>;
  explanation: string;
}

export interface MethodResult {
  result: number | number[];
  iterations: number;
  error: number;
  converged: boolean;
  steps: Step[];
  message: string;
}
