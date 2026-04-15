export interface SolarParams {
  irradiance: number;
  temperature: number;
  idealityFactor: number;
  seriesResistance: number;
  shuntResistance: number;
  cellArea: number;
  material: string;
}

export interface SolarMetrics {
  voc: number;
  isc: number;
  vmp: number;
  imp: number;
  pmax: number;
  fillFactor: number;
  efficiency: number;
}

export interface IVPoint {
  v: number;
  i: number;
  p: number;
}

// Jsc in mA/cm², Voc in V — reference values at 1000 W/m², 25°C
export const MATERIAL_PRESETS: Record<string, { jsc: number; voc: number; label: string }> = {
  silicon_mono: { jsc: 38.0, voc: 0.65, label: "Monocrystalline Silicon" },
  silicon_poly: { jsc: 35.5, voc: 0.61, label: "Polycrystalline Silicon" },
  gaas: { jsc: 29.0, voc: 1.05, label: "Gallium Arsenide (GaAs)" },
  perovskite: { jsc: 22.0, voc: 1.10, label: "Perovskite" },
  cdte: { jsc: 25.0, voc: 0.85, label: "Cadmium Telluride (CdTe)" },
  cigs: { jsc: 32.0, voc: 0.68, label: "CIGS" },
  amorphous_si: { jsc: 14.0, voc: 0.80, label: "Amorphous Silicon" },
};

const q = 1.602e-19;
const k = 1.381e-23;

export function computeSolarMetrics(params: SolarParams): { metrics: SolarMetrics; ivCurve: IVPoint[] } {
  const { irradiance, temperature, idealityFactor, seriesResistance, shuntResistance, cellArea, material } = params;
  const preset = MATERIAL_PRESETS[material] ?? MATERIAL_PRESETS.silicon_mono;

  const T = temperature + 273.15;
  const Vt = (k * T) / q;
  const G_ref = 1000;
  const dT = temperature - 25;

  // Convert Jsc (mA/cm²) to Isc (A) based on area, scale with irradiance and temperature
  const tempCoeffCurrent = 0.0005; // +0.05%/°C
  const tempCoeffVoltage = -0.0023; // -2.3mV/°C

  const Iph_adj = (preset.jsc / 1000) * cellArea * (irradiance / G_ref) * (1 + tempCoeffCurrent * dT);
  const Voc_base = Math.max(0.01, preset.voc + tempCoeffVoltage * dT);

  const I0 = Iph_adj / (Math.exp(Voc_base / (idealityFactor * Vt)) - 1);

  function computeI(V: number): number {
    let I = Iph_adj;
    for (let iter = 0; iter < 15; iter++) {
      const exponent = (V + I * seriesResistance) / (idealityFactor * Vt);
      const exp_term = exponent > 700 ? Math.exp(700) : Math.exp(exponent);
      const f = I - Iph_adj + I0 * (exp_term - 1) + (V + I * seriesResistance) / shuntResistance;
      const df = 1 + I0 * (seriesResistance / (idealityFactor * Vt)) * exp_term + seriesResistance / shuntResistance;
      const dI = f / df;
      I = I - dI;
      if (Math.abs(dI) < 1e-12) break;
    }
    return Math.max(0, I);
  }

  const isc = computeI(0);

  const voc = (() => {
    let vLow = 0;
    let vHigh = Voc_base * 1.05;
    for (let i = 0; i < 60; i++) {
      const vMid = (vLow + vHigh) / 2;
      if (computeI(vMid) > 1e-9) vLow = vMid;
      else vHigh = vMid;
    }
    return (vLow + vHigh) / 2;
  })();

  const ivCurve: IVPoint[] = [];
  const numPoints = 100;
  let pmax = 0;
  let vmp = 0;
  let imp = 0;

  for (let j = 0; j <= numPoints; j++) {
    const v = (voc * j) / numPoints;
    const i = computeI(v);
    const p = v * i;
    ivCurve.push({ v: parseFloat(v.toFixed(4)), i: parseFloat(i.toFixed(5)), p: parseFloat(p.toFixed(5)) });
    if (p > pmax) {
      pmax = p;
      vmp = v;
      imp = i;
    }
  }

  const fillFactor = isc > 0 && voc > 0 ? pmax / (isc * voc) : 0;
  // Area in cm², irradiance in W/m² → convert area to m²: cm² × 1e-4
  const efficiency = irradiance > 0 && cellArea > 0 ? (pmax / (irradiance * cellArea * 1e-4)) * 100 : 0;

  return {
    metrics: {
      voc: parseFloat(voc.toFixed(4)),
      isc: parseFloat(isc.toFixed(4)),
      vmp: parseFloat(vmp.toFixed(4)),
      imp: parseFloat(imp.toFixed(4)),
      pmax: parseFloat(pmax.toFixed(4)),
      fillFactor: parseFloat((fillFactor * 100).toFixed(2)),
      efficiency: parseFloat(efficiency.toFixed(2)),
    },
    ivCurve,
  };
}

export function computeEfficiencyVsTemperature(params: SolarParams): { temp: number; efficiency: number }[] {
  const results = [];
  for (let temp = -10; temp <= 80; temp += 5) {
    const { metrics } = computeSolarMetrics({ ...params, temperature: temp });
    results.push({ temp, efficiency: metrics.efficiency });
  }
  return results;
}

export function computeEfficiencyVsIrradiance(params: SolarParams): { irr: number; efficiency: number }[] {
  const results = [];
  for (let irr = 100; irr <= 1100; irr += 100) {
    const { metrics } = computeSolarMetrics({ ...params, irradiance: irr });
    results.push({ irr, efficiency: metrics.efficiency });
  }
  return results;
}
