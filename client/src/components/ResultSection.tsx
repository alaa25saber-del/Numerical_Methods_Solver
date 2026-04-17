import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Copy, Download } from "lucide-react";
import { MethodResult } from "@/types/numerical";
import { exportResultToPDF } from "@/utils/pdfExport";
import {
  useNumericalSettings,
  formatNumber,
} from "@/contexts/NumericalSettingsContext";
import StepsTable from "./StepsTable";

interface ResultSectionProps {
  result: MethodResult;
  method: string;
}

const labels = {
  result: "Result",
  iterations: "Iterations",
  error: "Error",
  converged: "Converged",
  notConverged: "Not Converged",
  steps: "Detailed Steps",
  hideSteps: "Hide Steps",
  copy: "Copy",
  download: "Download",
  copied: "Copied",
};

export default function ResultSection({ result, method }: ResultSectionProps) {
  const t = labels;
  const [copied, setCopied] = useState(false);
  const { settings } = useNumericalSettings();

  const handleCopy = () => {
    const text = formatResultText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    exportResultToPDF(
      result,
      method,
      settings.decimalPlaces,
      settings.roundingMethod
    );
  };

  const formatResultText = () => {
    const formatValue = (value: any) => {
      return typeof value === "number"
        ? formatNumber(value, settings.decimalPlaces, settings.roundingMethod)
        : value;
    };

    let text = `Result: ${formatValue(result.result)}\n`;
    text += `Iterations: ${result.iterations}\n`;
    text += `Error: ${formatValue(result.error)}\n`;
    text += `Status: ${result.converged ? "Converged" : "Not Converged"}\n\n`;
    text += `Message: ${result.message}\n\n`;

    if (result.steps.length > 0) {
      text += "Steps:\n";
      result.steps.forEach(step => {
        text += `\nIteration ${step.iteration}:\n`;
        Object.entries(step.data).forEach(([key, value]) => {
          text += `  ${key}: ${formatValue(value)}\n`;
        });
      });
    }

    return text;
  };

  return (
    <div className="p-6 space-y-6">
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{t.result}</p>
            <p className="text-2xl font-serif font-bold text-primary">
              {typeof result.result === "number"
                ? formatNumber(
                    result.result,
                    settings.decimalPlaces,
                    settings.roundingMethod
                  )
                : result.result}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">{t.error}</p>
            <p className="text-2xl font-serif font-bold text-accent">
              {formatNumber(
                result.error,
                settings.decimalPlaces,
                settings.roundingMethod
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">{t.iterations}</p>
            <p className="text-2xl font-serif font-bold text-secondary">
              {result.iterations}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">الحالة</p>
            <p
              className={`text-2xl font-serif font-bold ${
                result.converged ? "text-green-600" : "text-red-600"
              }`}
            >
              {result.converged ? t.converged : t.notConverged}
            </p>
          </div>
        </div>

        <div className="p-4 bg-background rounded-md border border-border">
          <p className="text-sm text-foreground">{result.message}</p>
        </div>
      </Card>

      {/* Steps are shown under Input Data in the main layout */}

      <div className="flex gap-3">
        <Button
          onClick={handleCopy}
          variant="outline"
          className="flex-1"
          title={t.copy}
        >
          <Copy className="w-4 h-4 ml-2" />
          {copied ? t.copied : t.copy}
        </Button>
        <Button
          onClick={handleDownload}
          variant="outline"
          className="flex-1"
          title="Download PDF"
        >
          <Download className="w-4 h-4 ml-2" />
          PDF
        </Button>
      </div>
    </div>
  );
}

