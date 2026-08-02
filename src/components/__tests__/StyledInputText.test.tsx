import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import StyledInputText from "../StyledInputText";
import StyledInputTextArea from "../StyledInputTextArea";
import { StonedogStyleProvider } from "../../config/style-config";
import type { Dictation } from "../dictation";

/** A supported adapter with everything stubbed. */
const adapter = (over: Partial<Dictation> = {}): Dictation => ({
  isSupported: true,
  isListening: false,
  onMicClick: jest.fn(),
  ...over,
});

/** Both fields share the seam, so both run the same dictation suite. */
const FIELDS = [
  { name: "StyledInputText", Field: StyledInputText, tag: "INPUT" },
  { name: "StyledInputTextArea", Field: StyledInputTextArea, tag: "TEXTAREA" },
] as const;

const withIcons = (ui: React.ReactNode) => (
  <StonedogStyleProvider icons={{ dictate: <svg data-testid="mic-glyph" />, redo: <svg /> }}>
    {ui}
  </StonedogStyleProvider>
);

describe.each(FIELDS)("$name", ({ Field, tag }) => {
  it("renders the field", () => {
    render(<Field data-testid="f" />);
    expect(screen.getByTestId("f").tagName).toBe(tag);
  });

  it("forwards a ref to the element itself", () => {
    const ref = React.createRef<never>();
    render(<Field ref={ref} />);
    expect((ref.current as unknown as HTMLElement)?.tagName).toBe(tag);
  });

  it("passes value and onChange through", () => {
    const onChange = jest.fn();
    render(<Field data-testid="f" value="hello" onChange={onChange} />);
    expect(screen.getByTestId("f")).toHaveValue("hello");
    fireEvent.change(screen.getByTestId("f"), { target: { value: "world" } });
    expect(onChange).toHaveBeenCalled();
  });

  it("maps isReadOnly onto readOnly", () => {
    render(<Field data-testid="f" isReadOnly />);
    expect(screen.getByTestId("f")).toHaveAttribute("readonly");
  });

  describe("dictation is opt-in", () => {
    it("renders NO microphone without an adapter", () => {
      // The inversion this migration made. The originating component
      // auto-enabled a mic from a feature flag, so opting a field out meant
      // remembering a prop — a PIN or card-number field was one forgotten
      // `showMic={false}` away from having a microphone. Silence is the default
      // now.
      render(withIcons(<Field data-testid="f" />));
      expect(screen.queryByTestId("dictation-mic")).toBeNull();
    });

    it("renders a microphone when given one", () => {
      render(withIcons(<Field data-testid="f" dictation={adapter()} />));
      expect(screen.getByTestId("dictation-mic")).toBeInTheDocument();
    });

    it("renders nothing when the engine is unsupported", () => {
      // A control that cannot work is worse than an absent one — the user has
      // to press it to find out.
      render(
        withIcons(<Field data-testid="f" dictation={adapter({ isSupported: false })} />),
      );
      expect(screen.queryByTestId("dictation-mic")).toBeNull();
    });

    it("draws the host's glyph, since this package ships none", () => {
      render(withIcons(<Field data-testid="f" dictation={adapter()} />));
      expect(screen.getByTestId("mic-glyph")).toBeInTheDocument();
    });

    it("calls onMicClick", () => {
      const onMicClick = jest.fn();
      render(withIcons(<Field data-testid="f" dictation={adapter({ onMicClick })} />));
      fireEvent.click(screen.getByTestId("dictation-mic"));
      expect(onMicClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("the mic's accessible name and state", () => {
    it("has a name", () => {
      render(withIcons(<Field dictation={adapter()} />));
      expect(screen.getByRole("button", { name: "Dictate" })).toBeInTheDocument();
    });

    it("takes a custom name, for localisation", () => {
      render(withIcons(<Field dictation={adapter()} micLabel="Diktieren" />));
      expect(screen.getByRole("button", { name: "Diktieren" })).toBeInTheDocument();
    });

    it("reports not-pressed when idle", () => {
      render(withIcons(<Field dictation={adapter()} />));
      expect(screen.getByTestId("dictation-mic")).toHaveAttribute("aria-pressed", "false");
    });

    it("reports pressed while recording", () => {
      render(withIcons(<Field dictation={adapter({ isListening: true })} />));
      expect(screen.getByTestId("dictation-mic")).toHaveAttribute("aria-pressed", "true");
    });

    it("keeps the SAME name while recording", () => {
      // A toggle whose name flips to "Stop" reads as a different control each
      // time and breaks voice input: "click Dictate" stops matching the moment
      // recording starts. The state changes, the name does not.
      render(withIcons(<Field dictation={adapter({ isListening: true })} />));
      expect(screen.getByRole("button", { name: "Dictate" })).toBeInTheDocument();
    });

    it("is a button, so it never submits the surrounding form", () => {
      render(withIcons(<Field dictation={adapter()} />));
      expect(screen.getByTestId("dictation-mic")).toHaveAttribute("type", "button");
    });
  });

  describe("redo", () => {
    it("is absent unless asked for", () => {
      render(withIcons(<Field dictation={adapter()} />));
      expect(screen.queryByTestId("dictation-redo")).toBeNull();
    });

    it("appears when showRedo and a handler are both given", () => {
      render(withIcons(<Field dictation={adapter({ showRedo: true, redo: jest.fn() })} />));
      expect(screen.getByRole("button", { name: "Record again" })).toBeInTheDocument();
    });

    it("stays absent when showRedo is set but no handler is", () => {
      // A visible button that does nothing is worse than no button.
      render(withIcons(<Field dictation={adapter({ showRedo: true })} />));
      expect(screen.queryByTestId("dictation-redo")).toBeNull();
    });

    it("calls redo", () => {
      const redo = jest.fn();
      render(withIcons(<Field dictation={adapter({ showRedo: true, redo })} />));
      fireEvent.click(screen.getByTestId("dictation-redo"));
      expect(redo).toHaveBeenCalledTimes(1);
    });
  });

  describe("the continue prompt — a second recording must not silently replace", () => {
    const multi = (over = {}) =>
      adapter({
        continuePrompt: true,
        chooseContinue: jest.fn(),
        chooseStartOver: jest.fn(),
        ...over,
      });

    it("is absent until raised", () => {
      render(withIcons(<Field dictation={adapter()} />));
      expect(screen.queryByTestId("dictation-continue-prompt")).toBeNull();
    });

    it("asks rather than guessing", () => {
      // Overwriting a paragraph because someone pressed the mic twice is data
      // loss, not a preference.
      render(withIcons(<Field dictation={multi()} />));
      expect(screen.getByTestId("dictation-continue-prompt")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Continue" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Start over" })).toBeInTheDocument();
    });

    it("offers the non-destructive answer first", () => {
      // Reading and tab order both reach Continue before Start over.
      render(withIcons(<Field dictation={multi()} />));
      const buttons = screen.getAllByRole("button").map((b) => b.textContent);
      expect(buttons.indexOf("Continue")).toBeLessThan(buttons.indexOf("Start over"));
    });

    it("is announced as a named group", () => {
      render(withIcons(<Field dictation={multi()} />));
      expect(
        screen.getByRole("group", { name: "Add to what you already wrote?" }),
      ).toBeInTheDocument();
    });

    it("calls chooseContinue", () => {
      const chooseContinue = jest.fn();
      render(withIcons(<Field dictation={multi({ chooseContinue })} />));
      fireEvent.click(screen.getByTestId("dictation-continue"));
      expect(chooseContinue).toHaveBeenCalledTimes(1);
    });

    it("calls chooseStartOver", () => {
      const chooseStartOver = jest.fn();
      render(withIcons(<Field dictation={multi({ chooseStartOver })} />));
      fireEvent.click(screen.getByTestId("dictation-start-over"));
      expect(chooseStartOver).toHaveBeenCalledTimes(1);
    });

    it("suppresses redo while the prompt is up", () => {
      // Three competing choices about the same text is not a decision anyone
      // makes quickly.
      render(withIcons(<Field dictation={multi({ showRedo: true, redo: jest.fn() })} />));
      expect(screen.getByTestId("dictation-continue-prompt")).toBeInTheDocument();
      expect(screen.queryByTestId("dictation-redo")).toBeNull();
    });

    it("stays absent when the handlers are missing", () => {
      render(withIcons(<Field dictation={adapter({ continuePrompt: true })} />));
      expect(screen.queryByTestId("dictation-continue-prompt")).toBeNull();
    });

    it("takes custom wording, for localisation", () => {
      render(
        withIcons(
          <Field
            dictation={multi()}
            continueQuestion="Zum Text hinzufügen?"
            continueLabel="Weiter"
            startOverLabel="Neu"
          />,
        ),
      );
      expect(screen.getByRole("group", { name: "Zum Text hinzufügen?" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Weiter" })).toBeInTheDocument();
    });
  });

  describe("room for the buttons", () => {
    const padOf = (ui: React.ReactElement) => {
      const { container } = render(ui);
      const el = container.querySelector(tag.toLowerCase()) as HTMLElement;
      return el.style.paddingRight;
    };

    it("reserves none without dictation", () => {
      expect(padOf(withIcons(<Field />) as React.ReactElement)).toBe("");
    });

    it("reserves room for the mic", () => {
      expect(padOf(withIcons(<Field dictation={adapter()} />) as React.ReactElement)).toBe("3.5em");
    });

    it("reserves more when redo is showing", () => {
      // Otherwise the value runs underneath the second button — invisible in a
      // screenshot of an empty field, obvious the moment someone types.
      expect(
        padOf(
          withIcons(
            <Field dictation={adapter({ showRedo: true, redo: jest.fn() })} />,
          ) as React.ReactElement,
        ),
      ).toBe("5.5em");
    });

    it("lets an explicit style win", () => {
      expect(
        padOf(
          withIcons(
            <Field dictation={adapter()} style={{ paddingRight: "1px" }} />,
          ) as React.ReactElement,
        ),
      ).toBe("1px");
    });
  });

  describe("variant resolution", () => {
    const classOf = (ui: React.ReactElement) => {
      const { container } = render(ui);
      return (container.querySelector(tag.toLowerCase()) as HTMLElement).className;
    };

    it("keeps ghost, which the recipe defines but no user can select app-wide", () => {
      expect(classOf(<Field variant="ghost" />)).not.toBe(classOf(<Field variant="solid" />));
    });

    it("inherits the app-wide variant", () => {
      const { container } = render(
        <StonedogStyleProvider variant="matte">
          <Field />
        </StonedogStyleProvider>,
      );
      expect((container.querySelector(tag.toLowerCase()) as HTMLElement).className).toBe(
        classOf(<Field variant="matte" />),
      );
    });
  });

  // Whether the field actually SIZES itself from the profile is asserted in
  // StyledInputText.ct.tsx. The value is `var(--font-sizes-xl, 2rem)`, and
  // jsdom's CSSStyleDeclaration rejects a `var()` it cannot resolve — React
  // then emits no style attribute at all, so there is nothing here to read
  // whether the component got it right or never set it. A real browser
  // resolves it to pixels, which is a stronger check than the string ever was.
});
