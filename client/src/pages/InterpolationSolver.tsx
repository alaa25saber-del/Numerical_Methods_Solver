import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MethodSelector from "@/components/interpolation/MethodSelector";
import DataInputPanel from "@/components/interpolation/DataInputPanel";
import ForwardDifferenceTable from "@/components/interpolation/ForwardDifferenceTable";
import BackwardDifferenceTable from "@/components/interpolation/BackwardDifferenceTable";
import CentralDifferenceTable from "@/components/interpolation/CentralDifferenceTable";
import XYDataTable from "@/components/interpolation/XYDataTable";
import FormulaDisplay from "@/components/interpolation/FormulaDisplay";
import ResultDisplay from "@/components/interpolation/ResultDisplay";
import StepsPanel from "@/components/interpolation/StepsPanel";
import ValidationMessages from "@/components/interpolation/ValidationMessages";
import {
  InterpolationMethod,
  InterpolationData,
  InterpolationResult,
} from "@/types/interpolation";
import {
  calculateInterpolation,
  validateInput,
  generateExample,
} from "@/utils/interpolation";

type TableType = "forward" | "backward" | "central" | "xy" | "none";

export default function InterpolationSolver() {
  const [method, setMethod] = useState<InterpolationMethod>("newtonForward");
  const [data, setData] = useState<InterpolationData>({
    xValues: [0, 1, 2, 3],
    yValues: [1, 7, 23, 55],
    targetValue: 0.5,
    numberOfPoints: 4,
  });
  const [result, setResult] = useState<InterpolationResult | null>(null);
  const [table, setTable] = useState<number[][]>([]);
  const [tableType, setTableType] = useState<TableType>("none");
  const [showSteps, setShowSteps] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  const errors = useMemo(() => validateInput(data, method), [data, method]);

  const handleCalculate = async () => {
    if (errors.length > 0) return;

    setIsCalculating(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    const calculationResult = calculateInterpolation(data, method);
    setResult(calculationResult);
    setShowSteps(true);

    if (method === "forwardDifferenceTable" || method === "newtonForward") {
      setTable(calculationResult.forwardDifferences || []);
      setTableType("forward");
    } else if (method === "backwardDifferenceTable" || method === "newtonBackward") {
      setTable(calculationResult.backwardDifferences || []);
      setTableType("backward");
    } else if (method === "stirling") {
      setTable(calculationResult.centralDifferences || []);
      setTableType("central");
    } else if (method === "lagrange" || method === "lagrangeInverse") {
      setTable(data.xValues.map((x, index) => [x, data.yValues[index]]));
      setTableType("xy");
    } else {
      setTable([]);
      setTableType("none");
    }

    setIsCalculating(false);
  };

  const handleLoadExample = () => {
    const exampleData = generateExample(method);
    setData(exampleData);
    setResult(null);
    setTable([]);
    setTableType("none");
    setShowSteps(false);
  };

  const handleReset = () => {
    setData({
      xValues: [0, 1],
      yValues: [1, 2],
      targetValue: 0.5,
      numberOfPoints: 2,
    });
    setResult(null);
    setTable([]);
    setTableType("none");
    setShowSteps(false);
  };

  const handleDataChange = (newData: InterpolationData) => {
    setData(newData);
    setResult(null);
    setTable([]);
    setTableType("none");
  };

  const handleMethodChange = (nextMethod: InterpolationMethod) => {
    setMethod(nextMethod);
    setResult(null);
    setTable([]);
    setTableType("none");
    setShowSteps(false);
  };

  const renderTable = () => {
    if (table.length === 0 || !result) return null;

    switch (tableType) {
      case "forward":
        return (
          <ForwardDifferenceTable
            xValues={data.xValues}
            yValues={data.yValues}
            forwardDifferences={table}
            highlightIndices={result.usedIndices || []}
          />
        );
      case "backward":
        return (
          <BackwardDifferenceTable
            xValues={data.xValues}
            yValues={data.yValues}
            backwardDifferences={table}
            highlightIndices={result.usedIndices || []}
          />
        );
      case "central":
        return (
          <CentralDifferenceTable
            xValues={data.xValues}
            yValues={data.yValues}
            centralDifferences={table}
            centerIndex={result.centerIndex || 0}
            highlightIndices={result.usedIndices || []}
          />
        );
      case "xy":
        return (
          <XYDataTable
            xValues={data.xValues}
            yValues={data.yValues}
            highlightIndices={result.usedIndices || []}
            method={method}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-slate-900 mb-2">
            Numerical Methods Interpolation Solver
          </h1>
          <p className="text-lg text-slate-600">
            Solve interpolation problems using difference tables and polynomial approximation
          </p>
        </div>

        {/* Method Selector */}
        <Card className="p-6 bg-white shadow-lg">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Method Selection</h2>
          <MethodSelector method={method} onChange={handleMethodChange} />
        </Card>

        {/* Input Card */}
        <Card className="p-6 bg-white shadow-lg">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Data Input</h2>
          <DataInputPanel data={data} method={method} onChange={handleDataChange} />

          <div className="flex flex-col gap-2 mt-6">
            <Button
              onClick={handleCalculate}
              disabled={errors.length > 0 || isCalculating}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isCalculating ? "Calculating..." : "Calculate"}
            </Button>
            <Button
              onClick={handleLoadExample}
              variant="outline"
              className="w-full"
            >
              Load Example
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              className="w-full"
            >
              Reset
            </Button>
          </div>
        </Card>

        {/* Error Box */}
        <Card className="p-6 bg-white shadow-lg">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Validation</h2>
          <ValidationMessages errors={errors} />
        </Card>

        {/* Formula Display */}
        {errors.length === 0 && (
          <Card className="p-6 bg-white shadow-lg">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Formula</h2>
            <FormulaDisplay method={method} />
          </Card>
        )}

        {/* Result Section */}
        {result && (
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg border border-blue-200">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Result</h2>
            <ResultDisplay result={result} method={method} targetValue={data.targetValue} />

            {(method === "newtonForward" || method === "newtonBackward" || method === "stirling" || method === "lagrange" || method === "lagrangeInverse") && (
              <Button
                onClick={() => setShowSteps(!showSteps)}
                variant="outline"
                className="w-full mt-4"
              >
                {showSteps ? "Hide Steps" : "Show Detailed Steps"}
              </Button>
            )}
          </Card>
        )}

        {/* Table Section */}
        {table.length > 0 && result && (
          <Card className="p-6 bg-white shadow-lg">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              {tableType === "forward"
                ? "Forward Difference Table"
                : tableType === "backward"
                ? "Backward Difference Table"
                : tableType === "central"
                ? "Central Difference Table"
                : "Input Data Table"}
            </h2>
            {renderTable()}
          </Card>
        )}

        {/* Steps Section */}
        {result && showSteps && (
          <Card className="p-6 bg-white shadow-lg">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Detailed Calculation Steps</h2>
            <StepsPanel result={result} method={method} data={data} />
          </Card>
        )}
      </div>
    </div>
  );
}

