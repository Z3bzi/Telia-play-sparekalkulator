import { Heading, Select } from "@purpur/library";
import { IconArrowRight } from "@purpur/library/icon/arrow-right";
import { kr } from "../lib/config";
import { defaultSpeed, listFamilies, listSpeeds, planCost, speedLabel } from "../lib/plans";

const NONE = "";

/**
 * Fellesavtalen the borettslag has with Telia. Picking one is optional: without
 * it the calculator runs on the poengpakkene from admin, which is what it did
 * before the prisarket was available. With one, the TV-poeng the avtalen
 * actually offers take over as the pakkevalg, and what kombinasjonen koster ut
 * over avtalen becomes part of regnestykket.
 */
export function PlanCard({ plan, pot, onPlanChange, onShowPlans }) {
  const families = listFamilies();
  const speeds = plan ? listSpeeds(plan.family) : [];
  const cost = plan ? planCost(plan.family, plan.speed, pot) : null;

  const chooseFamily = family => {
    if (!family) return onPlanChange(null);
    onPlanChange({ family, speed: defaultSpeed(family, pot, plan?.speed) });
  };

  return (
    <section className="app-card">
      <div className="app-planHead">
        <Heading tag="h2" variant="subsection-100">Fellesavtalen din</Heading>
        <button type="button" className="app-planLink" onClick={onShowPlans}>
          Se alle avtaler
          <IconArrowRight size="sm" />
        </button>
      </div>

      <div className="app-planFields">
        <Select
          id="plan-family"
          label="Avtale i borettslaget"
          options={[
            { label: "Vet ikke / velg selv", value: NONE },
            ...families.map(f => ({ label: f, value: f })),
          ]}
          value={plan?.family ?? NONE}
          onChange={e => chooseFamily(e.target.value)}
        />
        {plan && (
          <Select
            id="plan-speed"
            label="Bredbåndshastighet"
            options={speeds.map(s => ({ label: speedLabel(s), value: String(s) }))}
            value={String(plan.speed)}
            onChange={e => onPlanChange({ ...plan, speed: Number(e.target.value) })}
          />
        )}
      </div>

      <p className="app-planNote">
        {!plan ? (
          <>Uten avtale regner vi på poengpakkene under. Velger du avtalen borettslaget har,
          henter vi TV-poengene og prisene rett fra prisarket.</>
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
