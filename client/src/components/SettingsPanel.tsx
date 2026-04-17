import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Settings, X } from "lucide-react";
import { useNumericalSettings } from "@/contexts/NumericalSettingsContext";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { settings, updateSettings } = useNumericalSettings();
  const [decimalPlaces, setDecimalPlaces] = useState(
    settings.decimalPlaces.toString()
  );
  const [roundingMethod, setRoundingMethod] = useState(settings.roundingMethod);

  const handleSave = () => {
    const places = parseInt(decimalPlaces);
    if (places >= 0 && places <= 15) {
      updateSettings({ decimalPlaces: places, roundingMethod });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Numerical Settings</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="decimalPlaces">Decimal Places</Label>
            <Input
              id="decimalPlaces"
              type="number"
              min="0"
              max="15"
              value={decimalPlaces}
              onChange={e => setDecimalPlaces(e.target.value)}
              placeholder="6"
            />
            <p className="text-sm text-gray-600 mt-1">
              Number of decimal places to display in results (0-15)
            </p>
          </div>

          <div>
            <Label>Method format</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {[
                { value: "round", label: "Round-off" },
                { value: "chop", label: "Chop-off" },
              ].map(option => (
                <Button
                  key={option.value}
                  variant={
                    roundingMethod === option.value ? "secondary" : "outline"
                  }
                  size="sm"
                  type="button"
                  onClick={() =>
                    setRoundingMethod(option.value as "round" | "chop")
                  }
                  className="w-full"
                >
                  {option.label}
                </Button>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Choose whether to use round-off or chop-off numeric output.
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <Button onClick={handleSave} className="flex-1">
            Save Settings
          </Button>
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  );
}

