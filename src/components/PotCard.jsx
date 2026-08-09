import { Checkbox, Heading, TextField } from "@purpur/library";
import { PotSelector } from "./PotSelector";

export function PotCard({
  pots, pot, onPotChange, showPotPrices, ownPrice, onOwnPriceChange,
  mobileBonus, hasMobile, onMobileChange,
}) {
  return (
    <section className="app-card">
      <Heading tag="h2" variant="subsection-100" className="app-cardTitle">Poengpakken din</Heading>
      <PotSelector
        pots={pots}
        pot={pot}
        onPotChange={onPotChange}
        showPrices={showPotPrices}
        ownPrice={ownPrice}
      />
      <div className="app-mobileRow">
        <Checkbox
          id="mobile-bonus"
          checked={hasMobile}
          onChange={value => onMobileChange(value === true)}
          label={<>Har også mobilabonnement hos Telia<span className="app-checkBonus">+{mobileBonus} poeng</span></>}
        />
      </div>
      <div className="app-ownPrice">
        <TextField
          id="own-price"
          label="Hva betaler du for Telia Play? (valgfritt)"
          type="number"
          placeholder="kr/md."
          helperText="Bor du i borettslag eller sameie, betaler du prisen avtalen deres sier. Beløpet vises bare — det trekkes ikke fra besparelsen."
          // An empty field means "ikke oppgitt"; 0 is a price someone can
          // genuinely have, so the two must not collapse into each other.
          value={ownPrice ?? ""}
          onChange={e => {
            const raw = e.target.value.trim();
            onOwnPriceChange(raw === "" ? null : Math.max(0, Number(raw) || 0));
          }}
        />
      </div>
    </section>
  );
}
