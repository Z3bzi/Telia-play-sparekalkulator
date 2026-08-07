import { useEffect, useMemo, useRef, useState } from "react";
import { Heading, Paragraph, ThemeProvider } from "@purpur/library";
import { loadConfig, persistConfig } from "./lib/config";
import { calculate } from "./lib/calc";
import { decodeState, encodeState } from "./lib/url-state";
import { Header } from "./components/Header";
import { PotCard } from "./components/PotCard";
import { ServicesCard } from "./components/ServicesCard";
import { UsageCard } from "./components/UsageCard";
import { ResultCard } from "./components/ResultCard";
import { MathCard } from "./components/MathCard";
import { StickyBar } from "./components/StickyBar";
import { PinModal } from "./components/PinModal";
import { AdminModal } from "./components/AdminModal";

export const App = () => {
  const [config, setConfig] = useState(loadConfig);

  // A shared link wins over the defaults, so read it once on mount.
  const initial = useMemo(
    () => decodeState(window.location.hash, config) ?? {},
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [pot, setPot] = useState(() =>
    initial.pot ??
    (config.pots.includes(config.defaultPot) ? config.defaultPot : (config.pots[config.pots.length - 1] ?? 0)),
  );
  const [hasMobile, setHasMobile] = useState(() => initial.hasMobile ?? false);
  const [selections, setSelections] = useState(() => initial.selections ?? {});
  // null means "follow the recommendation" until the user picks explicitly.
  const [altChoice, setAltChoice] = useState(() => initial.altMode ?? null);
  const [pinOpen, setPinOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const resultRef = useRef(null);

  const recommended = useMemo(
    () => calculate(config, { pot, hasMobile, selections, altMode: "buy" }).recommended,
    [config, pot, hasMobile, selections],
  );
  const altMode = altChoice ?? recommended;

  const calc = useMemo(
    () => calculate(config, { pot, hasMobile, selections, altMode }),
    [config, pot, hasMobile, selections, altMode],
  );

  // Keep the URL in step with the current selection without adding history
  // entries for every checkbox click.
  useEffect(() => {
    const encoded = encodeState({ pot, hasMobile, selections, altChoice });
    const next = `${window.location.pathname}${window.location.search}#${encoded}`;
    window.history.replaceState(null, "", next);
  }, [pot, hasMobile, selections, altChoice]);

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

  const hasSelection = calc.chosen.length > 0;

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
          {hasSelection ? (
            <>
              <ResultCard ref={resultRef} savingMonth={calc.active.savingMonth} />
              <UsageCard calc={calc} altMode={altMode} onAltModeChange={setAltChoice} />
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
              <span className="app-emptyMark" aria-hidden="true">kr</span>
              <Heading tag="h2" variant="title-100">Klar når du er</Heading>
              <Paragraph variant="paragraph-100">
                Kryss av tjenestene du betaler for i dag, så regner vi ut hva du kan spare.
              </Paragraph>
            </section>
          )}
        </div>

        <footer className="app-foot">Veiledende priser per august 2026. Sjekk gjeldende pris hos den enkelte tjenesten.</footer>
      </main>

      {hasSelection && <StickyBar savingMonth={calc.active.savingMonth} targetRef={resultRef} />}

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
