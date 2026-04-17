import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface ValidationError {
  type: "error" | "warning";
  message: string;
}

interface ErrorBoxProps {
  errors: ValidationError[];
}

export default function ErrorBox({ errors }: ErrorBoxProps) {
  if (errors.length === 0) return null;

  return (
    <div className="space-y-2">
      {errors.map((error, index) => (
        <Alert key={index} variant={error.type === "error" ? "destructive" : "default"}>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{error.type === "error" ? "Error" : "Warning"}</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
