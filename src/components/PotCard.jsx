import { Checkbox, Heading } from "@purpur/library";
import { PotSelector } from "./PotSelector";

export function PotCard({ pots, pot, onPotChange, mobileBonus, hasMobile, onMobileChange }) {
  return (
    <section className="app-card">
      <Heading tag="h2" variant="subsection-100" className="app-cardTitle">Poengpotten din</Heading>
      <PotSelector pots={pots} pot={pot} onPotChange={onPotChange} />
      <div className="app-mobileRow">
        <Checkbox
          id="mobile-bonus"
          checked={hasMobile}
          onChange={value => onMobileChange(value === true)}
          label={<>Har også mobilabonnement hos Telia<span className="app-checkBonus">+{mobileBonus} poeng</span></>}
        />
      </div>
    </section>
  );
}
