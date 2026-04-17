import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MethodResult } from "@/types/numerical";
import {
  bisectionMethod,
  falsePositionMethod,
  newtonRaphsonMethod,
  secantMethod,
} from "@/utils/rootFinding";
import {
  jacobiMethod,
  gaussSeidelMethod,
  dolittleMethod,
  thomasMethod,
} from "@/utils/linearSystems";

interface InputSectionProps {
  method: string;
  onSolve: (result: MethodResult) => void;
}

const labels = {
  function: "Function f(x)",
  initialGuess: "Initial Guess",
  tolerance: "Tolerance",
  maxIterations: "Max Iterations",
  intervalA: "Left Interval a",
  intervalB: "Right Interval b",
  solve: "Solve",
  example: "Example",
  matrixA: "Matrix A",
  matrixSize: "Matrix Size",
  matrixSizeHelp: "Square matrix dimension for the linear system",
  vectorB: "Vector b",
  initialVector: "Initial Vector",
  enterFormula: "Enter formula (e.g., x^2 - 2)",
};

const methodDescriptions: Record<string, string> = {
  bisection: "Find a root in [a, b] using repeated interval halving.",
  falsePosition: "Approximate a root with the false position method over an interval.",
  newton: "Use Newton-Raphson iteration from an initial guess.",
  secant: "Use two initial guesses to approximate a root without derivatives.",
  jacobi: "Solve linear systems iteratively with the Jacobi method.",
  gaussSeidel: "Solve linear systems iteratively using Gauss-Seidel updates.",
  dolittle: "Solve a linear system by computing LU decomposition.",
  thomas: "Solve tridiagonal systems using the Thomas algorithm.",
};

export default function InputSection({ method, onSolve }: InputSectionProps) {
  const t = labels;
  const [inputs, setInputs] = useState<Record<string, any>>({});
  const [matrixSize, setMatrixSize] = useState(3);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setValidationError(null);
    setMatrixSize(3);
  }, [method]);

  const handleInputChange = (key: string, value: any) => {
    setValidationError(null);
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const minMatrixSize = 2;
  const maxMatrixSize = 6;

  const createEmptyMatrix = (n: number) =>
    Array.from({ length: n }, () => Array.from({ length: n }, () => ""));

  const createEmptyVector = (n: number) => Array.from({ length: n }, () => "");

  const clampMatrixSize = (size: number) =>
    Math.max(minMatrixSize, Math.min(maxMatrixSize, size));

  const parseVector = (raw: string | string[] | undefined): number[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) {
      return raw
        .map(v => parseFloat(v.trim()))
        .filter(v => !isNaN(v));
    }
    return raw
      .split(",")
      .map(v => parseFloat(v.trim()))
      .filter(v => !isNaN(v));
  };

  const parseMatrix = (raw: string | string[][] | undefined): number[][] => {
    if (!raw) return [];
    if (Array.isArray(raw)) {
      return raw.map(row => parseVector(row));
    }
    return raw.split(";").map(row => parseVector(row));
  };

  const getMatrixInput = (raw: string | string[][] | undefined, size: number) => {
    const matrix = createEmptyMatrix(size);
    if (!raw) return matrix;

    if (Array.isArray(raw)) {
      for (let i = 0; i < size; i += 1) {
        for (let j = 0; j < size; j += 1) {
          matrix[i][j] = raw[i]?.[j] ?? "";
        }
      }
      return matrix;
    }

    const parsed = raw.split(";").map(row => row.split(",").map(cell => cell.trim()));
    for (let i = 0; i < size; i += 1) {
      for (let j = 0; j < size; j += 1) {
        matrix[i][j] = parsed[i]?.[j] ?? "";
      }
    }
    return matrix;
  };

  const getVectorInput = (raw: string | string[] | undefined, size: number) => {
    const vector = createEmptyVector(size);
    if (!raw) return vector;

    if (Array.isArray(raw)) {
      for (let i = 0; i < size; i += 1) {
        vector[i] = raw[i] ?? "";
      }
      return vector;
    }

    const parsed = raw.split(",").map(cell => cell.trim());
    for (let i = 0; i < size; i += 1) {
      vector[i] = parsed[i] ?? "";
    }
    return vector;
  };

  const updateMatrixCell = (row: number, col: number, value: string) => {
    const matrix = getMatrixInput(inputs.matrixA, matrixSize);
    matrix[row][col] = value;
    handleInputChange("matrixA", matrix);
  };

  const updateVectorCell = (index: number, value: string) => {
    const vector = getVectorInput(inputs.vectorB, matrixSize);
    vector[index] = value;
    handleInputChange("vectorB", vector);
  };

  const resizeMatrix = (size: number) => {
    const nextSize = clampMatrixSize(size);
    setMatrixSize(nextSize);
    handleInputChange("matrixA", getMatrixInput(inputs.matrixA, nextSize));
    handleInputChange("vectorB", getVectorInput(inputs.vectorB, nextSize));
  };

  const loadExample = () => {
    switch (method) {
      case "bisection":
      case "falsePosition":
        setInputs({
          function: "x^2 - 2",
          a: "1",
          b: "2",
          tolerance: "0.0001",
          maxIterations: "100",
        });
        break;
      case "newton":
        setInputs({
          function: "x^2 - 2",
          x0: "2",
          tolerance: "0.0001",
          maxIterations: "100",
        });
        break;
      case "secant":
        setInputs({
          function: "x^2 - 2",
          x0: "1",
          x1: "2",
          tolerance: "0.0001",
          maxIterations: "100",
        });
        break;
      case "jacobi":
      case "gaussSeidel":
        setInputs({
          matrixA: "10,1,1;1,10,1;1,1,10",
          vectorB: "12,12,12",
          x0: "0,0,0",
          tolerance: "0.0001",
          maxIterations: "100",
        });
        break;
      case "dolittle":
      case "thomas":
        setMatrixSize(3);
        setInputs({
          matrixA: [
            ["4", "1", "0"],
            ["1", "4", "1"],
            ["0", "1", "4"],
          ],
          vectorB: ["1", "2", "3"],
        });
        break;
    }
  };


  const handleSolve = () => {
    let result: MethodResult;

    try {
      const tolerance = parseFloat(inputs.tolerance) || 0.0001;
      const maxIterations = parseInt(inputs.maxIterations) || 100;

      switch (method) {
        case "bisection":
          result = bisectionMethod(
            inputs.function || "x^2 - 2",
            parseFloat(inputs.a) || 1,
            parseFloat(inputs.b) || 2,
            tolerance,
            maxIterations
          );
          break;

        case "newton":
          result = newtonRaphsonMethod(
            inputs.function || "x^2 - 2",
            parseFloat(inputs.x0) || 2,
            tolerance,
            maxIterations
          );
          break;

        case "secant":
          result = secantMethod(
            inputs.function || "x^2 - 2",
            parseFloat(inputs.x0) || 1,
            parseFloat(inputs.x1) || 2,
            tolerance,
            maxIterations
          );
          break;

        case "falsePosition":
          result = falsePositionMethod(
            inputs.function || "x^2 - 2",
            parseFloat(inputs.a) || 1,
            parseFloat(inputs.b) || 2,
            tolerance,
            maxIterations
          );
          break;

        case "jacobi": {
          const A = parseMatrix(inputs.matrixA);
          const b = parseVector(inputs.vectorB);
          const x0 = parseVector(inputs.x0);
          result = jacobiMethod(A, b, x0, tolerance, maxIterations);
          break;
        }

        case "gaussSeidel": {
          const A = parseMatrix(inputs.matrixA);
          const b = parseVector(inputs.vectorB);
          const x0 = parseVector(inputs.x0);
          result = gaussSeidelMethod(A, b, x0, tolerance, maxIterations);
          break;
        }

        case "dolittle": {
          const A = parseMatrix(inputs.matrixA);
          const b = parseVector(inputs.vectorB);
          if (A.length !== matrixSize || A.some(row => row.length !== matrixSize)) {
            throw new Error(`Matrix A must be ${matrixSize}x${matrixSize} numeric values.`);
          }
          if (b.length !== matrixSize) {
            throw new Error(`Vector b must contain ${matrixSize} numeric values.`);
          }
          result = dolittleMethod(A, b);
          break;
        }

        case "thomas": {
          const A = parseMatrix(inputs.matrixA);
          const b = parseVector(inputs.vectorB);
          if (A.length !== matrixSize || A.some(row => row.length !== matrixSize)) {
            throw new Error(`Matrix A must be ${matrixSize}x${matrixSize} numeric values.`);
          }
          if (b.length !== matrixSize) {
            throw new Error(`Vector b must contain ${matrixSize} numeric values.`);
          }
          for (let i = 0; i < matrixSize; i += 1) {
            for (let j = 0; j < matrixSize; j += 1) {
              if (Math.abs(i - j) > 1 && Math.abs(A[i][j]) > 1e-12) {
                throw new Error(
                  "Thomas method requires a tridiagonal matrix: only main, upper, and lower diagonals may have nonzero values."
                );
              }
            }
          }
          result = thomasMethod(A, b);
          break;
        }


        default:
          throw new Error("Unknown method");
      }

      setValidationError(null);
      onSolve(result);
    } catch (error) {
      const message = `Error: ${(error as Error).message}`;
      setValidationError(message);
      onSolve({
        result: 0,
        iterations: 0,
        error: 0,
        converged: false,
        steps: [],
        message,
      });
    }
  };

  const renderInputs = () => {
    const commonProps = {
      className: "w-full px-3 py-2 border border-input rounded-md bg-background",
    };

    if (["bisection", "falsePosition"].includes(method)) {
      return (
        <>
          <div><Label>{t.function}</Label><Input {...commonProps} placeholder={t.enterFormula} value={inputs.function || ""} onChange={e => handleInputChange("function", e.target.value)} /></div>
          <div><Label>{t.intervalA}</Label><Input {...commonProps} type="number" value={inputs.a || ""} onChange={e => handleInputChange("a", e.target.value)} /></div>
          <div><Label>{t.intervalB}</Label><Input {...commonProps} type="number" value={inputs.b || ""} onChange={e => handleInputChange("b", e.target.value)} /></div>
          <div><Label>{t.tolerance}</Label><Input {...commonProps} type="number" value={inputs.tolerance || ""} onChange={e => handleInputChange("tolerance", e.target.value)} /></div>
          <div><Label>{t.maxIterations}</Label><Input {...commonProps} type="number" value={inputs.maxIterations || ""} onChange={e => handleInputChange("maxIterations", e.target.value)} /></div>
        </>
      );
    }

    if (method === "newton") {
      return (
        <>
          <div><Label>{t.function}</Label><Input {...commonProps} placeholder={t.enterFormula} value={inputs.function || ""} onChange={e => handleInputChange("function", e.target.value)} /></div>
          <div><Label>{t.initialGuess}</Label><Input {...commonProps} type="number" value={inputs.x0 || ""} onChange={e => handleInputChange("x0", e.target.value)} /></div>
          <div><Label>{t.tolerance}</Label><Input {...commonProps} type="number" value={inputs.tolerance || ""} onChange={e => handleInputChange("tolerance", e.target.value)} /></div>
          <div><Label>{t.maxIterations}</Label><Input {...commonProps} type="number" value={inputs.maxIterations || ""} onChange={e => handleInputChange("maxIterations", e.target.value)} /></div>
        </>
      );
    }

    if (method === "secant") {
      return (
        <>
          <div><Label>{t.function}</Label><Input {...commonProps} placeholder={t.enterFormula} value={inputs.function || ""} onChange={e => handleInputChange("function", e.target.value)} /></div>
          <div><Label>Initial Guess x0</Label><Input {...commonProps} type="number" value={inputs.x0 || ""} onChange={e => handleInputChange("x0", e.target.value)} /></div>
          <div><Label>Initial Guess x1</Label><Input {...commonProps} type="number" value={inputs.x1 || ""} onChange={e => handleInputChange("x1", e.target.value)} /></div>
          <div><Label>{t.tolerance}</Label><Input {...commonProps} type="number" value={inputs.tolerance || ""} onChange={e => handleInputChange("tolerance", e.target.value)} /></div>
          <div><Label>{t.maxIterations}</Label><Input {...commonProps} type="number" value={inputs.maxIterations || ""} onChange={e => handleInputChange("maxIterations", e.target.value)} /></div>
        </>
      );
    }

    if (["jacobi", "gaussSeidel"].includes(method)) {
      const matrix = getMatrixInput(inputs.matrixA, matrixSize);
      const vector = getVectorInput(inputs.vectorB, matrixSize);

      return (
        <>
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label>{t.matrixSize}</Label>
              <p className="text-xs text-muted-foreground">{t.matrixSizeHelp}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => resizeMatrix(matrixSize - 1)}
                disabled={matrixSize <= minMatrixSize}
              >
                -
              </Button>
              <div className="w-14 text-center rounded-md border border-input bg-background px-2 py-2">
                {matrixSize} x {matrixSize}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => resizeMatrix(matrixSize + 1)}
                disabled={matrixSize >= maxMatrixSize}
              >
                +
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-md border border-input bg-background p-2">
            <table className="min-w-full border-separate border-spacing-1">
              <tbody>
                {matrix.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((value, colIndex) => (
                      <td key={colIndex} className="border border-input bg-background p-1">
                        <Input
                          className="w-20 px-2 py-2"
                          type="text"
                          value={value}
                          onChange={e => updateMatrixCell(rowIndex, colIndex, e.target.value)}
                          placeholder="0"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <Label>{t.vectorB}</Label>
            <div className="grid gap-2 sm:grid-cols-3">
              {vector.map((value, index) => (
                <Input
                  key={index}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  type="text"
                  value={value}
                  onChange={e => updateVectorCell(index, e.target.value)}
                  placeholder={`b${index + 1}`}
                />
              ))}
            </div>
          </div>

          <div><Label>{t.initialVector}</Label><Input {...commonProps} value={inputs.x0 || ""} onChange={e => handleInputChange("x0", e.target.value)} /></div>
          <div><Label>{t.tolerance}</Label><Input {...commonProps} type="number" value={inputs.tolerance || ""} onChange={e => handleInputChange("tolerance", e.target.value)} /></div>
          <div><Label>{t.maxIterations}</Label><Input {...commonProps} type="number" value={inputs.maxIterations || ""} onChange={e => handleInputChange("maxIterations", e.target.value)} /></div>
        </>
      );
    }

    if (["dolittle", "thomas"].includes(method)) {
      const matrix = getMatrixInput(inputs.matrixA, matrixSize);
      const vector = getVectorInput(inputs.vectorB, matrixSize);

      return (
        <>
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label>Matrix size</Label>
              <p className="text-xs text-muted-foreground">Use the buttons to change the square matrix dimension.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => resizeMatrix(matrixSize - 1)}
                disabled={matrixSize <= minMatrixSize}
              >
                -
              </Button>
              <div className="w-14 text-center rounded-md border border-input bg-background px-2 py-2">
                {matrixSize} x {matrixSize}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => resizeMatrix(matrixSize + 1)}
                disabled={matrixSize >= maxMatrixSize}
              >
                +
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-md border border-input bg-background p-2">
            <table className="min-w-full border-separate border-spacing-1">
              <tbody>
                {matrix.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((value, colIndex) => (
                      <td key={colIndex} className="border border-input bg-background p-1">
                        <Input
                          className="w-20 px-2 py-2"
                          type="text"
                          value={value}
                          onChange={e => updateMatrixCell(rowIndex, colIndex, e.target.value)}
                          placeholder="0"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <Label>{t.vectorB}</Label>
            <div className="grid gap-2 sm:grid-cols-3">
              {vector.map((value, index) => (
                <Input
                  key={index}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  type="text"
                  value={value}
                  onChange={e => updateVectorCell(index, e.target.value)}
                  placeholder={`b${index + 1}`}
                />
              ))}
            </div>
          </div>
        </>
      );
    }


    return null;
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold capitalize">{method.replace(/([A-Z])/g, ' $1')}</h2>
          <Button variant="outline" onClick={loadExample}>{t.example}</Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {methodDescriptions[method] ?? "Enter the inputs for the selected numerical method."}
        </p>
      </div>
      <div className="space-y-4">{renderInputs()}</div>
      {validationError ? (
        <Alert variant="destructive">
          <AlertTitle>Validation Error</AlertTitle>
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      ) : null}
      <Button className="w-full" onClick={handleSolve}>{t.solve}</Button>
    </Card>
  );
}

