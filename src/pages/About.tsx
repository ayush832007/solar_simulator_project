import { BookOpen, Cpu, Zap, TrendingUp } from "lucide-react";

export default function About() {
  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground">About SolarSim</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Solar cell physics and simulation methodology</p>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Cpu className="w-4 h-4 text-primary" />
            <h2 className="font-serif font-semibold text-foreground">The One-Diode Model</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            SolarSim uses the one-diode equivalent circuit model, also known as the Shockley diode model. This is the
            standard approach for modeling photovoltaic cells at the device level. The governing equation is:
          </p>
          <div className="mt-3 p-3 bg-muted rounded-lg font-mono text-xs text-foreground leading-relaxed">
            I = I_ph - I_0 * (exp((V + I*Rs) / (n*Vt)) - 1) - (V + I*Rs) / Rsh
          </div>
          <div className="mt-3 space-y-1 text-xs text-muted-foreground">
            <div><strong className="text-foreground">I_ph</strong> — photocurrent (proportional to irradiance)</div>
            <div><strong className="text-foreground">I_0</strong> — dark saturation current</div>
            <div><strong className="text-foreground">n</strong> — ideality factor (1 = ideal, 2 = recombination dominated)</div>
            <div><strong className="text-foreground">Vt</strong> — thermal voltage = kT/q ≈ 25.85 mV at 25°C</div>
            <div><strong className="text-foreground">Rs</strong> — series resistance (contact, bulk resistance)</div>
            <div><strong className="text-foreground">Rsh</strong> — shunt resistance (leakage paths)</div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-primary" />
            <h2 className="font-serif font-semibold text-foreground">Key Performance Metrics</h2>
          </div>
          <div className="space-y-3 text-sm">
            {[
              { label: "Voc — Open Circuit Voltage", desc: "The voltage at zero current. Determined by I_0 and I_ph. Decreases with temperature (~−0.45%/°C for Si)." },
              { label: "Isc — Short Circuit Current", desc: "The current at zero voltage. Directly proportional to irradiance and cell area. Slight positive temperature dependence." },
              { label: "MPP — Maximum Power Point", desc: "The operating point (Vmp, Imp) that maximizes output power P = V × I. Tracked by MPPT algorithms in real systems." },
              { label: "Fill Factor (FF)", desc: "FF = Pmax / (Voc × Isc). Measures how 'square' the I-V curve is. Higher Rs and lower Rsh reduce FF. Typically 0.70–0.85 for good cells." },
              { label: "Efficiency (η)", desc: "η = Pmax / (G × Area). The ratio of electrical output to incident solar power. Measured under STC (1000 W/m², 25°C, AM1.5G)." },
            ].map(({ label, desc }) => (
              <div key={label}>
                <div className="font-semibold text-foreground text-xs">{label}</div>
                <div className="text-muted-foreground text-xs mt-0.5 leading-relaxed">{desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h2 className="font-serif font-semibold text-foreground">Temperature Effects</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Temperature is the most significant environmental factor affecting solar cell performance. In silicon cells:
          </p>
          <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
            <li className="flex gap-2"><span className="text-red-500 font-bold">-</span><span>Voc decreases by ~−2.3 mV/°C (approximately −0.35%/°C)</span></li>
            <li className="flex gap-2"><span className="text-emerald-500 font-bold">+</span><span>Isc increases slightly by ~+0.05%/°C (bandgap narrowing)</span></li>
            <li className="flex gap-2"><span className="text-red-500 font-bold">-</span><span>Net effect: efficiency decreases by approximately −0.45%/°C</span></li>
            <li className="flex gap-2"><span className="text-amber-500 font-bold">!</span><span>In practice, cell temperature can be 25–40°C above ambient</span></li>
          </ul>
          <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
            GaAs cells have a much lower temperature coefficient (−0.21%/°C), which is why they are preferred in space applications where temperature extremes are common.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-primary" />
            <h2 className="font-serif font-semibold text-foreground">Numerical Method</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The one-diode equation is implicit — current I appears on both sides. SolarSim solves it numerically using
            the Newton-Raphson iteration:
          </p>
          <div className="mt-3 p-3 bg-muted rounded-lg font-mono text-xs text-foreground leading-relaxed">
            I_new = I - f(I) / f'(I)<br /><br />
            f(I) = I - I_ph + I_0*(exp(...)-1) + ...<br />
            f'(I) = 1 + (I_0*Rs/(n*Vt))*exp(...) + Rs/Rsh
          </div>
          <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
            The iteration converges in typically 5–10 steps to a tolerance of 10⁻⁹ A. This is applied at 100 voltage
            points from 0 to Voc to generate the full I-V curve. Voc is found using bisection search.
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="font-serif font-semibold text-foreground mb-3">Standard Test Conditions (STC)</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          All solar cell efficiency ratings are measured under Standard Test Conditions: irradiance = 1000 W/m², cell temperature = 25°C, and AM1.5G spectrum.
          In practice, real-world yield is typically 75–85% of STC-rated power due to temperature, partial shading, soiling, and spectral mismatch.
          SolarSim defaults to STC. Adjust the irradiance and temperature sliders to explore real-world operating conditions.
        </p>
      </div>
    </div>
  );
}
