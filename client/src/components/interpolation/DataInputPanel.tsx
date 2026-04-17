import { useState, useEffect } from "react";
import { InterpolationData, InterpolationMethod } from "@/types/interpolation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface DataInputPanelProps {
  data: InterpolationData;
  method: InterpolationMethod;
  onChange: (data: InterpolationData) => void;
}

export default function DataInputPanel({ data, method, onChange }: DataInputPanelProps) {
  const [localData, setLocalData] = useState(data);

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const handleAddRow = () => {
    const newN = Math.min(localData.numberOfPoints + 1, 10);
    const newXValues = [...localData.xValues, 0];
    const newYValues = [...localData.yValues, 0];
    const newData = { ...localData, numberOfPoints: newN, xValues: newXValues, yValues: newYValues };
    setLocalData(newData);
    onChange(newData);
  };

  const handleRemoveRow = () => {
    if (localData.numberOfPoints <= 2) return;
    const newN = localData.numberOfPoints - 1;
    const newData = {
      ...localData,
      numberOfPoints: newN,
      xValues: localData.xValues.slice(0, newN),
      yValues: localData.yValues.slice(0, newN),
    };
    setLocalData(newData);
    onChange(newData);
  };

  const handleValueChange = (index: number, field: "x" | "y", value: string) => {
    const numValue = parseFloat(value) || 0;
    const newData = { ...localData };

    if (field === "x") {
      newData.xValues[index] = numValue;
    } else {
      newData.yValues[index] = numValue;
    }

    setLocalData(newData);
    onChange(newData);
  };

  const handleTargetChange = (value: string) => {
    const newData = { ...localData, targetValue: parseFloat(value) || 0 };
    setLocalData(newData);
    onChange(newData);
  };

  const isTableOnly = method === "forwardDifferenceTable" || method === "backwardDifferenceTable";
  const isInverse = method === "lagrangeInverse";

  return (
    <div className="space-y-4">
      {/* Number of points */}
      <div>
        <Label>Number of Points: {localData.numberOfPoints}</Label>
        <div className="flex gap-2 mt-2">
          <Button onClick={handleRemoveRow} variant="outline" disabled={localData.numberOfPoints <= 2}>
            Remove Row
          </Button>
          <Button onClick={handleAddRow} variant="outline" disabled={localData.numberOfPoints >= 10}>
            Add Row
          </Button>
        </div>
      </div>

      {/* Data table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-3 py-2 text-center font-semibold">i</th>
              <th className="px-3 py-2 text-center font-semibold">x<sub>i</sub></th>
              <th className="px-3 py-2 text-center font-semibold">y<sub>i</sub></th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: localData.numberOfPoints }).map((_, i) => (
              <tr key={i} className="border-t hover:bg-slate-50">
                <td className="px-3 py-2 text-center text-slate-600">{i}</td>
                <td className="px-3 py-2">
                  <Input
                    type="number"
                    value={localData.xValues[i] || ""}
                    onChange={e => handleValueChange(i, "x", e.target.value)}
                    placeholder="0"
                    className="text-center text-sm"
                    step="0.1"
                  />
                </td>
                <td className="px-3 py-2">
                  <Input
                    type="number"
                    value={localData.yValues[i] || ""}
                    onChange={e => handleValueChange(i, "y", e.target.value)}
                    placeholder="0"
                    className="text-center text-sm"
                    step="0.1"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Target value */}
      {!isTableOnly && (
        <div>
          <Label>{isInverse ? "Target y value" : "Target x value"}</Label>
          <Input
            type="number"
            value={localData.targetValue || ""}
            onChange={e => handleTargetChange(e.target.value)}
            placeholder={isInverse ? "Enter target y" : "Enter target x"}
            step="0.01"
            className="mt-2"
          />
        </div>
      )}
    </div>
  );
}

