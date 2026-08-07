import { forwardRef } from "react";
import { kr } from "../lib/config";
import { useCountUp } from "../hooks/useCountUp";

export const ResultCard = forwardRef(function ResultCard({ savingMonth }, ref) {
  const animated = useCountUp(savingMonth);

  return (
    <section className="app-resultCard" ref={ref}>
      <div className="app-resultLabel">Du sparer</div>
      <div className="app-resultBig">
        {kr(animated)} <span className="app-resultUnit">kr/md.</span>
      </div>
      <div className="app-resultYear">{kr(animated * 12)} kr/år</div>
    </section>
  );
});
