import { useEffect, useState } from "react";
import { InterpolationMethod } from "@/types/interpolation";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface XYDataTableProps {
  xValues: number[];
  yValues: number[];
  highlightIndices?: number[];
  method?: InterpolationMethod;
}

export default function XYDataTable({
  xValues,
  yValues,
  highlightIndices = [],
  method,
}: XYDataTableProps) {
  const [visibleRows, setVisibleRows] = useState(0);
  const [activeRow, setActiveRow] = useState(0);
  const rows = xValues.map((x, index) => ({ x, y: yValues[index] }));
  const rowRevealDelay = 120;

  useEffect(() => {
    setVisibleRows(0);
    setActiveRow(0);
    const timers: number[] = [];

    for (let index = 0; index < rows.length; index += 1) {
      timers.push(
        window.setTimeout(() => {
          setVisibleRows(index + 1);
          setActiveRow(index);
        }, index * rowRevealDelay)
      );
    }

    return () => timers.forEach(window.clearTimeout);
  }, [rows.length]);

  const methodLabel =
    method === "lagrangeInverse"
      ? "Inverse Lagrange"
      : method === "lagrange"
      ? "Lagrange"
      : "Interpolation";

  return (
    <div className="overflow-x-auto">
      <div className="mb-4 flex flex-wrap gap-3 text-sm text-slate-700">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          Selected point
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
          Not selected
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          Active data row
        </div>
      </div>

      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="bg-slate-100 border-2 border-slate-300">
            <th className="border border-slate-300 px-2 py-2 text-center font-semibold">i</th>
            <th className="border border-slate-300 px-2 py-2 text-center font-semibold">x<sub>i</sub></th>
            <th className="border border-slate-300 px-2 py-2 text-center font-semibold">y<sub>i</sub></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const isVisible = index < visibleRows;
            const isHighlight = highlightIndices.includes(index);
            const isActive = index === activeRow && isHighlight;
            const rowClasses = isActive
              ? "bg-amber-50"
              : isHighlight
              ? "bg-emerald-50"
              : "bg-slate-50";
            const title = isHighlight
              ? `${methodLabel} term uses this point.`
              : `Point not selected for the main ${methodLabel} construction.`;

            return (
              <tr
                key={index}
                className={`transition-all duration-300 ${rowClasses} hover:bg-slate-100`}
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "none" : "translateY(10px)",
                  transitionDelay: `${index * rowRevealDelay}ms`,
                }}
              >
                <td className="border border-slate-300 px-2 py-2 text-center text-slate-600">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>{index}</span>
                    </TooltipTrigger>
                    <TooltipContent>{title}</TooltipContent>
                  </Tooltip>
                </td>
                <td className="border border-slate-300 px-2 py-2 text-center text-slate-700">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>{Number.isFinite(row.x) ? row.x.toFixed(4) : "-"}</span>
                    </TooltipTrigger>
                    <TooltipContent>{title}</TooltipContent>
                  </Tooltip>
                </td>
                <td className="border border-slate-300 px-2 py-2 text-center text-slate-700">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>{Number.isFinite(row.y) ? row.y.toFixed(4) : "-"}</span>
                    </TooltipTrigger>
                    <TooltipContent>{title}</TooltipContent>
                  </Tooltip>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

