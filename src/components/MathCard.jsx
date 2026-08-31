import { Accordion } from "@purpur/library";
import { kr } from "../lib/config";
import { speedLabel } from "../lib/plans";

// Two different reasons land in the same bucket, and the explanation has to
// cover the ones actually on screen: a kroner-only tier costs the same either
// way, while a tjeneste med kombinasjonskrav has no poengpris før verten er med.
function premiumReason(premium) {
  const kroner = premium.some(x => x.reason !== "requires");
  const requires = premium.filter(x => x.reason === "requires");
  const names = [...new Set(requires.map(x => x.name))].join(", ");
  return [
    kroner && "Telias pris er den samme som å betale tjenesten direkte, så poeng endrer ingenting her.",
    names && `${names} selges bare i kombinasjon med en annen tjeneste, og kan ikke dekkes av poeng alene.`,
  ].filter(Boolean).join(" ");
}

export function MathCard({ calc, pot, hasMobile, mobileBonus, extraPricePer10, plan }) {
  const c = calc;
  const a = c.active;
  const coveredValue = a.covered.reduce((x, y) => x + y.price, 0);

  return (
    <section className="app-card">
      <Accordion>
        <Accordion.Item title="Slik regnet vi">
          <div className="app-mathRow">
            <span>Du betaler i dag ({c.chosen.length} tjenester)</span>
            <span>{kr(c.totalPrice)} kr/md.</span>
          </div>
          <div className="app-mathRow">
            <span>Poengbehov</span>
            <span>{c.totalPoints} poeng</span>
          </div>
          <div className="app-mathRow">
            <span>Tilgjengelige poeng ({pot}{hasMobile ? ` + ${mobileBonus} mobil` : ""})</span>
            <span>{c.available} poeng</span>
          </div>
          {c.extraOffered && c.buy.capped && (
            <div className="app-mathRow">
              <span>Største pakke{hasMobile ? ` (inkl. ${mobileBonus} mobil)` : ""}</span>
              <span>{c.ceiling} poeng</span>
            </div>
          )}
          {plan && (
            <div className="app-mathRow">
              <span>{pot} TV-poeng på {speedLabel(plan.speed)} i {plan.family}</span>
              <span>{c.planCost > 0 ? `${kr(c.planCost)} kr/md.` : "Ingen kostnad"}</span>
            </div>
          )}
          <div className="app-mathDivider" />
          <div className="app-mathRow">
            <span>Verdi av tjenester dekket av poeng ({a.covered.length} stk.)</span>
            <span>{kr(coveredValue)} kr/md.</span>
          </div>
          <div className="app-mathRow">
            <span>
              − Kostnad for ekstra poeng ({a.extraPoints} p à {extraPricePer10} kr per 10)
              {a.extraName && <><br /><small>Pakken heter {a.extraName} hos Telia.</small></>}
            </span>
            <span>{kr(a.extraCost)} kr/md.</span>
          </div>
          {c.planCost > 0 && (
            <div className="app-mathRow">
              <span>− Tillegg for TV-poengene i fellesavtalen</span>
              <span>{kr(c.planCost)} kr/md.</span>
            </div>
          )}
          <div className="app-mathDivider" />
          <div className="app-mathRow app-mathSum">
            <span>Besparelse per måned</span>
            <span>{kr(a.savingMonth)} kr</span>
          </div>
          <div className="app-mathRow app-mathSum">
            <span>× 12 måneder</span>
            <span>{kr(a.savingMonth * 12)} kr/år</span>
          </div>
          {c.premium.length > 0 && (
            <>
              <div className="app-mathDivider" />
              <div className="app-mathRow">
                <span>
                  Betales i kroner ({c.premium.length} {c.premium.length === 1 ? "nivå" : "nivåer"})
                  <br />
                  <small>{premiumReason(c.premium)}</small>
                </span>
                <span>{kr(c.premiumCost)} kr/md.</span>
              </div>
            </>
          )}
        </Accordion.Item>
      </Accordion>
    </section>
  );
}
