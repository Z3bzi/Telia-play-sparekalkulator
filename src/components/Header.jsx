import { useRef } from "react";
import { Heading, Paragraph } from "@purpur/library";

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
      <button type="button" className="app-brandTap" onClick={handleTap}>
        <span className="app-logoDot" aria-hidden="true">T</span>
        <span>
          <Heading tag="h1" variant="title-200">Telia Play</Heading>
          <Paragraph variant="paragraph-100">Sparekalkulator for strømmetjenester</Paragraph>
        </span>
      </button>
    </header>
  );
}
