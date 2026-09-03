import { useRef } from "react";
import { Heading, Select } from "@purpur/library";
import { IconArrowRight } from "@purpur/library/icon/arrow-right";
import { kr } from "../lib/config";
import { defaultSpeed, listFamilies, listSpeeds, planCost, speedLabel } from "../lib/plans";

/**
 * Avtalen the borettslag has with Telia. Picking one is optional: without it
 * the calculator runs on the poengpakkene from admin (SDU — samme som en
 * enkeltkunde uten borettslag ville sett), which is what it did before the
 * prisarket was available. With one (MDU), the TV-poeng the avtalen actually
 * offers take over as the pakkevalg, and what kombinasjonen koster ut over
 * avtalen becomes part of regnestykket.
 *
 * Kalkulator/Avtale-bryteren gjør hvilken modus som er valgt eksplisitt —
 * tidligere lå det bare i om en avtale var valgt i en nedtrekksmeny.
 */
export function PlanCard({ plan, pot, onPlanChange, onShowPlans }) {
  const families = listFamilies();
  const speeds = plan ? listSpeeds(plan.family) : [];
  const cost = plan ? planCost(plan.family, plan.speed, pot) : null;

  // Husker siste avtale, slik at det å bytte tilbake til Avtale-modus
  // gjenoppretter den — i stedet for å tvinge et nytt valg hver gang.
  const lastPlan = useRef(null);
  if (plan) lastPlan.current = plan;

  const chooseFamily = family => {
    onPlanChange({ family, speed: defaultSpeed(family, pot, plan?.speed) });
  };

  const setMode = mode => {
    if (mode === "calc") {
      onPlanChange(null);
    } else if (!plan) {
      const restored = lastPlan.current
        ?? { family: families[0], speed: defaultSpeed(families[0], pot) };
      onPlanChange(restored);
    }
  };

  const mode = plan ? "avtale" : "calc";

  return (
    <section className="app-card">
      <div className="app-planHead">
        <Heading tag="h2" variant="subsection-100">Avtalen din</Heading>
        <button type="button" className="app-planLink" onClick={onShowPlans}>
          Se alle avtaler
          <IconArrowRight size="sm" />
        </button>
      </div>

      <div className="app-modeToggle" role="radiogroup" aria-label="Kalkulator eller avtale">
        <button
          type="button"
          role="radio"
          aria-checked={mode === "calc"}
          className={`app-modeBtn${mode === "calc" ? " app-modeOn" : ""}`}
          onClick={() => setMode("calc")}
        >
          Kalkulator
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={mode === "avtale"}
          className={`app-modeBtn${mode === "avtale" ? " app-modeOn" : ""}`}
          onClick={() => setMode("avtale")}
        >
          Avtale
        </button>
      </div>

      {plan && (
        <div className="app-planFields">
          <Select
            id="plan-family"
            label="Avtale i borettslaget"
            options={families.map(f => ({ label: f, value: f }))}
            value={plan.family}
            onChange={e => chooseFamily(e.target.value)}
          />
          <Select
            id="plan-speed"
            label="Bredbåndshastighet"
            options={speeds.map(s => ({ label: speedLabel(s), value: String(s) }))}
            value={String(plan.speed)}
            onChange={e => onPlanChange({ ...plan, speed: Number(e.target.value) })}
          />
        </div>
      )}

      <p className="app-planNote">
        {!plan ? (
          <>I kalkulator-modus regner vi på poengpakkene under, som en enkeltkunde uten
          borettslag ville sett. Velg <strong>Avtale</strong> over for å hente TV-poengene
          og prisene rett fra borettslagets prisark i stedet.</>
        ) : cost === null ? (
          <>Denne kombinasjonen tilbys ikke i {plan.family}. Velg en pakke under som er
          tilgjengelig på {speedLabel(plan.speed)}.</>
        ) : cost === 0 ? (
          <><strong>Ingen kostnad</strong> — {speedLabel(plan.speed)} med {pot} TV-poeng ligger
          i rammen for {plan.family}.</>
        ) : (
          <>{speedLabel(plan.speed)} med {pot} TV-poeng koster <strong>{kr(cost)} kr/md.</strong> ut
          over {plan.family}. Lavere hastighet gir flere TV-poeng uten tillegg.</>
        )}
      </p>
    </section>
  );
}
