# Telia Play – sparekalkulator

Regner ut hva du sparer på å dekke strømmetjenestene dine med poeng fra Telia Play,
i stedet for å betale for hver tjeneste separat.

**[Åpne kalkulatoren →](https://z3bzi.github.io/Telia-play-sparekalkulator/)**

Du velger poengpakke – 15, 40 eller 60 poeng, pluss 10 poeng hvis du har mobilabonnement
hos Telia – krysser av tjenestene du betaler for i dag, og får besparelsen i kr/md. og kr/år.

Pakkene vises som rene poengtall, uten navn og uten månedspris. Navn og pris kan legges
inn i admin av den som har de riktige, men prisen holdes av som standard uansett:
MDU-kunder – de som får TV gjennom borettslag eller sameie – betaler det avtalen deres med
Telia sier, og kalkulatoren vet ikke hvem som sitter på andre siden.

Prisen på de løse pakkene inngår ikke i regnestykket som standard: kalkulatoren
sammenligner hva strømmetjenestene koster med og uten poeng, og forutsetter at du har
Telia Play uansett. Vet du hva du faktisk betaler for pakken din, kan du fylle det inn
under poengpakke-valget — da trekkes den fra besparelsen på samme måte som tillegget en
fellesavtale koster.

Velger du i stedet **fellesavtalen borettslaget har**, kommer TV-poengene – og hva de
koster – rett fra Telias prisark. Da inngår tillegget i regnestykket, fordi det er en
utgift du faktisk tar på deg for å få poengene. Se [Fellesavtaler](#fellesavtaler).

---

## Slik regner den

Hver tjeneste koster et antall poeng, og prisen varierer per nivå: HBO Max med reklame
koster 30 poeng, Standard koster 50. Kalkulatoren summerer poengbehovet for de valgte
nivåene og sammenligner med pakken din.

Noen nivåer selges bare i kroner – HBO Max Premium, V Premium og Viaplay Total. De er
merket **kun kr**, holdes utenfor poengbudsjettet, og teller ikke som besparelse: Telias
pris er den samme som å betale tjenesten direkte, så poengene endrer ingenting for dem.
De vises likevel, under «Kan ikke kjøpes for poeng», så regnestykket blir fullstendig.

Enkelte tjenester har **tillegg** som legger seg oppå nivået i stedet for å erstatte det.
HBO Max Sport koster 20 poeng (eller 50 kr/md.) i tillegg til Basis eller Standard, og
blir en egen linje i poengbruken.

**Disney+ selges bare i kombinasjon med TV 2 Play**, og kalkulatoren regner deretter:

| Har du … | … så gjelder dette for Disney+ |
| --- | --- |
| TV 2 Play Standard | Følger med i nivået. Ingen ekstra poeng, ingen ekstra kroner – og den telles ikke en gang til om du krysser av begge. |
| TV 2 Play Start | Kan kjøpes til for 40 poeng, som en hvilken som helst annen tjeneste. |
| Ikke TV 2 Play | Ingen poengvei dit. Den havner under «Kan ikke kjøpes for poeng» og teller ikke som besparelse. |

Under *bare det som får plass* henger Disney+ sammen med TV 2 Play: ryker verten ut av
pakken, blir ikke Disney+ stående igjen alene. Det samme gjelder tillegg og nivået de
sitter på.

Får alt plass, sparer du hele beløpet du betaler i dag. Hvis ikke, vises to løsninger:

| Løsning | Hva den gjør |
| --- | --- |
| **Kjøp ekstra poeng** | Går opp til den minste pakken som dekker behovet. Besparelse = verdien av det som dekkes − kostnad for ekstrapoeng. |
| **Bare det som får plass** | Fyller pakken med kombinasjonen som gir mest kroneverdi. Resten beholder du som i dag. |

Den som sparer mest merkes **Best** og velges automatisk, til du velger noe annet selv.
Ved likt resultat vinner *Kjøp ekstra poeng*, siden den beholder alle tjenestene.

### Hvilke pakker finnes

Poengpakkene selges bare i de konfigurasjonene Telia faktisk tilbyr:

| Pakke | Poeng i alt |
| --- | --- |
| TV & Strømming 15 poeng | 15 |
| TV & Strømming 40 poeng | 40 |
| TV & Strømming 60 poeng | 60 |
| 60 poeng + 10 ekstra | 70 |
| 60 poeng + 20 ekstra | 80 |
| 60 poeng + 40 ekstra | 100 |
| 60 poeng + 60 ekstra (Familie) | 120 |
| 60 poeng + 80 ekstra | 140 |
| 60 poeng + 150 ekstra | 210 |

Ekstrapoeng er altså ikke en fri mengde man kjøper ti om gangen: de finnes bare i disse
bolkene, og bare oppå 60-poengspakken. **60 + 30 er ikke en pakke**, og på 15 og 40 poeng
kan man ikke kjøpe ekstrapoeng i det hele tatt — der sier kalkulatoren fra om at resten må
stå utenfor, i stedet for å tilby et kjøp som ikke finnes.

*Kjøp ekstra poeng* går derfor opp til den **minste** konfigurasjonen som dekker behovet.
Har du en fellesavtale, er TV-poengene fra prisarket (80, 100 og 120) de samme
konfigurasjonene, og du betaler bare veien videre til den neste.

Taket på **210 poeng**, **220 med mobilabonnement hos Telia**, er ikke et tall for seg: det
er den største pakken som finnes. Er tjenestene verdt mer enn det, kjøper *Kjøp ekstra
poeng* den største pakken og pakker resten på samme måte som *bare det som får plass* — det
som gir mest kroneverdi per poeng kommer med, og resten står utenfor.

Bolkene og pakken de henger på kan endres i admin, under **Ekstrapoeng**.

`kr/poeng` under hver tjeneste sier hvor mye abonnement hvert poeng låser opp, og
forklarer stort sett hvorfor akkurat de tjenestene ble valgt.

Pakkingen går gjennom alle kombinasjoner og velger den med flest kroner innenfor
poengbudsjettet, slik at kombinasjonskravene holder. Utvalget er altså *beviselig best*,
ikke bare godt. Ved like mange kroner vinner den som bruker færrest poeng.

Antall avkryssede linjer er lite — åtte til tolv i praksis — så gjennomgangen er billig.
Har noen lagt inn så mange tjenester i admin at listen passerer 16 linjer, tar en grådig
runde over kroneverdi per poeng over igjen; da er svaret godt, men ikke garantert best.

> [!NOTE]
> Målet er kroner spart, ikke antall tjenester. Noen ganger er én dyr tjeneste verdt mer
> enn tre billige, og da er det den ene som kommer med.

## Fellesavtaler

Fanen **Avtaler** viser prisarket for Telias Flex-avtaler: for hver avtale en tabell med
bredbåndshastighet bortover og TV-poeng nedover.

Avtalen har en fast verdi som kan tas ut som hastighet, som TV-poeng, eller som en
blanding. Det gir tre slags celler:

| Celle | Betyr |
| --- | --- |
| **Ingen kostnad** | Kombinasjonen ligger i rammen for fellesavtalen. |
| **Pris i kr/md.** | Tillegg beboeren betaler oppå fellesavtalen. |
| **–** | Kombinasjonen tilbys ikke – den ligger under avtalens verdi. Telia selger ikke ned: lavere hastighet gir flere TV-poeng, ikke lavere pris. |

TV-poengene i arket er de samme poengene kalkulatoren regner med, så avtalen kan tas rett
inn i den – fra **Bruk i kalkulatoren** på tabellen, eller fra **Fellesavtalen din** øverst
i kalkulatoren. Da skjer tre ting:

- Pakkevalget bytter fra de løse poengpakkene til TV-poengene avtalen faktisk tilbyr, med
  prisen på hver av dem. Poengtall avtalen ikke tilbyr på den valgte hastigheten står
  stiplet ut – de kommer tilbake på lavere hastighet, og det er hele poenget.
- Tillegget for kombinasjonen trekkes fra besparelsen, på linje med kostnaden for
  ekstrapoeng. Ligger kombinasjonen i rammen, trekkes ingenting.
- Pakken som gir mest igjen når den er betalt for merkes **Mest igjen**. Det er sjelden
  den største: en pakke til 389 kr/md. må dekke mer enn 389 kr/md. i tjenester før den
  slår den som er inkludert.

Koster poengene mer enn tjenestene de dekker, sier resultatkortet **Du betaler mer** i
stedet for å vise en besparelse med minus foran.

Hastigheten starter der kombinasjonen er inkludert, slik at det å velge en avtale aldri i
seg selv legger på en kostnad. Er du usikker på hvilken avtale borettslaget har, la
**Vet ikke / velg selv** stå – da regner kalkulatoren på de løse poengpakkene som før.

Prisene ligger i [`src/lib/plans.json`](src/lib/plans.json), transkribert fra prisarket.
Oppdaterer Telia arket, er det den filen som skal byttes – ingenting annet er avhengig av
tallene.

## Kjøre lokalt

Krever [Node.js](https://nodejs.org) 20 eller nyere.

```bash
npm install
npm run dev      # utviklingsserver
npm run build    # produksjonsbygg til dist/
npm run preview  # server dist/ lokalt
```

## Admin

Trykk fem ganger på logoen i toppen, og skriv inn PIN (standard: `1234`).

Her kan du endre tjenester, nivåer, priser, poeng per nivå, tillegg, valgbare poengpakker
(navn, poeng og månedspris), mobilbonus, pris per 10 ekstra poeng, hvilke bolker med
ekstrapoeng som selges og hvilken pakke de henger på, PIN-koden og logofiler.
Kryss av **Kun kr** på et nivå for å markere at det ikke kan kjøpes for poeng, og
**Vis månedspris på pakkene** hvis listeprisene stemmer for dem som skal bruke kalkulatoren.
«Tilbakestill til startdata» henter inn standardoppsettet igjen.

To felter binder tjenester sammen, slik Disney+ og TV 2 Play henger sammen:
**Krever** på tjenesten sier at den bare kan kjøpes for poeng sammen med en annen, og
**Inneholder** på et nivå sier hvilken tjeneste nivået allerede inkluderer. Sletter du
tjenesten det pekes på, forkastes pekeren – ellers ville den avhengige tjenesten vært
låst ute fra poeng for godt.

> [!IMPORTANT]
> Endringer lagres i `localStorage` og gjelder **bare den enheten og nettleseren du
> bruker**. De deles ikke med andre besøkende. PIN-koden ligger i klartekst og er ment
> å hindre feilklikk, ikke å beskytte mot noen som faktisk vil inn.

### Logoer

Tjenester viser en farget bokstavforkortelse som standard. For ekte logoer: legg filen i
`public/logos/` og skriv filnavnet i **Logo**-feltet i admin. Se
[`public/logos/README.md`](public/logos/README.md) for format og lisens.

## Deling

Valgene dine ligger i URL-en (`#p=60&s=netflix:2,hbomax:1&x=hbomax:sport`), så en
lenke gjenskaper akkurat det resultatet – `s` er nivåene og `x` er tilleggene. Har du valgt
fellesavtale, følger den med som `f` (avtale) og `sp` (hastighet), og `v=plans` åpner
avtalesiden. Ugyldige verdier forkastes, så gamle lenker fortsatt virker etter at oppsettet
er endret.

## Struktur

```
src/
  lib/          calc.js (beregning), config.js (standarddata + migrering),
                plans.js + plans.json (fellesavtalene fra prisarket),
                url-state.js (deling), brand.js (farger og forkortelser)
  components/   én fil per kort: avtalevelger, pakkevelger, tjenesteliste,
                poengbruk, resultat, regnestykke, sticky-linje, PIN- og
                admin-modal — pluss PlansPage.jsx, hele prisarket
  hooks/        useCountUp.js (animert tellesum)
```

Bygget med [Vite](https://vite.dev) og React. Grensesnittet bruker Telias eget
designsystem, [Purpur](https://www.npmjs.com/package/@purpur/library), så farger,
typografi og komponenter følger Telias profil.

Lagret oppsett fra eldre versjoner migreres automatisk ved innlasting, så admin-endringer
overlever oppdateringer av datamodellen.

## Publisering

Push til `main` bygger og publiserer automatisk til GitHub Pages via
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). Tar rundt ett minutt.

## Om tallene

Poengverdiene følger Telia Play-grensesnittet (august 2026). Prisene er veiledende –
sjekk gjeldende pris hos den enkelte tjenesten, og korriger i admin ved behov.

Prisene ble sist kontrollert mot tjenestenes egne sider 9. august 2026. Netflix, HBO Max,
Prime Video og Disney+ stemte. SkyShowtime med reklame ble rettet fra 59 til 69, BritBox
fra 59 til 89 – 59 lå nær årsprisen delt på tolv, men det er månedsprisen du slipper unna
når poeng dekker tjenesten – og Viaplay fra 159 til 169.

Poeng og priser for HBO Max, Viaplay, SkyShowtime og Prime Video er hentet fra Telias
egne innholdssider.

For TV 2 Play oppgir Telia bare poengkostnaden (10/40/50/110). Kroneprisen på
reklamevariantene er hentet fra play.tv2.no, som oppgir «fra 109,-/mnd» for Start og «fra
189,-/mnd» for Standard. Prisene uten reklame (199 og 379) er fortsatt anslag og bør
bekreftes mot TV 2.

TV 2 Play har også et Premium-nivå til 399,-/mnd med norsk toppfotball, Champions League
og La Liga. Det selges ikke gjennom Telia, verken for poeng eller kroner, og hører derfor
ikke hjemme i kalkulatoren.

Disney+ står oppført til 40 poeng, men er ikke en tjeneste du kan velge for seg selv hos
Telia – den er bare tilgjengelig i kombinasjon med TV 2 Play, og ligger allerede inne i
TV 2 Plays Standard-nivåer. Kroneprisene (69 med reklame, 99 uten) er Disney+ sine egne,
og er det du sammenligner med når du betaler dem direkte i dag.

Viaplays V Sport (20 poeng), V Sport Golf (50) og V Series (5) kan også kjøpes for poeng,
men de er TV-kanaler uten egen abonnementspris. Spørsmålet «hva betaler du for i dag?» har
derfor ikke noe meningsfullt svar for dem, og de er utelatt fra startdata. Trenger du dem,
legg dem inn som tillegg i admin.
