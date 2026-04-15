import { useSimulationStore } from "@/lib/simulationStore";
import { MATERIAL_PRESETS } from "@/lib/solarPhysics";
import { Button } from "@/components/ui/button";
import { Trash2, GitCompare } from "lucide-react";
import { useLocation } from "wouter";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

const COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#8b5cf6"];

export default function Comparison() {
  const { savedConfigs, removeConfig } = useSimulationStore();
  const [, setLocation] = useLocation();

  if (savedConfigs.length === 0) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <GitCompare className="w-12 h-12 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-serif font-bold text-foreground mb-2">No Saved Configurations</h1>
        <p className="text-muted-foreground mb-6 max-w-md">
          Go to the Simulator, adjust parameters, and click "Save Config" to add up to 4 configurations for side-by-side comparison.
        </p>
        <Button onClick={() => setLocation("/")} data-testid="button-go-simulator">
          Open Simulator
        </Button>
      </div>
    );
  }

  const metricKeys = [
    { key: "voc", label: "Voc (V)", unit: "V" },
    { key: "isc", label: "Isc (A)", unit: "A" },
    { key: "pmax", label: "Pmax (W)", unit: "W" },
    { key: "fillFactor", label: "Fill Factor", unit: "%" },
    { key: "efficiency", label: "Efficiency", unit: "%" },
  ] as const;

  const radarMetrics = ["efficiency", "fillFactor", "voc", "isc", "pmax"] as const;
  const maxValues = radarMetrics.reduce(
    (acc, k) => {
      acc[k] = Math.max(...savedConfigs.map((c) => c.metrics[k as keyof typeof c.metrics] as number), 1);
      return acc;
    },
    {} as Record<string, number>
  );

  const radarData = radarMetrics.map((metric) => {
    const row: Record<string, unknown> = {
      subject: metric === "fillFactor" ? "Fill Factor" : metric === "efficiency" ? "Efficiency" : metric === "voc" ? "Voc" : metric === "isc" ? "Isc" : "Pmax",
    };
    savedConfigs.forEach((cfg) => {
      row[cfg.name] = parseFloat((((cfg.metrics[metric as keyof typeof cfg.metrics] as number) / maxValues[metric]) * 100).toFixed(1));
    });
    return row;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Cell Comparison</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{savedConfigs.length}/4 configurations saved</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setLocation("/")} data-testid="button-add-more">
          Add More
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="text-left px-4 py-3 bg-muted/50 rounded-tl-lg text-xs uppercase tracking-widest text-muted-foreground font-semibold">Metric</th>
              {savedConfigs.map((cfg, i) => (
                <th key={cfg.id} className="px-4 py-3 bg-muted/50 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
                    <div className="font-semibold text-foreground text-sm">{cfg.name}</div>
                    <div className="text-xs text-muted-foreground font-normal">
                      {MATERIAL_PRESETS[cfg.params.material]?.label ?? cfg.params.material}
                    </div>
                    <Button
                      data-testid={`button-remove-${cfg.id}`}
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => removeConfig(cfg.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metricKeys.map(({ key, label, unit }, rowIdx) => (
              <tr key={key} className={rowIdx % 2 === 0 ? "bg-card" : "bg-muted/20"}>
                <td className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</td>
                {savedConfigs.map((cfg) => {
                  const val = cfg.metrics[key as keyof typeof cfg.metrics] as number;
                  const maxVal = Math.max(...savedConfigs.map((c) => c.metrics[key as keyof typeof c.metrics] as number));
                  const isBest = val === maxVal;
                  return (
                    <td key={cfg.id} className="px-4 py-3 text-center">
                      <span className={`font-mono text-sm font-semibold ${isBest ? "text-primary" : "text-foreground"}`}>
                        {val.toFixed(key === "fillFactor" || key === "efficiency" ? 2 : 4)} {unit}
                      </span>
                      {isBest && <span className="ml-1 text-xs text-primary">best</span>}
                    </td>
                  );
                })}
              </tr>
            ))}

            <tr className="bg-card">
              <td className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Irradiance</td>
              {savedConfigs.map((cfg) => (
                <td key={cfg.id} className="px-4 py-3 text-center font-mono text-sm">{cfg.params.irradiance} W/m²</td>
              ))}
            </tr>
            <tr className="bg-muted/20">
              <td className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Temperature</td>
              {savedConfigs.map((cfg) => (
                <td key={cfg.id} className="px-4 py-3 text-center font-mono text-sm">{cfg.params.temperature}°C</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">Performance Radar (normalized to best-in-class)</h2>
        <ResponsiveContainer width="100%" height={320}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} tickCount={4} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }} formatter={(v: number) => [`${v.toFixed(1)}%`, ""]} />
            {savedConfigs.map((cfg, i) => (
              <Radar key={cfg.id} name={cfg.name} dataKey={cfg.name} stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.15} />
            ))}
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
