import { useState } from "react";
import { Button, Modal, TextField } from "@purpur/library";

export function PinModal({ open, onOpenChange, correctPin, onSuccess }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  const close = () => {
    setValue("");
    setError(false);
    onOpenChange(false);
  };

  const trySubmit = e => {
    e.preventDefault();
    if (value === correctPin) {
      setValue("");
      setError(false);
      onSuccess();
    } else {
      setError(true);
      setValue("");
    }
  };

  return (
    <Modal open={open} onOpenChange={next => (next ? onOpenChange(true) : close())}>
      <Modal.Content
        title="PIN-kode"
        showCloseButton
        closeButtonAriaLabel="Lukk"
        actions={
          <>
            <Button variant="secondary" fullWidth onClick={close}>Avbryt</Button>
            <Button variant="primary" fullWidth type="submit" form="pin-form">Åpne</Button>
          </>
        }
      >
        <form id="pin-form" onSubmit={trySubmit}>
          <TextField
            className="app-pinInput"
            id="pin-input"
            label="Skriv inn PIN"
            type="password"
            inputMode="numeric"
            autoComplete="off"
            autoFocus
            value={value}
            onChange={e => setValue(e.target.value)}
            errorText={error ? "Feil PIN. Prøv igjen." : undefined}
          />
        </form>
      </Modal.Content>
    </Modal>
  );
}
