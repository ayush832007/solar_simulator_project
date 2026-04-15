import { useSimulationStore } from "@/lib/simulationStore";
import { MATERIAL_PRESETS } from "@/lib/solarPhysics";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { FlaskConical, ChevronRight } from "lucide-react";

interface MaterialInfo {
  key: string;
  name: string;
  efficiencyMin: number;
  efficiencyMax: number;
  vocRange: string;
  iscDensity: string;
  tempCoeff: string;
  costTier: "Low" | "Medium" | "High" | "Very High";
  advantages: string[];
  disadvantages: string[];
  color: string;
}

const MATERIALS: MaterialInfo[] = [
  {
    key: "silicon_mono",
    name: "Monocrystalline Silicon",
    efficiencyMin: 18,
    efficiencyMax: 26,
    vocRange: "0.60–0.70 V",
    iscDensity: "38–42 mA/cm²",
    tempCoeff: "-0.45%/°C",
    costTier: "Medium",
    advantages: ["Highest efficiency among Si", "Long lifespan (25+ years)", "Widely available"],
    disadvantages: ["Energy-intensive to manufacture", "Performance drops in indirect light"],
    color: "#3b82f6",
  },
  {
    key: "silicon_poly",
    name: "Polycrystalline Silicon",
    efficiencyMin: 15,
    efficiencyMax: 20,
    vocRange: "0.56–0.64 V",
    iscDensity: "34–38 mA/cm²",
    tempCoeff: "-0.45%/°C",
    costTier: "Low",
    advantages: ["Lower manufacturing cost", "Less energy to produce", "Widely deployed"],
    disadvantages: ["Lower efficiency than mono-Si", "Larger footprint per watt"],
    color: "#6366f1",
  },
  {
    key: "gaas",
    name: "Gallium Arsenide (GaAs)",
    efficiencyMin: 25,
    efficiencyMax: 40,
    vocRange: "1.00–1.15 V",
    iscDensity: "28–32 mA/cm²",
    tempCoeff: "-0.21%/°C",
    costTier: "Very High",
    advantages: ["Highest single-junction efficiency", "Excellent high-temp performance", "Radiation resistant"],
    disadvantages: ["Extremely expensive", "Toxic elements (As)", "Fragile"],
    color: "#8b5cf6",
  },
  {
    key: "perovskite",
    name: "Perovskite",
    efficiencyMin: 20,
    efficiencyMax: 33,
    vocRange: "1.00–1.20 V",
    iscDensity: "20–25 mA/cm²",
    tempCoeff: "-0.35%/°C",
    costTier: "Low",
    advantages: ["Rapid efficiency improvements", "Low-cost deposition", "Tunable bandgap"],
    disadvantages: ["Stability concerns", "Lead content (most types)", "Not yet commercialized at scale"],
    color: "#f59e0b",
  },
  {
    key: "cdte",
    name: "Cadmium Telluride (CdTe)",
    efficiencyMin: 16,
    efficiencyMax: 22,
    vocRange: "0.80–0.90 V",
    iscDensity: "24–28 mA/cm²",
    tempCoeff: "-0.30%/°C",
    costTier: "Low",
    advantages: ["Low manufacturing cost", "Good low-light performance", "Thin-film flexibility"],
    disadvantages: ["Cadmium is toxic", "Tellurium supply limited", "Lower efficiency than mono-Si"],
    color: "#10b981",
  },
  {
    key: "cigs",
    name: "CIGS",
    efficiencyMin: 19,
    efficiencyMax: 24,
    vocRange: "0.60–0.75 V",
    iscDensity: "30–35 mA/cm²",
    tempCoeff: "-0.36%/°C",
    costTier: "Medium",
    advantages: ["Flexible substrate possible", "High absorption coefficient", "Good low-light response"],
    disadvantages: ["Complex manufacturing", "Indium scarcity", "Lower stability over time"],
    color: "#06b6d4",
  },
  {
    key: "amorphous_si",
    name: "Amorphous Silicon",
    efficiencyMin: 6,
    efficiencyMax: 12,
    vocRange: "0.70–0.90 V",
    iscDensity: "12–16 mA/cm²",
    tempCoeff: "-0.20%/°C",
    costTier: "Low",
    advantages: ["Very cheap to produce", "Flexible and lightweight", "Good in low/diffuse light"],
    disadvantages: ["Lowest efficiency", "Staebler-Wronski degradation", "Large area needed"],
    color: "#94a3b8",
  },
];

const COST_COLORS: Record<string, string> = {
  Low: "text-emerald-500",
  Medium: "text-amber-500",
  High: "text-orange-500",
  "Very High": "text-red-500",
};

export default function Materials() {
  const { setParams } = useSimulationStore();
  const [, setLocation] = useLocation();

  const handleSimulate = (key: string) => {
    setParams({ material: key });
    setLocation("/");
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground">Materials Library</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Photovoltaic materials — properties and typical performance ranges</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {MATERIALS.map((mat) => (
          <div
            key={mat.key}
            data-testid={`card-material-${mat.key}`}
            className="bg-card border border-border rounded-xl p-5 hover:border-primary/40 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-1 rounded-full self-stretch flex-shrink-0" style={{ background: mat.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="font-serif font-bold text-foreground">{mat.name}</h2>
                    <span className={`text-xs font-medium ${COST_COLORS[mat.costTier]}`}>{mat.costTier} Cost</span>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-3">
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Efficiency</div>
                      <div className="text-sm font-semibold">{mat.efficiencyMin}–{mat.efficiencyMax}%</div>
                      <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(mat.efficiencyMax / 40) * 100}%`, background: mat.color }} />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Voc Range</div>
                      <div className="text-sm font-semibold">{mat.vocRange}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Isc Density</div>
                      <div className="text-sm font-semibold">{mat.iscDensity}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Temp Coeff</div>
                      <div className="text-sm font-semibold text-destructive">{mat.tempCoeff}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Advantages</div>
                      <ul className="space-y-0.5">
                        {mat.advantages.map((a, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-foreground">
                            <span className="text-emerald-500 mt-0.5 text-xs">+</span>{a}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Disadvantages</div>
                      <ul className="space-y-0.5">
                        {mat.disadvantages.map((d, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-foreground">
                            <span className="text-red-500 mt-0.5 text-xs">-</span>{d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                data-testid={`button-simulate-${mat.key}`}
                variant="outline"
                size="sm"
                onClick={() => handleSimulate(mat.key)}
                className="flex-shrink-0"
              >
                <FlaskConical className="w-3.5 h-3.5 mr-1.5" />
                Simulate
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
