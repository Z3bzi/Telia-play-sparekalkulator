import { Checkbox, RadioCardGroup } from "@purpur/library";

export function PotCard({ pots, pot, onPotChange, mobileBonus, hasMobile, onMobileChange }) {
  const items = pots.map(p => ({
    id: `pot-${p}`,
    value: String(p),
    title: `${p}`,
    body: "poeng",
  }));

  return (
    <section className="app-card">
      <div className="app-stepLabel">Poengpotten din</div>
      <RadioCardGroup
        id="pot-group"
        aria-label="Velg poengpott"
        orientation="horizontal"
        items={items}
        value={String(pot)}
        onValueChange={value => onPotChange(Number(value))}
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
