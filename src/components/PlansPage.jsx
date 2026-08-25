import { Button, Heading, Paragraph, Select } from "@purpur/library";
import {
  formatPrice,
  listFamilies,
  planMatrix,
  planSummary,
  plansData,
  speedLabel,
  tvPointsLabel,
} from "../lib/plans";

const ALL = "";

// Three cell states, three treatments: the covered combinations carry the
// avtalen's own emphasis, the paid ones read as plain prices, and the ones that
// aren't offered stay a dash you can look past.
function PriceCell({ row }) {
  const type = row?.price_type ?? "unavailable";
  return (
    <td className={`app-mxCell app-mx-${type}`}>
      {type === "unavailable"
        ? <span aria-hidden="true">–</span>
        : formatPrice(row)}
      {type === "unavailable" && <span className="app-srOnly">Ikke tilgjengelig</span>}
    </td>
  );
}

function FamilyPanel({ family, onUsePlan }) {
  const { speeds, tiers, cells } = planMatrix(family);
  const { included, minPaid, maxPaid, maxTvPoints } = planSummary(family);

  return (
    <section className="app-mxPanel" aria-labelledby={`mx-${family.replace(/\s+/g, "-")}`}>
      <div className="app-mxHead">
        <Heading tag="h2" variant="title-100" id={`mx-${family.replace(/\s+/g, "-")}`}>
          {family}
        </Heading>
        <p className="app-mxLead">
          Inkludert i avtalen: {included.map(r =>
            `${speedLabel(r.speed_mbit)} + ${tvPointsLabel(r.tv_points)}`,
          ).join(" · ")}.
          {minPaid !== null && (
            <> Vil du ha mer enn det, opp til {maxTvPoints} TV-poeng, koster tillegget
            {" "}{minPaid}–{maxPaid} {plansData.unit}</>
          )}
        </p>
      </div>

      <div className="app-mxScroll">
        <table className="app-mx">
          <caption className="app-srOnly">
            Pris per måned for {family}, etter bredbåndshastighet og TV-poeng.
          </caption>
          <thead>
            <tr>
              <th scope="col" className="app-mxCorner">
                <span className="app-srOnly">TV-poeng</span>
              </th>
              {speeds.map(s => (
                <th scope="col" key={s} className="app-mxColHead">{speedLabel(s)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tiers.map((tv, r) => (
              <tr key={tv}>
                <th scope="row" className="app-mxRowHead">{tvPointsLabel(tv)}</th>
                {cells[r].map((row, c) => <PriceCell key={speeds[c]} row={row} />)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* The table scrolls sideways on a phone, and the clipped last column is
          easy to read as a design edge rather than as more table. */}
      <p className="app-mxHint">Sveip bortover for å se alle hastighetene.</p>

      <div className="app-mxFoot">
        <Button variant="secondary" onClick={() => onUsePlan(family)}>
          Bruk i kalkulatoren
        </Button>
      </div>
    </section>
  );
}

export function PlansPage({ family, onFamilyChange, onUsePlan, onBack }) {
  const families = listFamilies();
  const shown = family && families.includes(family) ? [family] : families;

  return (
    <main className="app-stack app-stackWide">
      <section className="app-card">
        <Heading tag="h2" variant="subsection-100" className="app-cardTitle">
          Slik henger hastighet og TV-poeng sammen
        </Heading>
        <Paragraph variant="paragraph-100">
          Fellesavtalen borettslaget har med Telia har en fast verdi, og den kan tas ut som
          bredbåndshastighet, som TV-poeng, eller som en blanding. Derfor står det
          «Ingen kostnad» på en hel rekke kombinasjoner: velger du lavere hastighet, får du
          flere TV-poeng uten å betale mer.
        </Paragraph>
        {/* The swatches carry the same treatment the cells do, so the key can be
            matched against the table by eye rather than by memory. */}
        <ul className="app-mxLegend">
          <li><span className="app-mxKey app-mx-included" aria-hidden="true">Ingen kostnad</span>
            <span>Ligger i rammen for fellesavtalen.</span></li>
          <li><span className="app-mxKey app-mx-paid" aria-hidden="true">389 kr/md.</span>
            <span>Tillegg beboeren betaler oppå fellesavtalen.</span></li>
          <li><span className="app-mxKey app-mx-unavailable" aria-hidden="true">–</span>
            <span>Kombinasjonen tilbys ikke; den ligger under avtalens verdi.</span></li>
        </ul>
        <div className="app-mxFilter">
          <Select
            id="plans-filter"
            label="Vis avtale"
            options={[
              { label: `Alle avtaler (${families.length})`, value: ALL },
              ...families.map(f => ({ label: f, value: f })),
            ]}
            value={family && families.includes(family) ? family : ALL}
            onChange={e => onFamilyChange(e.target.value || null)}
          />
        </div>
      </section>

      {shown.map(f => <FamilyPanel key={f} family={f} onUsePlan={onUsePlan} />)}

      <section className="app-card">
        <Paragraph variant="paragraph-100">
          TV-poengene er de samme poengene kalkulatoren regner med. Velg avtalen din her, så
          henter kalkulatoren TV-poengene og hva de koster.
        </Paragraph>
        <div className="app-mxFoot">
          <Button variant="primary" onClick={onBack}>Til kalkulatoren</Button>
        </div>
      </section>

      <footer className="app-foot">
        «Ingen kostnad» betyr at valget er inkludert i rammene for fellesavtalen, og at beboere
        kan velge det alternativet uten ekstra kostnad. Prisene er hentet fra Telias prisark for
        Flex-avtalene — sjekk hva som gjelder for ditt borettslag.
      </footer>
    </main>
  );
}
