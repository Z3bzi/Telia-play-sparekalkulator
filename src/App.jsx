import { useEffect, useMemo, useRef, useState } from "react";
import { Heading, Paragraph, ThemeProvider } from "@purpur/library";
import { IconPebble } from "@purpur/library/icon/pebble";
import { kr, loadConfig, persistConfig } from "./lib/config";
import { calculate } from "./lib/calc";
import { decodeState, encodeState } from "./lib/url-state";
import { defaultSpeed, planCost, planExtraOptions, tiersForSpeed } from "./lib/plans";
import { Header } from "./components/Header";
import { SiteBanner } from "./components/SiteBanner";
import { PlanCard } from "./components/PlanCard";
import { PlansPage } from "./components/PlansPage";
import { PotCard } from "./components/PotCard";
import { ServicesCard } from "./components/ServicesCard";
import { SiteFooter } from "./components/SiteFooter";
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

  const [view, setView] = useState(() => initial.view ?? "calc");
  const [plan, setPlan] = useState(() => initial.plan ?? null);
  const [plansFilter, setPlansFilter] = useState(() => initial.plan?.family ?? null);
  const [pot, setPot] = useState(() =>
    initial.pot ??
    (config.pots.some(p => p.points === config.defaultPot)
      ? config.defaultPot
      : (config.pots[config.pots.length - 1]?.points ?? 0)),
  );
  const [hasMobile, setHasMobile] = useState(() => initial.hasMobile ?? false);
  const [selections, setSelections] = useState(() => initial.selections ?? {});
  const [addons, setAddons] = useState(() => initial.addons ?? {});
  // null means "follow the recommendation" until the user picks explicitly.
  const [altChoice, setAltChoice] = useState(() => initial.altMode ?? null);
  const [pinOpen, setPinOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const resultRef = useRef(null);

  // With a fellesavtale in play the pakkevalget comes from prisarket — the
  // TV-poeng that avtalen offers at the chosen hastighet, and what each of them
  // costs. Without one it stays the løse poengpakkene from admin.
  const planTiers = useMemo(
    () => (plan ? tiersForSpeed(plan.family, plan.speed) : null),
    [plan],
  );

  // What the chosen kombinasjonen adds to the monthly bill. A kombinasjon the
  // avtalen doesn't offer has no price at all; it is treated as free here and
  // called out in the pakkevalget instead, so the sum never invents a number.
  const currentPlanCost = plan ? (planCost(plan.family, plan.speed, pot) ?? 0) : 0;

  // How far the "kjøp ekstra poeng"-konseptet strekker seg, uansett kilde:
  // den samme grensen de løse SDU-pakkene bruker (60-poengspakken + den
  // største ekstrapoeng-bolken), så en fellesavtale ikke ekstrapoleres i det
  // uendelige.
  const planCeiling = useMemo(() => {
    const base = Number(config.extraBase) || 0;
    const maxStep = (config.extraSteps ?? []).reduce((m, s) => Math.max(m, Number(s.points) || 0), 0);
    return base + maxStep;
  }, [config]);

  // Med en fellesavtale kommer "kjøp ekstra poeng" fra avtalens eget
  // prisark — ekte rader der de finnes, ekstrapolert fra avtalens egen
  // kr/poeng forbi det — i stedet for de løse SDU-pakkenes flate sats.
  // Uten avtale (SDU-modus) er dette null, og calculate() faller tilbake
  // til den flate satsen som før.
  const planOptions = useMemo(() => {
    if (!plan) return null;
    return planExtraOptions(plan.family, plan.speed, pot, currentPlanCost, planCeiling);
  }, [plan, pot, currentPlanCost, planCeiling]);

  // Which pakke leaves the most igjen once it is paid for. Worth surfacing
  // precisely because the answer is not "the biggest one": a pakke that costs
  // 389 kr/md. has to save more than that before it beats the free one.
  const bestPoints = useMemo(() => {
    if (!planTiers || !Object.keys(selections).length) return null;
    let best = null;
    for (const t of planTiers) {
      if (!t.available) continue;
      const tPlanOptions = plan
        ? planExtraOptions(plan.family, plan.speed, t.points, t.price, planCeiling)
        : null;
      const c = calculate(config, {
        pot: t.points, hasMobile, selections, addons, altMode: "buy", planCost: t.price,
        planOptions: tPlanOptions,
      });
      // The user is free to pick either alternative when the pakke overflows,
      // so a pakke is judged by the better of the two.
      const value = Math.max(c.buy.savingMonth, c.fit?.savingMonth ?? -Infinity);
      if (!best || value > best.value) best = { points: t.points, value };
    }
    return best?.points ?? null;
  }, [planTiers, config, hasMobile, selections, addons, plan, planCeiling]);

  const potOptions = useMemo(() => {
    if (!planTiers) return config.pots;
    return planTiers.map(t => ({
      points: t.points,
      disabled: !t.available,
      priceLabel: t.priceType === "included" ? "Ingen kostnad" : `${kr(t.price)} kr/md.`,
      best: t.available && t.points === bestPoints,
    }));
  }, [planTiers, config.pots, bestPoints]);

  // Changing avtale or hastighet can take the current pakke off the table.
  // Move up to the nearest one still offered rather than down, so the poeng the
  // user had do not quietly shrink.
  useEffect(() => {
    if (potOptions.some(p => p.points === pot && !p.disabled)) return;
    const usable = potOptions.filter(p => !p.disabled);
    if (!usable.length) return;
    setPot((usable.find(p => p.points >= pot) ?? usable[usable.length - 1]).points);
  }, [potOptions, pot]);

  const recommended = useMemo(
    () => calculate(config, {
      pot, hasMobile, selections, addons, altMode: "buy", planCost: currentPlanCost, planOptions,
    }).recommended,
    [config, pot, hasMobile, selections, addons, currentPlanCost, planOptions],
  );
  const altMode = altChoice ?? recommended;

  const calc = useMemo(
    () => calculate(config, {
      pot, hasMobile, selections, addons, altMode, planCost: currentPlanCost, planOptions,
    }),
    [config, pot, hasMobile, selections, addons, altMode, currentPlanCost, planOptions],
  );

  // Keep the URL in step with the current selection without adding history
  // entries for every checkbox click.
  useEffect(() => {
    const encoded = encodeState({ pot, hasMobile, selections, addons, altChoice, view, plan });
    const next = `${window.location.pathname}${window.location.search}#${encoded}`;
    window.history.replaceState(null, "", next);
  }, [pot, hasMobile, selections, addons, altChoice, view, plan]);

  const goTo = next => {
    setView(next);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const usePlanFamily = family => {
    setPlan({ family, speed: defaultSpeed(family, pot) });
    setPlansFilter(family);
    goTo("calc");
  };

  const toggleService = id => {
    setSelections(prev => {
      const next = { ...prev };
      if (next[id] !== undefined) delete next[id];
      else next[id] = 0;
      return next;
    });
    // Tillegg cannot outlive the service they sit on.
    setAddons(prev => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const toggleAddon = (serviceId, addonId) => {
    setAddons(prev => {
      const current = prev[serviceId] ?? [];
      const next = current.includes(addonId)
        ? current.filter(a => a !== addonId)
        : [...current, addonId];
      if (!next.length) {
        const rest = { ...prev };
        delete rest[serviceId];
        return rest;
      }
      return { ...prev, [serviceId]: next };
    });
  };

  const setServiceLevel = (id, levelIndex) => {
    setSelections(prev => ({ ...prev, [id]: levelIndex }));
  };

  const handleAdminSave = next => {
    const saved = persistConfig(next);
    setConfig(saved);
    const cleanedSelections = {};
    const cleanedAddons = {};
    for (const s of saved.services) {
      if (selections[s.id] === undefined) continue;
      cleanedSelections[s.id] = Math.min(selections[s.id], s.levels.length - 1);
      const kept = (addons[s.id] ?? []).filter(a => (s.addons ?? []).some(x => x.id === a));
      if (kept.length) cleanedAddons[s.id] = kept;
    }
    setSelections(cleanedSelections);
    setAddons(cleanedAddons);
    // With a fellesavtale chosen the pakkene come from prisarket, not from
    // admin, so the saved list has no say over the current one.
    if (!plan && !saved.pots.some(p => p.points === pot) && saved.pots.length) {
      setPot(saved.pots.some(p => p.points === saved.defaultPot)
        ? saved.defaultPot
        : saved.pots[saved.pots.length - 1].points);
    }
  };

  // A kroner-only tier saves nothing, and neither does one that only comes
  // bundled with another, but both are still selections: the results column has
  // to explain that rather than sit on the empty state.
  const hasSelection = calc.chosen.length + calc.premium.length + calc.included.length > 0;

  return (
    <ThemeProvider forceColorScheme="light">
      <SiteBanner />
      <Header onAdminTap={() => setPinOpen(true)} view={view} onViewChange={goTo} />

      {view === "plans" ? (
        <PlansPage
          family={plansFilter}
          onFamilyChange={setPlansFilter}
          onUsePlan={usePlanFamily}
          onBack={() => goTo("calc")}
        />
      ) : (
        <main className="app-stack">
          <div className="app-col">
            <PlanCard
              plan={plan}
              pot={pot}
              onPlanChange={setPlan}
              onShowPlans={() => goTo("plans")}
            />
            <PotCard
              pots={potOptions}
              pot={pot}
              onPotChange={setPot}
              showPotPrices={config.showPotPrices}
              mobileBonus={config.mobileBonus}
              hasMobile={hasMobile}
              onMobileChange={setHasMobile}
              plan={plan}
            />
            <ServicesCard
              services={config.services}
              selections={selections}
              addons={addons}
              bundle={calc.bundle}
              onToggle={toggleService}
              onLevelChange={setServiceLevel}
              onAddonToggle={toggleAddon}
            />
          </div>

          {/* The sticky column lives one level in: a sticky grid item is clamped
              to the grid container, not to its own row, so it would slide down
              over the footer. Stretched wrapper, sticky child, clamped to the
              row it belongs to. */}
          <div className="app-colResults">
            <div className="app-col app-colSticky">
            {hasSelection ? (
              <>
                <ResultCard ref={resultRef} savingMonth={calc.active.savingMonth} />
                <UsageCard calc={calc} altMode={altMode} onAltModeChange={setAltChoice} plan={plan} />
                <MathCard
                  calc={calc}
                  pot={pot}
                  hasMobile={hasMobile}
                  mobileBonus={config.mobileBonus}
                  extraPricePer10={config.extraPricePer10}
                  plan={plan}
                />
              </>
            ) : (
              <section className="app-card app-emptyCard">
                <span className="app-emptyMark" aria-hidden="true"><IconPebble size="lg" /></span>
                <Heading tag="h2" variant="title-100">Klar når du er</Heading>
                <Paragraph variant="paragraph-100">
                  Kryss av tjenestene du betaler for i dag, så regner vi ut hva du kan spare.
                </Paragraph>
              </section>
            )}
            </div>
          </div>

          <SiteFooter>
            Veiledende priser per august 2026. Sjekk gjeldende pris hos den enkelte tjenesten.
          </SiteFooter>
        </main>
      )}

      {view === "calc" && hasSelection && (
        <StickyBar
          savingMonth={calc.active.savingMonth}
          targetRef={resultRef}
          suppressed={pinOpen || adminOpen}
        />
      )}

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
