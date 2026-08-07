import { useMemo, useState } from "react";
import { ThemeProvider } from "@purpur/library";
import { loadConfig, persistConfig } from "./lib/config";
import { calculate } from "./lib/calc";
import { Header } from "./components/Header";
import { PotCard } from "./components/PotCard";
import { ServicesCard } from "./components/ServicesCard";
import { UsageCard } from "./components/UsageCard";
import { ResultCard } from "./components/ResultCard";
import { MathCard } from "./components/MathCard";
import { PinModal } from "./components/PinModal";
import { AdminModal } from "./components/AdminModal";

export const App = () => {
  const [config, setConfig] = useState(loadConfig);
  const [pot, setPot] = useState(() =>
    config.pots.includes(config.defaultPot) ? config.defaultPot : (config.pots[config.pots.length - 1] ?? 0),
  );
  const [hasMobile, setHasMobile] = useState(false);
  const [selections, setSelections] = useState({});
  const [altMode, setAltMode] = useState("buy");
  const [pinOpen, setPinOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  const calc = useMemo(
    () => calculate(config, { pot, hasMobile, selections, altMode }),
    [config, pot, hasMobile, selections, altMode],
  );

  const toggleService = id => {
    setSelections(prev => {
      const next = { ...prev };
      if (next[id] !== undefined) delete next[id];
      else next[id] = 0;
      return next;
    });
  };

  const setServiceLevel = (id, levelIndex) => {
    setSelections(prev => ({ ...prev, [id]: levelIndex }));
  };

  const handleAdminSave = next => {
    const saved = persistConfig(next);
    setConfig(saved);
    const cleanedSelections = {};
    for (const s of saved.services) {
      if (selections[s.id] !== undefined) {
        cleanedSelections[s.id] = Math.min(selections[s.id], s.levels.length - 1);
      }
    }
    setSelections(cleanedSelections);
    if (!saved.pots.includes(pot) && saved.pots.length) {
      setPot(saved.pots.includes(saved.defaultPot) ? saved.defaultPot : saved.pots[saved.pots.length - 1]);
    }
  };

  return (
    <ThemeProvider forceColorScheme="light">
      <Header onAdminTap={() => setPinOpen(true)} />

      <main className="app-stack">
        <div className="app-col">
          <PotCard
            pots={config.pots}
            pot={pot}
            onPotChange={setPot}
            mobileBonus={config.mobileBonus}
            hasMobile={hasMobile}
            onMobileChange={setHasMobile}
          />
          <ServicesCard
            services={config.services}
            selections={selections}
            onToggle={toggleService}
            onLevelChange={setServiceLevel}
          />
        </div>

        <div className="app-col app-colResults">
          {calc.chosen.length > 0 ? (
            <>
              <UsageCard
                calc={calc}
                pot={pot}
                hasMobile={hasMobile}
                mobileBonus={config.mobileBonus}
                altMode={altMode}
                onAltModeChange={setAltMode}
              />
              <ResultCard savingMonth={calc.active.savingMonth} />
              <MathCard
                calc={calc}
                pot={pot}
                hasMobile={hasMobile}
                mobileBonus={config.mobileBonus}
                extraPricePer10={config.extraPricePer10}
              />
            </>
          ) : (
            <section className="app-card app-emptyCard">
              Kryss av tjenestene du betaler for i dag, så regner vi ut hva du kan spare.
            </section>
          )}
        </div>

        <footer className="app-foot">Veiledende priser per august 2026. Sjekk gjeldende pris hos den enkelte tjenesten.</footer>
      </main>

      <PinModal
        open={pinOpen}
        onOpenChange={setPinOpen}
        correctPin={config.pin}
        onSuccess={() => { setPinOpen(false); setAdminOpen(true); }}
      />
      <AdminModal
        open={adminOpen}
        onOpenChange={setAdminOpen}
        config={config}
        onSave={handleAdminSave}
      />
    </ThemeProvider>
  );
};
