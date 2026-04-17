import { InterpolationResult, InterpolationMethod } from "@/types/interpolation";

interface ResultDisplayProps {
  result: InterpolationResult;
  method: InterpolationMethod;
  targetValue: number;
}

export default function ResultDisplay({
  result,
  method,
  targetValue,
}: ResultDisplayProps) {
  const methodNames: Record<InterpolationMethod, string> = {
    forwardDifferenceTable: "Forward Difference Table",
    backwardDifferenceTable: "Backward Difference Table",
    newtonForward: "Newton Forward Interpolation",
    newtonBackward: "Newton Backward Interpolation",
    stirling: "Stirling Interpolation",
    lagrange: "Lagrange Interpolation",
    lagrangeInverse: "Lagrange Inverse Interpolation",
  };

  const isInverse = method === "lagrangeInverse";
  const displayValue = result.result.toFixed(6);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-slate-600">Method</p>
          <p className="text-lg font-semibold text-slate-900">{methodNames[method]}</p>
        </div>
        <div>
          <p className="text-sm text-slate-600">{isInverse ? "Target y" : "Target x"}</p>
          <p className="text-lg font-semibold text-slate-900">{targetValue.toFixed(4)}</p>
        </div>
      </div>

      <div className="bg-white border-2 border-blue-300 rounded-lg p-4">
        <p className="text-sm text-slate-600 mb-2">Result</p>
        <p className="text-3xl font-bold text-blue-600">{displayValue}</p>
        <p className="text-xs text-slate-500 mt-2">
          Full precision: {result.result}
        </p>
      </div>

      {result.isApproximate && (
        <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded border border-slate-200">
          ✓ This is an <strong>approximate</strong> result using polynomial interpolation.
        </p>
      )}

      <p className="text-sm text-slate-700 italic">{result.message}</p>
    </div>
  );
}

