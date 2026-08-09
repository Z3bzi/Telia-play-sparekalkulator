# Telia Play – sparekalkulator

Regner ut hva du sparer på å dekke strømmetjenestene dine med poeng fra Telia Play,
i stedet for å betale for hver tjeneste separat.

**[Åpne kalkulatoren →](https://z3bzi.github.io/Telia-play-sparekalkulator/)**

Du velger poengpakke – Start (15 poeng), Standard (40) eller Premium (60), pluss 10 poeng
hvis du har mobilabonnement hos Telia – krysser av tjenestene du betaler for i dag, og får
besparelsen i kr/md. og kr/år.

Månedsprisen på pakken vises som informasjon i velgeren, men trekkes ikke fra besparelsen:
kalkulatoren sammenligner hva strømmetjenestene koster med og uten poeng, og forutsetter at
du har Telia Play uansett.

---

## Slik regner den

Hver tjeneste koster et antall poeng, og prisen varierer per nivå: HBO Max med reklame
koster 30 poeng, Standard koster 50. Kalkulatoren summerer poengbehovet for de valgte
nivåene og sammenligner med pakken din.

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

Her kan du endre tjenester, nivåer, priser, poeng per nivå, valgbare poengpakker
(navn, poeng og månedspris), mobilbonus, pris per 10 ekstra poeng, PIN-koden og logofiler.
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

Valgene dine ligger i URL-en (`#p=60&s=netflix:2,hbomax:0`), så en lenke gjenskaper
akkurat det resultatet. Ugyldige verdier forkastes, så gamle lenker fortsatt virker
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

Prisene på de fire TV 2 Play-nivåene er anslag: Telia oppgir bare poengkostnaden
(10/40/50/110), så kroneprisen må bekreftes mot TV 2 og eventuelt rettes i admin.
