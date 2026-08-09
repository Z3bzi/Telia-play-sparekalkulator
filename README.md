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

Vet du hva du selv betaler, kan du skrive det inn i **«Hva betaler du for Telia Play?»**.
Beløpet legger seg på pakken du har valgt og går inn i delelenken – din pris er den eneste
vi vet er riktig for deg. Feltet er tomt til du fyller det ut;
0 kr er et gyldig svar og er ikke det samme som å la det stå tomt.

Uansett trekkes de ikke fra besparelsen: kalkulatoren sammenligner hva strømmetjenestene
koster med og uten poeng, og forutsetter at du har Telia Play uansett.

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

Får alt plass, sparer du hele beløpet du betaler i dag. Hvis ikke, vises to løsninger:

| Løsning | Hva den gjør |
| --- | --- |
| **Kjøp ekstra poeng** | Kjøper differansen i blokker på 10 poeng. Alle tjenester dekkes. Besparelse = totalpris − kostnad for ekstrapoeng. |
| **Bare det som får plass** | Fyller pakken med tjenestene som gir mest kroneverdi per poeng. Resten beholder du som i dag. |

Den som sparer mest merkes **Best** og velges automatisk, til du velger noe annet selv.
Ved likt resultat vinner *Kjøp ekstra poeng*, siden den beholder alle tjenestene.

`kr/poeng` under hver tjeneste er sorteringsnøkkelen «bare det som får plass» bruker –
den forklarer hvorfor akkurat de tjenestene ble valgt.

> [!NOTE]
> Pakkingen er grådig, ikke garantert optimal. Sortering på kroneverdi per poeng er
> rask og lett å forklare, men for enkelte kombinasjoner finnes det et bedre utvalg.
> «Bare det som får plass» betyr *godt*, ikke *beviselig best*.

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
(navn, poeng og månedspris), mobilbonus, pris per 10 ekstra poeng, PIN-koden og logofiler.
Kryss av **Kun kr** på et nivå for å markere at det ikke kan kjøpes for poeng, og
**Vis månedspris på pakkene** hvis listeprisene stemmer for dem som skal bruke kalkulatoren.
«Tilbakestill til startdata» henter inn standardoppsettet igjen.

> [!IMPORTANT]
> Endringer lagres i `localStorage` og gjelder **bare den enheten og nettleseren du
> bruker**. De deles ikke med andre besøkende. PIN-koden ligger i klartekst og er ment
> å hindre feilklikk, ikke å beskytte mot noen som faktisk vil inn.

### Logoer

Tjenester viser en farget bokstavforkortelse som standard. For ekte logoer: legg filen i
`public/logos/` og skriv filnavnet i **Logo**-feltet i admin. Se
[`public/logos/README.md`](public/logos/README.md) for format og lisens.

## Deling

Valgene dine ligger i URL-en (`#p=60&c=349&s=netflix:2,hbomax:1&x=hbomax:sport`), så en
lenke gjenskaper akkurat det resultatet – `s` er nivåene, `x` er tilleggene og `c` er
prisen du oppga for pakken. Ugyldige verdier forkastes, så gamle lenker fortsatt virker
etter at oppsettet er endret.

## Struktur

```
src/
  lib/          calc.js (beregning), config.js (standarddata + migrering),
                url-state.js (deling), brand.js (farger og forkortelser)
  components/   én fil per kort: pakkevelger, tjenesteliste, poengbruk,
                resultat, regnestykke, sticky-linje, PIN- og admin-modal
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

Poeng og priser for HBO Max, Viaplay, SkyShowtime og Prime Video er hentet fra Telias
egne innholdssider.

For TV 2 Play oppgir Telia bare poengkostnaden (10/40/50/110). Kroneprisen på
reklamevariantene er hentet fra play.tv2.no, som oppgir «fra 109,-/mnd» for Start og «fra
189,-/mnd» for Standard. Prisene uten reklame (199 og 379) er fortsatt anslag og bør
bekreftes mot TV 2.

TV 2 Play har også et Premium-nivå til 399,-/mnd med norsk toppfotball, Champions League
og La Liga. Det selges ikke gjennom Telia, verken for poeng eller kroner, og hører derfor
ikke hjemme i kalkulatoren.

Viaplays V Sport (20 poeng), V Sport Golf (50) og V Series (5) kan også kjøpes for poeng,
men de er TV-kanaler uten egen abonnementspris. Spørsmålet «hva betaler du for i dag?» har
derfor ikke noe meningsfullt svar for dem, og de er utelatt fra startdata. Trenger du dem,
legg dem inn som tillegg i admin.
