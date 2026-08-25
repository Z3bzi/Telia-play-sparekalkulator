import { forwardRef } from "react";
import { kr } from "../lib/config";
import { useCountUp } from "../hooks/useCountUp";

/**
 * Poeng are not always free: extra ones are bought by the ten, and a
 * fellesavtale can charge for the TV-poeng themselves. When they cost more than
 * the tjenestene they cover, the card says so outright rather than printing a
 * besparelse with a minus in front of it.
 */
export const ResultCard = forwardRef(function ResultCard({ savingMonth }, ref) {
  const animated = useCountUp(savingMonth);
  const loss = savingMonth < 0;
  const shown = Math.abs(animated);

  return (
    <section className={`app-resultCard${loss ? " app-resultLoss" : ""}`} ref={ref}>
      <div className="app-resultLabel">{loss ? "Du betaler mer" : "Du sparer"}</div>
      <div className="app-resultBig">
        {kr(shown)} <span className="app-resultUnit">kr/md.</span>
      </div>
      <div className="app-resultYear">{kr(shown * 12)} kr/år</div>
      {loss && (
        <p className="app-resultNote">
          Poengene koster mer enn tjenestene de dekker. Velg en pakke som er inkludert i
          avtalen, eller kryss av flere tjenester.
        </p>
      )}
    </section>
  );
});
