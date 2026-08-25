/**
 * Closes every page: whatever caveat that page needs, and under it the
 * disclaimer that belongs on all of them. The tool wears Telias logo, farger og
 * designsystem, so it has to say plainly that it is not Telias.
 */
export function SiteFooter({ children }) {
  return (
    <footer className="app-foot">
      {children}
      <span className="app-disclaimer">
        Dette er ikke et offisielt Telia-verktøy. Kalkulatoren er laget på privat initiativ, og
        er verken utviklet, driftet eller godkjent av Telia. «Telia» og «Telia Play» er Telias
        varemerker. Beregningene er uforpliktende anslag — det er avtalen din med Telia, og
        prisen hos den enkelte tjenesten, som gjelder.
      </span>
    </footer>
  );
}
