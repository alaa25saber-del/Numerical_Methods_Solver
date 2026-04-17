import { InterpolationResult, InterpolationMethod, CalculationStep } from "@/types/interpolation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

interface StepsPanelProps {
  result: InterpolationResult;
  method: InterpolationMethod;
  data: {
    xValues: number[];
    yValues: number[];
    targetValue: number;
    numberOfPoints: number;
  };
}

export default function StepsPanel({
  result,
  method,
  data,
}: StepsPanelProps) {
  if (!result.steps || result.steps.length === 0) {
    return (
      <div className="text-center text-slate-500 py-8">
        No calculation steps available for this method.
      </div>
    );
  }

  const isInverse = method === "lagrangeInverse";

  return (
    <div className="space-y-3">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Calculation Process</h3>
        <p className="text-sm text-blue-700">
          {method === "forwardDifferenceTable" || method === "backwardDifferenceTable"
            ? "Building difference table to display data structure."
            : method === "newtonForward" || method === "newtonBackward"
            ? "Using Newton's divided differences formula with polynomial coefficients."
            : method === "stirling"
            ? "Using Stirling's central difference formula around closest point."
            : "Using Lagrange basis polynomials to construct interpolating function."}
        </p>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {result.steps.map((step: CalculationStep, index: number) => (
          <Collapsible key={index} defaultOpen={index < 3}>
            <CollapsibleTrigger className="w-full text-left p-3 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 flex items-center justify-between group">
              <div className="flex-1">
                <p className="font-medium text-slate-900">
                  Step {index + 1}: {step.description}
                </p>
                {step.value !== undefined && (
                  <p className="text-sm text-blue-600 mt-1">
                    Result: <strong>{typeof step.value === "number" ? step.value.toFixed(6) : step.value}</strong>
                  </p>
                )}
              </div>
              <ChevronDown className="w-4 h-4 text-slate-500 group-data-[state=open]:rotate-180 transition-transform" />
            </CollapsibleTrigger>

            <CollapsibleContent className="pt-2 pb-3 px-3 bg-white border border-t-0 border-slate-200 rounded-b">
              {step.formula && (
                <div className="mb-3 pb-3 border-b border-slate-200">
                  <p className="text-xs font-semibold text-slate-600 mb-2">Formula:</p>
                  <pre className="bg-slate-50 p-2 rounded text-xs overflow-x-auto text-slate-700">
                    {step.formula}
                  </pre>
                </div>
              )}

              {step.details && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-slate-600 mb-2">Details:</p>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">
                    {typeof step.details === "string"
                      ? step.details
                      : JSON.stringify(step.details, null, 2)}
                  </p>
                </div>
              )}

              {step.value !== undefined && (
                <div className="bg-blue-50 border border-blue-200 rounded p-2">
                  <p className="text-xs font-semibold text-blue-900">Value:</p>
                  <p className="text-sm font-mono text-blue-700">
                    {typeof step.value === "number" ? step.value.toFixed(10) : step.value}
                  </p>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>

      {result.steps.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
          <p className="text-sm text-green-900">
            <strong>Total Steps:</strong> {result.steps.length}
          </p>
          <p className="text-sm text-green-800 mt-2">
            Final {isInverse ? "x" : "y"} value at {isInverse ? "y" : "x"} = {data.targetValue}:
            <br />
            <strong className="text-lg text-green-700">{result.result.toFixed(6)}</strong>
          </p>
        </div>
      )}
    </div>
  );
}

