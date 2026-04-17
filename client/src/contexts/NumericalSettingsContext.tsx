import React, { createContext, useContext, useState, useEffect } from "react";

interface NumericalSettings {
  decimalPlaces: number;
  roundingMethod: "round" | "chop";
}

// Helper functions for number formatting
export function formatNumber(
  value: number,
  decimalPlaces: number,
  method: "round" | "chop" = "round"
): string {
  if (method === "chop") {
    const factor = Math.pow(10, decimalPlaces);
    return (
      (Math.floor(Math.abs(value) * factor) / factor) *
      Math.sign(value)
    ).toString();
  }

  return value.toFixed(decimalPlaces);
}

interface NumericalSettingsContextType {
  settings: NumericalSettings;
  updateSettings: (settings: Partial<NumericalSettings>) => void;
}

const NumericalSettingsContext = createContext<
  NumericalSettingsContextType | undefined
>(undefined);

interface NumericalSettingsProviderProps {
  children: React.ReactNode;
}

export function NumericalSettingsProvider({
  children,
}: NumericalSettingsProviderProps) {
  const [settings, setSettings] = useState<NumericalSettings>(() => {
    const stored = localStorage.getItem("numericalSettings");
    const defaultSettings: NumericalSettings = {
      decimalPlaces: 6,
      roundingMethod: "round",
    };

    if (!stored) {
      return defaultSettings;
    }

    try {
      const parsed = JSON.parse(stored) as Partial<NumericalSettings>;
      const roundingMethod =
        parsed.roundingMethod === "chop" ? "chop" : "round";
      return {
        ...defaultSettings,
        ...parsed,
        roundingMethod,
      };
    } catch {
      return defaultSettings;
    }
  });

  useEffect(() => {
    localStorage.setItem("numericalSettings", JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<NumericalSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <NumericalSettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </NumericalSettingsContext.Provider>
  );
}

export function useNumericalSettings() {
  const context = useContext(NumericalSettingsContext);
  if (context === undefined) {
    throw new Error(
      "useNumericalSettings must be used within a NumericalSettingsProvider"
    );
  }
  return context;
}

