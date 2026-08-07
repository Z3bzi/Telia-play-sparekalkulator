import { kr } from "../lib/config";

export function ResultCard({ savingMonth }) {
  return (
    <section className="app-resultCard">
      <div className="app-resultLabel">Du sparer</div>
      <div className="app-resultBig">{kr(savingMonth)} <span className="app-resultUnit">kr/md.</span></div>
      <div className="app-resultYear">{kr(savingMonth * 12)} kr/år</div>
    </section>
  );
}
