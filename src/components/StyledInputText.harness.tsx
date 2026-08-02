import React from "react";
import StyledInputText from "./StyledInputText";
import StyledInputTextArea from "./StyledInputTextArea";
import { StonedogStyleProvider } from "../config/style-config";

/**
 * Mount targets for `StyledInputText.ct.tsx`.
 *
 * In its own module because Playwright's component testing resolves the mounted
 * component by import — one defined inside a spec file fails at runtime with
 * `Component "X" cannot be mounted`.
 *
 * Carries a stateful dictation adapter, since the interesting assertions are
 * about what the buttons do to the field: pressing the mic must flip
 * `aria-pressed` and repaint, and revealing redo must widen the padding so the
 * value stops running underneath. A static adapter can show neither.
 *
 * Not exported from the package — test scaffolding.
 */

/** Inline SVGs, so the harness needs no icon package. */
const MicGlyph = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
    <rect x="7" y="2" width="6" height="10" rx="3" fill="currentColor" />
    <path d="M4 9a6 6 0 0 0 12 0" stroke="currentColor" fill="none" strokeWidth="2" />
  </svg>
);

const RedoGlyph = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
    <path d="M3 10a7 7 0 1 1 2 5" stroke="currentColor" fill="none" strokeWidth="2" />
  </svg>
);

export interface DictationFieldProps {
  multiline?: boolean;
  /** Start with the redo button already showing. */
  withRedo?: boolean;
  /** Render the field with no adapter at all. */
  withoutDictation?: boolean;
  isSupported?: boolean;
  placeholder?: string;
}

export function DictationField({
  multiline = false,
  withRedo = false,
  withoutDictation = false,
  isSupported = true,
  placeholder,
}: DictationFieldProps) {
  const [listening, setListening] = React.useState(false);
  const [showRedo, setShowRedo] = React.useState(withRedo);
  const [value, setValue] = React.useState("");

  const dictation = {
    isSupported,
    isListening: listening,
    showRedo,
    onMicClick: () => {
      // Stopping "produces a result", which is what reveals redo — the state
      // change the padding assertion depends on.
      setListening((was) => {
        if (was) {
          setShowRedo(true);
          setValue("dictated text");
        }
        return !was;
      });
    },
    redo: () => {
      setShowRedo(false);
      setValue("");
    },
  };

  const Field = multiline ? StyledInputTextArea : StyledInputText;

  return (
    <StonedogStyleProvider icons={{ dictate: <MicGlyph />, redo: <RedoGlyph /> }}>
      <div style={{ width: "100%" }}>
        <Field
          data-testid="field"
          placeholder={placeholder ?? "Say something"}
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>) =>
            setValue(e.target.value)
          }
          {...(withoutDictation ? {} : { dictation })}
        />
      </div>
    </StonedogStyleProvider>
  );
}

export default DictationField;

/**
 * Two fields under different font-size profiles, side by side.
 *
 * Both in one component because a spec may only `mount()` once — a second call
 * hits the existing React root and fails.
 */
export function ProfiledFields() {
  return (
    <div>
      <StonedogStyleProvider fontSizeProfile="sm">
        <StyledInputText data-testid="field-sm" defaultValue="Readable?" />
      </StonedogStyleProvider>
      <StonedogStyleProvider fontSizeProfile="xl">
        <StyledInputText data-testid="field-xl" defaultValue="Readable?" />
      </StonedogStyleProvider>
    </div>
  );
}
