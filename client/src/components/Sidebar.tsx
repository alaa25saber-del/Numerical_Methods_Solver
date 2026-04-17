import { Moon, Sun, Settings, Minus, Plus } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useNumericalSettings } from "@/contexts/NumericalSettingsContext";

interface SidebarProps {
  selectedMethod: string;
  onMethodChange: (method: string) => void;
  onSettingsOpen?: () => void;
}

const methods = {
  rootFinding: "Root Finding Methods",
  bisection: "Bisection Method",
  falsePosition: "False Position Method",
  newton: "Newton-Raphson Method",
  secant: "Secant Method",
  linearSystems: "Linear Systems",
  jacobi: "Jacobi Method",
  gaussSeidel: "Gauss-Seidel Method",
  dolittle: "Dolittle LU Method",
  thomas: "Thomas Algorithm",
};

const methodGroups = [
  {
    id: "rootFinding",
    items: [
      { id: "bisection", labelKey: "bisection" },
      { id: "falsePosition", labelKey: "falsePosition" },
      { id: "newton", labelKey: "newton" },
      { id: "secant", labelKey: "secant" },
    ],
  },
  {
    id: "linearSystems",
    items: [
      { id: "jacobi", labelKey: "jacobi" },
      { id: "gaussSeidel", labelKey: "gaussSeidel" },
      { id: "dolittle", labelKey: "dolittle" },
      { id: "thomas", labelKey: "thomas" },
    ],
  },
];

export default function Sidebar({
  selectedMethod,
  onMethodChange,
  onSettingsOpen,
}: SidebarProps) {
  const { theme, toggleTheme } = useTheme();
  const { settings, updateSettings } = useNumericalSettings();
  const labels = methods;

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-2xl font-serif font-bold text-sidebar-primary mb-2">
          Numerical Solver
        </h1>
        <p className="text-sm text-sidebar-foreground opacity-70">
          Advanced Numerical Methods Solver
        </p>
      </div>

      {/* Methods Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {methodGroups.map(group => (
          <div key={group.id}>
            <h3 className="text-xs font-bold text-sidebar-accent uppercase tracking-wider mb-3">
              {labels[group.id as keyof typeof labels]}
            </h3>
            <div className="space-y-2">
              {group.items.map(item => (
                <button
                  key={item.id}
                  onClick={() => onMethodChange(item.id)}
                  className={`w-full text-left px-4 py-2 rounded-md text-sm transition-colors ${
                    selectedMethod === item.id
                      ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:bg-opacity-10"
                  }`}
                >
                  {labels[item.labelKey as keyof typeof labels]}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div>
          <h3 className="text-xs font-bold text-sidebar-accent uppercase tracking-wider mb-3">
            Interpolation
          </h3>
          <div className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-start px-4 py-2 text-sm">
              <Link href="/interpolation">Interpolation Solver</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Footer Controls */}
      <div className="border-t border-sidebar-border p-4 space-y-3">
        {/* Decimal Places Control */}
        <div className="space-y-2">
          <div className="text-xs text-sidebar-foreground opacity-70 text-center">
            Decimal Places: {settings.decimalPlaces}
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                updateSettings({
                  decimalPlaces: Math.max(0, settings.decimalPlaces - 1),
                })
              }
              className="flex-1 h-8"
              disabled={settings.decimalPlaces <= 0}
            >
              <Minus className="w-3 h-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                updateSettings({
                  decimalPlaces: Math.min(15, settings.decimalPlaces + 1),
                })
              }
              className="flex-1 h-8"
              disabled={settings.decimalPlaces >= 15}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Method Format Control */}
        <div className="space-y-2">
          <div className="text-xs text-sidebar-foreground opacity-70 text-center">
            Method format:{" "}
            {settings.roundingMethod === "round" ? "Round-off" : "Chop-off"}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              updateSettings({
                roundingMethod:
                  settings.roundingMethod === "round" ? "chop" : "round",
              })
            }
            className="w-full h-8 text-xs"
          >
            Switch to{" "}
            {settings.roundingMethod === "round" ? "Chop-off" : "Round-off"}
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onSettingsOpen}
          className="w-full"
          title="Numerical Settings"
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleTheme}
          className="w-full"
          title={theme === "dark" ? "Light Mode" : "Dark Mode"}
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </Button>
      </div>
    </aside>
  );
}

