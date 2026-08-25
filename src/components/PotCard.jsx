import { Checkbox, Heading } from "@purpur/library";
import { PotSelector } from "./PotSelector";

export function PotCard({ pots, pot, onPotChange, showPotPrices, mobileBonus, hasMobile, onMobileChange, plan }) {
  return (
    <section className="app-card">
      <Heading tag="h2" variant="subsection-100" className="app-cardTitle">
        {plan ? "TV-poeng i avtalen" : "Poengpakken din"}
      </Heading>
      {/* Prices from the prisarket are the extra cost above fellesavtalen and
          are the same for every borettslag, so they are shown whatever the
          admin flag says about the løse poengpakkene. */}
      <PotSelector
        pots={pots}
        pot={pot}
        onPotChange={onPotChange}
        showPrices={plan ? true : showPotPrices}
      />
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
