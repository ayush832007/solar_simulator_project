import { Link, useLocation } from "wouter";
import { Sun, FlaskConical, GitCompare, BookOpen, Moon, SunIcon } from "lucide-react";
import { useSimulationStore } from "@/lib/simulationStore";
import { useEffect } from "react";

const navItems = [
  { path: "/", label: "Simulator", icon: FlaskConical },
  { path: "/materials", label: "Materials", icon: Sun },
  { path: "/comparison", label: "Comparison", icon: GitCompare },
  { path: "/about", label: "About", icon: BookOpen },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { darkMode, toggleDarkMode } = useSimulationStore();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="w-60 flex-shrink-0 border-r border-border bg-sidebar flex flex-col">
        <div className="px-5 py-6 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sun className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <div className="font-serif font-bold text-sm text-foreground">SolarSim</div>
              <div className="text-[10px] text-muted-foreground tracking-widest uppercase">AI Simulator</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ path, label, icon: Icon }) => {
            const active = location === path;
            return (
              <Link
                key={path}
                href={path}
                data-testid={`nav-${label.toLowerCase()}`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-border">
          <button
            data-testid="button-toggle-theme"
            onClick={toggleDarkMode}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
          >
            {darkMode ? <SunIcon className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
