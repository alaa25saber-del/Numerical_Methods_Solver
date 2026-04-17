import jsPDF from "jspdf";
import { MethodResult } from "@/types/numerical";
import { formatNumber } from "@/contexts/NumericalSettingsContext";

export function exportResultToPDF(
  result: MethodResult,
  method: string,
  decimalPlaces: number = 6,
  roundingMethod: "round" | "chop" = "round"
): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Set font
  doc.setFont("Courier", "normal");

  // Title
  doc.setFontSize(16);
  doc.setTextColor(26, 58, 82);
  const title = "Numerical Method Solution Results";
  doc.text(title, pageWidth / 2, yPosition, { align: "center" });
  yPosition += 15;

  // Method name
  doc.setFontSize(12);
  doc.setTextColor(71, 85, 105);
  const methodLabel = "Method:";
  doc.text(`${methodLabel} ${method}`, 20, yPosition);
  yPosition += 10;

  // Results section
  doc.setFontSize(11);
  doc.setTextColor(26, 58, 82);
  const resultLabel = "Results";
  doc.text(resultLabel, 20, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);

  const resultText = "Result:";
  const iterationsText = "Iterations:";
  const errorText = "Error:";
  const statusText = "Status:";
  const convergentText = "Converged";
  const notConvergentText = "Not Converged";

  doc.text(
    `${resultText} ${typeof result.result === "number" ? formatNumber(result.result, decimalPlaces, roundingMethod) : result.result}`,
    30,
    yPosition
  );
  yPosition += 7;

  doc.text(`${iterationsText} ${result.iterations}`, 30, yPosition);
  yPosition += 7;

  doc.text(
    `${errorText} ${formatNumber(result.error, decimalPlaces, roundingMethod)}`,
    30,
    yPosition
  );
  yPosition += 7;

  doc.text(
    `${statusText} ${result.converged ? convergentText : notConvergentText}`,
    30,
    yPosition
  );
  yPosition += 10;

  // Message
  doc.setFontSize(9);
  const messageLabel = "Message:";
  doc.text(`${messageLabel} ${result.message}`, 20, yPosition);
  yPosition += 8;

  // Steps section
  if (result.steps.length > 0) {
    yPosition += 5;
    doc.setFontSize(11);
    doc.setTextColor(26, 58, 82);
    const stepsLabel = "Detailed Steps";
    doc.text(stepsLabel, 20, yPosition);
    yPosition += 8;

    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);

    result.steps.forEach((step, index) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }

      const iterationLabel = "Iteration";
      doc.text(`${iterationLabel} ${step.iteration}:`, 25, yPosition);
      yPosition += 6;

      Object.entries(step.data).forEach(([key, value]) => {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        }
        const displayValue =
          typeof value === "number"
            ? formatNumber(value, decimalPlaces, roundingMethod)
            : value;
        doc.text(`  ${key}: ${displayValue}`, 30, yPosition);
        yPosition += 5;
      });

      yPosition += 3;
    });
  }

  // Save PDF
  const fileName = `numerical_solution_${method}_${new Date().getTime()}.pdf`;
  doc.save(fileName);
}
