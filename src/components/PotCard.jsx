import { Checkbox, Heading, TextField } from "@purpur/library";
import { PotSelector } from "./PotSelector";

export function PotCard({
  pots, pot, onPotChange, showPotPrices, mobileBonus, hasMobile, onMobileChange, plan,
  sduPrice, onSduPriceChange,
}) {
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
      {/* Kalkulator-modus (SDU): startdata sier ingenting om hva løspakkene
          koster, så uten et tall her holdes prisen utenfor regnestykket akkurat
          som før. Fyller kunden inn hva hen faktisk betaler, trekkes den fra
          besparelsen på linje med tillegget en fellesavtale koster. */}
      {!plan && (
        <div className="app-mobileRow">
          <TextField
            id="sdu-price"
            type="number"
            min="0"
            label="Hva betaler du for denne pakken per måned? (valgfritt)"
            value={sduPrice || ""}
            onChange={e => onSduPriceChange(Math.max(0, Number(e.target.value) || 0))}
          />
        </div>
      )}
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
