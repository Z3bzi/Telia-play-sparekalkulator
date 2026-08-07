import { Accordion } from "@purpur/library";
import { kr } from "../lib/config";

export function MathCard({ calc, pot, hasMobile, mobileBonus, extraPricePer10 }) {
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
          <div className="app-mathDivider" />
          <div className="app-mathRow">
            <span>Verdi av tjenester dekket av poeng</span>
            <span>{kr(coveredValue)} kr/md.</span>
          </div>
          <div className="app-mathRow">
            <span>− Kostnad for ekstra poeng ({a.extraPoints} p à {extraPricePer10} kr per 10)</span>
            <span>{kr(a.extraCost)} kr/md.</span>
          </div>
          <div className="app-mathDivider" />
          <div className="app-mathRow app-mathSum">
            <span>Besparelse per måned</span>
            <span>{kr(a.savingMonth)} kr</span>
          </div>
          <div className="app-mathRow app-mathSum">
            <span>× 12 måneder</span>
            <span>{kr(a.savingMonth * 12)} kr/år</span>
          </div>
        </Accordion.Item>
      </Accordion>
    </section>
  );
}
