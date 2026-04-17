import { InterpolationMethod } from "@/types/interpolation";
import { Button } from "@/components/ui/button";

const methods: { value: InterpolationMethod; label: string }[] = [
  { value: "forwardDifferenceTable", label: "Forward Difference Table" },
  { value: "backwardDifferenceTable", label: "Backward Difference Table" },
  { value: "newtonForward", label: "Newton Forward" },
  { value: "newtonBackward", label: "Newton Backward" },
  { value: "stirling", label: "Stirling" },
  { value: "lagrange", label: "Lagrange" },
  { value: "lagrangeInverse", label: "Lagrange Inverse" },
];

interface MethodSelectorProps {
  method: InterpolationMethod;
  onChange: (method: InterpolationMethod) => void;
}

export default function MethodSelector({ method, onChange }: MethodSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      {methods.map(m => (
        <Button
          key={m.value}
          onClick={() => onChange(m.value)}
          variant={method === m.value ? "default" : "outline"}
          className="justify-start"
        >
          {m.label}
        </Button>
      ))}
    </div>
  );
}

