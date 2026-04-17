import { ValidationError } from "@/types/interpolation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ValidationMessagesProps {
  errors: ValidationError[];
}

export default function ValidationMessages({ errors }: ValidationMessagesProps) {
  const errorItems = errors.filter(e => e.type === "error");
  const warningItems = errors.filter(e => e.type === "warning");

  if (errorItems.length === 0 && warningItems.length === 0) {
    return (
      <Alert className="border-green-300 bg-green-50">
        <AlertCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          All inputs are valid. Ready to calculate.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-3">
      {errorItems.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {errorItems.map((err, i) => (
                <div key={i}>{err.message}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {warningItems.length > 0 && (
        <Alert className="border-yellow-300 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <div className="space-y-1">
              {warningItems.map((warn, i) => (
                <div key={i}>{warn.message}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

