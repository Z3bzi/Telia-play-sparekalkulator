import { useRef } from "react";
import { Heading, Paragraph, VisuallyHidden } from "@purpur/library";
import { LogoPlayHorizontal } from "@purpur/library/logo/play-horizontal";

export function Header({ onAdminTap }) {
  const tapCount = useRef(0);
  const tapTimer = useRef(null);

  const handleTap = () => {
    tapCount.current += 1;
    clearTimeout(tapTimer.current);
    if (tapCount.current >= 5) {
      tapCount.current = 0;
      onAdminTap();
    } else {
      tapTimer.current = setTimeout(() => { tapCount.current = 0; }, 2000);
    }
  };

  return (
    <header className="app-head">
      {/* The logo carries the brand name visually, so the page still needs a
          real h1 for document structure. */}
      <VisuallyHidden>
        <Heading tag="h1">Telia Play – sparekalkulator for strømmetjenester</Heading>
      </VisuallyHidden>
      <button type="button" className="app-brandTap" onClick={handleTap}>
        <LogoPlayHorizontal color="purple" height={34} allyTitle="Telia Play" />
      </button>
      <Paragraph variant="paragraph-100" className="app-brandSub">
        Sparekalkulator for strømmetjenester
      </Paragraph>
    </header>
  );
}
