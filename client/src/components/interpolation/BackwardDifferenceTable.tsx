import { useEffect, useState } from "react";

interface BackwardDifferenceTableProps {
  xValues: number[];
  yValues: number[];
  backwardDifferences: number[][];
  highlightIndices: number[];
}

export default function BackwardDifferenceTable({
  xValues,
  yValues,
  backwardDifferences,
  highlightIndices,
}: BackwardDifferenceTableProps) {
  const [visibleRows, setVisibleRows] = useState(0);
  const totalRows = yValues.length;
  const rowRevealDelay = 110;
  const maxOrder = backwardDifferences.length - 1;
  const baseHeight = 72;
  const verticalShift = 24;
  const horizontalSpacing = 120;
  const cellWidth = 106;
  const cellHeight = 60;
  const containerPaddingTop = 16;
  const containerHeight = (totalRows - 1) * baseHeight + maxOrder * verticalShift + 32;
  const containerWidth = (maxOrder + 1) * horizontalSpacing + cellWidth + 32;

  const getNablaSymbol = (order: number) => {
    const superscripts = ["", "", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹"];
    return order === 0 ? "y" : `∇${superscripts[order] || order}`;
  };

  useEffect(() => {
    setVisibleRows(0);
    const timers: number[] = [];

    for (let row = 0; row < totalRows; row += 1) {
      timers.push(
        window.setTimeout(() => {
          setVisibleRows(row + 1);
        }, row * rowRevealDelay)
      );
    }

    return () => timers.forEach(window.clearTimeout);
  }, [totalRows, backwardDifferences]);

  const lastRowIndex = yValues.length - 1;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse text-sm rounded-2xl border border-slate-300 bg-white">
        <thead>
          <tr className="bg-slate-100 border-b border-slate-300">
            <th className="border border-slate-300 px-2 py-2 text-center font-semibold">i</th>
            <th className="border border-slate-300 px-2 py-2 text-center font-semibold">x</th>
            <th className="border border-slate-300 px-2 py-2 text-center font-semibold">y</th>
            {backwardDifferences.slice(1).map((_, order) => (
              <th key={order + 1} className="border border-slate-300 px-2 py-2 text-center font-semibold">
                {getNablaSymbol(order + 1)}y
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: totalRows * 2 - 1 }, (_, displayIndex) => {
            const isPrimaryRow = displayIndex % 2 === 0;
            const primaryIndex = Math.floor(displayIndex / 2);
            const diffRowIndex = Math.floor((displayIndex - 1) / 2);
            const isVisible = isPrimaryRow ? primaryIndex < visibleRows : diffRowIndex < visibleRows;

            return (
              <tr
                key={`display-row-${displayIndex}`}
                className="hover:bg-slate-50 transition-all duration-300"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "none" : "translateY(10px)",
                  transitionDelay: `${displayIndex * (rowRevealDelay / 2)}ms`,
                }}
              >
                <td className="border border-slate-300 px-2 py-2 text-center font-semibold text-slate-600">
                  {isPrimaryRow ? primaryIndex : ""}
                </td>
                <td className="border border-slate-300 px-2 py-2 text-center text-slate-700">
                  {isPrimaryRow ? xValues[primaryIndex]?.toFixed(4) || "-" : ""}
                </td>
                <td className={`border border-slate-300 px-2 py-2 text-center font-semibold ${isPrimaryRow ? "bg-white text-slate-700" : "bg-white text-slate-400"}`}>
                  {isPrimaryRow ? yValues[primaryIndex]?.toFixed(4) || "-" : ""}
                </td>
                {backwardDifferences.slice(1).map((_, order) => {
                  const diffOrder = order + 1;
                  let value: number | undefined;

                  if (isPrimaryRow && diffOrder % 2 === 0) {
                    const diffIndex = primaryIndex - diffOrder / 2;
                    value = diffIndex >= 0 ? backwardDifferences[diffOrder][diffIndex] : undefined;
                  } else if (!isPrimaryRow && diffOrder % 2 === 1) {
                    const diffIndex = diffRowIndex - Math.floor(diffOrder / 2);
                    value = diffIndex >= 0 ? backwardDifferences[diffOrder][diffIndex] : undefined;
                  }

                  return (
                    <td
                      key={`diff-${displayIndex}-${diffOrder}`}
                      className={`border border-slate-300 px-2 py-2 text-center transition-all duration-300 ${
                        value !== undefined
                          ? "bg-slate-100 text-slate-500"
                          : "bg-white text-slate-400"
                      }`}
                      title={value !== undefined ? `Backward difference Δ${diffOrder}y` : ""}
                    >
                      {value !== undefined ? value.toFixed(4) : ""}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

