import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import InputSection from "@/components/InputSection";
import ResultSection from "@/components/ResultSection";
import StepsSection from "@/components/StepsSection";
import SettingsPanel from "@/components/SettingsPanel";
import { MethodResult } from "@/types/numerical";

export default function Home() {
  const [selectedMethod, setSelectedMethod] = useState<string>("bisection");
  const [result, setResult] = useState<MethodResult | null>(null);
  const [showSteps, setShowSteps] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleMethodChange = (method: string) => {
    setSelectedMethod(method);
    setResult(null);
    setShowSteps(false);
  };

  const handleSolve = (result: MethodResult) => {
    setResult(result);
    setShowSteps(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar
        selectedMethod={selectedMethod}
        onMethodChange={handleMethodChange}
        onSettingsOpen={() => setSettingsOpen(true)}
      />

      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-y-auto">
          <div className="px-4">
            <InputSection method={selectedMethod} onSolve={handleSolve} />
          </div>

          <div className="px-4">
            {result ? (
              <ResultSection result={result} method={selectedMethod} />
            ) : (
              <div className="h-full flex items-center justify-center p-8">
                <div className="text-center">
                  <h2 className="text-2xl font-serif text-muted-foreground mb-4">
                    Select a method and enter data
                  </h2>
                  <p className="text-muted-foreground">
                    Results and detailed steps will appear below the input data
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {result && result.steps && result.steps.length > 0 && showSteps && (
          <div className="px-6 py-4">
            <div className="p-6 bg-card rounded-md border border-border">
              <h3 className="text-xl font-serif font-bold mb-4">
                Detailed Steps
              </h3>
              <div className="overflow-auto max-h-[60vh]">
                <StepsSection steps={result.steps} />
              </div>
            </div>
          </div>
        )}
      </div>

      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}

