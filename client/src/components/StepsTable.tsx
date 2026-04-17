import { Step } from "@/types/numerical";
import {
  useNumericalSettings,
  formatNumber,
} from "@/contexts/NumericalSettingsContext";

interface StepsTableProps {
  steps: Step[];
}

function formatStepValue(value: any, settings: ReturnType<typeof useNumericalSettings>["settings"]): string {
  if (value === null || value === undefined) {
    return "-";
  }

  if (typeof value === "number") {
    return formatNumber(value, settings.decimalPlaces, settings.roundingMethod);
  }

  if (Array.isArray(value)) {
    return value
      .map(item => formatStepValue(item, settings))
      .join("\n");
  }

  if (typeof value === "object") {
    return Object.entries(value)
      .map(([key, item]) => `${key}: ${formatStepValue(item, settings)}`)
      .join("\n");
  }

  return String(value);
}

export default function StepsTable({ steps }: StepsTableProps) {
  const { settings } = useNumericalSettings();

  if (steps.length === 0) return null;

  const firstStep = steps[0];
  const columns = Object.keys(firstStep.data);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm border-collapse table-auto">
        <thead>
          <tr className="bg-primary/10 border-b-2 border-primary">
            <th className="px-4 py-2 text-right font-semibold text-primary">
              Iteration
            </th>
            {columns.map(col => (
              <th
                key={col}
                className="px-4 py-2 text-right font-semibold text-primary"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {steps.map((step, idx) => (
            <>
              <tr
                key={`step-${idx}`}
                className={`border-b border-border ${
                  idx % 2 === 0 ? "bg-background" : "bg-muted/20"
                } hover:bg-muted/40 transition-colors`}
              >
                <td className="px-4 py-2 font-semibold text-primary text-right whitespace-nowrap">
                  {step.iteration}
                </td>
                {columns.map(col => {
                  const value = formatStepValue(step.data[col], settings);
                  return (
                    <td
                      key={col}
                      className="px-4 py-2 text-foreground font-mono text-right whitespace-pre-wrap"
                    >
                      {value}
                    </td>
                  );
                })}
              </tr>
              {step.explanation ? (
                <tr key={`explanation-${idx}`} className="bg-background/80">
                  <td colSpan={columns.length + 1} className="px-4 py-2 text-sm text-muted-foreground whitespace-pre-wrap">
                    {step.explanation}
                  </td>
                </tr>
              ) : null}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}

