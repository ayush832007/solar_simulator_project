import { useState, useCallback } from "react";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  Legend,
} from "recharts";
import { useSimulationStore } from "@/lib/simulationStore";
import { MATERIAL_PRESETS } from "@/lib/solarPhysics";
import { computeEfficiencyVsTemperature, computeEfficiencyVsIrradiance } from "@/lib/solarPhysics";
import { Save, RotateCcw, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CHART_COLORS = {
  current: "#3b82f6",
  power: "#f59e0b",
  efficiency: "#10b981",
};

function MetricCard({ label, value, unit, sub }: { label: string; value: string; unit: string; sub?: string }) {
  return (
    <div data-testid={`metric-${label.toLowerCase().replace(/\s/g, "-")}`} className="bg-card border border-border rounded-xl p-4">
      <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">{label}</div>
      <div className="flex items-end gap-1.5">
        <span className="text-2xl font-serif font-bold text-foreground">{value}</span>
        <span className="text-sm text-muted-foreground mb-0.5">{unit}</span>
      </div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

function ParamSlider({
  label,
  value,
  min,
  max,
  step,
  unit,
  testId,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  testId: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground uppercase tracking-wider">{label}</Label>
        <span data-testid={`value-${testId}`} className="text-xs font-mono font-semibold text-primary">
          {value.toFixed(step < 1 ? 2 : 0)} {unit}
        </span>
      </div>
      <Slider
        data-testid={`slider-${testId}`}
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        className="w-full"
      />
    </div>
  );
}

export default function Simulator() {
  const { params, metrics, ivCurve, setParam, setParams, saveConfig } = useSimulationStore();
  const [saveName, setSaveName] = useState("");
  const [showSaveInput, setShowSaveInput] = useState(false);
  const { toast } = useToast();

  const mppPoint = ivCurve.find((pt) => Math.abs(pt.v - metrics.vmp) < 0.02) ?? { v: metrics.vmp, i: metrics.imp, p: metrics.pmax };

  const handleMaterialChange = useCallback(
    (material: string) => {
      const preset = MATERIAL_PRESETS[material];
      if (preset) {
        setParams({ material });
      }
    },
    [setParams]
  );

  const handleReset = () => {
    setParams({
      irradiance: 1000,
      temperature: 25,
      idealityFactor: 1.0,
      seriesResistance: 0.5,
      shuntResistance: 300,
      cellArea: 4,
      material: "silicon_mono",
    });
  };

  const handleSave = () => {
    if (!saveName.trim()) return;
    saveConfig(saveName.trim());
    setSaveName("");
    setShowSaveInput(false);
    toast({ title: "Configuration saved", description: `"${saveName}" added to comparison.` });
  };

  const tempData = computeEfficiencyVsTemperature(params);
  const irrData = computeEfficiencyVsIrradiance(params);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Solar Cell Simulator</h1>
          <p className="text-sm text-muted-foreground mt-0.5">One-diode model — real-time parameter simulation</p>
        </div>
        <div className="flex items-center gap-2">
          <Button data-testid="button-reset" variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Reset
          </Button>
          {!showSaveInput ? (
            <Button data-testid="button-save-open" size="sm" onClick={() => setShowSaveInput(true)}>
              <Save className="w-3.5 h-3.5 mr-1.5" />
              Save Config
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Input
                data-testid="input-save-name"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Config name..."
                className="h-8 w-40 text-sm"
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
              />
              <Button data-testid="button-save-confirm" size="sm" onClick={handleSave} disabled={!saveName.trim()}>
                Save
              </Button>
              <Button data-testid="button-save-cancel" variant="ghost" size="sm" onClick={() => setShowSaveInput(false)}>
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-3 space-y-5">
          <div className="bg-card border border-border rounded-xl p-5 space-y-5">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Material</div>
            <Select value={params.material} onValueChange={handleMaterialChange}>
              <SelectTrigger data-testid="select-material" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(MATERIAL_PRESETS).map(([key, preset]) => (
                  <SelectItem key={key} value={key}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 space-y-5">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Environmental</div>
            <ParamSlider label="Irradiance" value={params.irradiance} min={100} max={1000} step={10} unit="W/m²" testId="irradiance" onChange={(v) => setParam("irradiance", v)} />
            <ParamSlider label="Temperature" value={params.temperature} min={0} max={100} step={1} unit="°C" testId="temperature" onChange={(v) => setParam("temperature", v)} />
          </div>

          <div className="bg-card border border-border rounded-xl p-5 space-y-5">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Cell Parameters</div>
            <ParamSlider label="Ideality Factor (n)" value={params.idealityFactor} min={1.0} max={2.0} step={0.05} unit="" testId="ideality" onChange={(v) => setParam("idealityFactor", v)} />
            <ParamSlider label="Series Resistance (Rs)" value={params.seriesResistance} min={0} max={10} step={0.1} unit="Ω" testId="rs" onChange={(v) => setParam("seriesResistance", v)} />
            <ParamSlider label="Shunt Resistance (Rsh)" value={params.shuntResistance} min={10} max={1000} step={10} unit="Ω" testId="rsh" onChange={(v) => setParam("shuntResistance", v)} />
            <ParamSlider label="Cell Area" value={params.cellArea} min={1} max={100} step={1} unit="cm²" testId="area" onChange={(v) => setParam("cellArea", v)} />
          </div>
        </div>

        <div className="col-span-9 space-y-5">
          <div className="grid grid-cols-4 gap-3">
            <MetricCard label="Voc" value={metrics.voc.toFixed(3)} unit="V" sub="Open circuit voltage" />
            <MetricCard label="Isc" value={metrics.isc.toFixed(3)} unit="A" sub="Short circuit current" />
            <MetricCard label="Pmax" value={metrics.pmax.toFixed(3)} unit="W" sub={`Vmp=${metrics.vmp.toFixed(3)}V`} />
            <MetricCard label="Efficiency" value={metrics.efficiency.toFixed(2)} unit="%" sub={`FF=${metrics.fillFactor.toFixed(1)}%`} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground">I-V &amp; P-V Curve</h2>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={ivCurve} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                  <XAxis dataKey="v" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} label={{ value: "Voltage (V)", position: "insideBottom", offset: -2, fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis yAxisId="left" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} label={{ value: "Current (A)", angle: -90, position: "insideLeft", fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} label={{ value: "Power (W)", angle: 90, position: "insideRight", fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }}
                    formatter={(val: number, name: string) => [val.toFixed(4), name]}
                    labelFormatter={(v) => `V = ${parseFloat(v).toFixed(3)} V`}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line yAxisId="left" type="monotone" dataKey="i" name="Current (A)" stroke={CHART_COLORS.current} dot={false} strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="p" name="Power (W)" stroke={CHART_COLORS.power} dot={false} strokeWidth={2} strokeDasharray="5 3" />
                  <ReferenceDot yAxisId="left" x={parseFloat(mppPoint.v.toFixed(2))} y={parseFloat(mppPoint.i.toFixed(4))} r={5} fill={CHART_COLORS.power} stroke="none" label={{ value: "MPP", fill: CHART_COLORS.power, fontSize: 10 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="text-sm font-semibold text-foreground mb-4">Efficiency vs. Temperature</h2>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={tempData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                  <XAxis dataKey="temp" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} label={{ value: "Temperature (°C)", position: "insideBottom", offset: -2, fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} label={{ value: "Efficiency (%)", angle: -90, position: "insideLeft", fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }} formatter={(val: number) => [`${val.toFixed(2)}%`, "Efficiency"]} labelFormatter={(v) => `T = ${v}°C`} />
                  <Line type="monotone" dataKey="efficiency" stroke={CHART_COLORS.efficiency} dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 col-span-2">
              <h2 className="text-sm font-semibold text-foreground mb-4">Efficiency vs. Irradiance</h2>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={irrData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                  <XAxis dataKey="irr" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} label={{ value: "Irradiance (W/m²)", position: "insideBottom", offset: -2, fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} label={{ value: "Efficiency (%)", angle: -90, position: "insideLeft", fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }} formatter={(val: number) => [`${val.toFixed(2)}%`, "Efficiency"]} labelFormatter={(v) => `G = ${v} W/m²`} />
                  <Line type="monotone" dataKey="efficiency" stroke={CHART_COLORS.current} dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
