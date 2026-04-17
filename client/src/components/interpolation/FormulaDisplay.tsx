import { InterpolationMethod } from "@/types/interpolation";

interface FormulaDisplayProps {
  method: InterpolationMethod;
}

export default function FormulaDisplay({ method }: FormulaDisplayProps) {
  const formulas: Record<InterpolationMethod, { title: string; formula: string }> = {
    forwardDifferenceTable: {
      title: "Forward Difference Table",
      formula: "Δy₀ = y₁ - y₀, Δ²y₀ = Δy₁ - Δy₀, ...",
    },
    backwardDifferenceTable: {
      title: "Backward Difference Table",
      formula: "∇yₙ = yₙ - yₙ₋₁, ∇²yₙ = ∇yₙ - ∇yₙ₋₁, ...",
    },
    newtonForward: {
      title: "Newton Forward Interpolation",
      formula: "f(x) = y₀ + pΔy₀ + [p(p-1)/2!]Δ²y₀ + [p(p-1)(p-2)/3!]Δ³y₀ + ... where p = (x - x₀)/h",
    },
    newtonBackward: {
      title: "Newton Backward Interpolation",
      formula: "f(x) = yₙ + p∇yₙ + [p(p+1)/2!]∇²yₙ + [p(p+1)(p+2)/3!]∇³yₙ + ... where p = (x - xₙ)/h",
    },
    stirling: {
      title: "Stirling Interpolation",
      formula: "f(x₀ + ph) = y₀ + p μΔy₀ + (p²/2!)Δ²y₀ + ... (uses central differences)",
    },
    lagrange: {
      title: "Lagrange Interpolation",
      formula:
        "f(x) = Σ y_i·L_i(x)\nL_i(x) = Π [(x - x_j)/(x_i - x_j)], j ≠ i\n\n" +
        "f(x) = [(x - x_1)(x - x_2)...(x - x_n)] / [(x_0 - x_1)(x_0 - x_2)...(x_0 - x_n)] · y_0 + ...",
    },
    lagrangeInverse: {
      title: "Lagrange Inverse Interpolation",
      formula:
        "x = Σ x_i·L_i(y)\nL_i(y) = Π [(y - y_j)/(y_i - y_j)], j ≠ i\n\n" +
        "x = [(y - y_1)(y - y_2)...(y - y_n)] / [(y_0 - y_1)(y_0 - y_2)...(y_0 - y_n)] · x_0 + ...",
    },
  };

  const current = formulas[method];

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-slate-900">{current.title}</h3>
      <pre className="bg-slate-50 border border-slate-200 rounded p-4 font-mono text-sm text-slate-800 overflow-x-auto whitespace-pre-wrap">
        {current.formula}
      </pre>
      <p className="text-xs text-slate-600">
        {method.includes("newton") && "Requires equally spaced x values"}
        {method === "stirling" && "Works best when x is near the center of the data"}
        {method === "lagrange" && "Works for both equally and unequally spaced points"}
        {method === "lagrangeInverse" && "Find x given y using inverse interpolation"}
      </p>
    </div>
  );
}

