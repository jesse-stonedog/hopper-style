import React from "react";
import { render, screen } from "@testing-library/react";
import StyledFormLabel from "../StyledFormLabel";

describe("StyledFormLabel", () => {
  it("renders its text", () => {
    render(<StyledFormLabel>Email address</StyledFormLabel>);
    expect(screen.getByText("Email address")).toBeInTheDocument();
  });

  it("associates with a control via htmlFor, so clicking it focuses the field", () => {
    render(
      <>
        <StyledFormLabel htmlFor="email">Email address</StyledFormLabel>
        <input id="email" />
      </>,
    );
    // getByLabelText resolves the for/id pair the same way a browser does, so
    // this fails if the association is broken rather than merely if the text
    // is missing.
    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
  });

  it("adds neither marker by default", () => {
    render(<StyledFormLabel>Nickname</StyledFormLabel>);
    expect(screen.queryByText("*")).toBeNull();
    expect(screen.queryByText("(optional)")).toBeNull();
  });

  it("shows an asterisk when required", () => {
    render(<StyledFormLabel required>Password</StyledFormLabel>);
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("hides the asterisk from assistive tech", () => {
    // Deliberate, and only correct when the control itself is `required` /
    // `aria-required` — the component doc says so, and this pins the behaviour
    // so nobody 'fixes' it into a double announcement.
    render(<StyledFormLabel required>Password</StyledFormLabel>);
    expect(screen.getByText("*")).toHaveAttribute("aria-hidden", "true");
  });

  // Whether the asterisk actually stays OUT of the accessible name is asserted
  // in StyledFormLabel.ct.tsx, not here. `aria-hidden` content is excluded by
  // the accessible-name spec, but testing-library matches label text by
  // `textContent`, which is "Password*" either way — so a jsdom assertion here
  // would be measuring the harness rather than the behaviour. A real browser
  // computes the real name.

  it("shows readable text — not a hidden marker — when optional", () => {
    // The asymmetry with `required` is the point: nothing else carries
    // "optional", so it has to be announced.
    render(<StyledFormLabel optional>Middle name</StyledFormLabel>);
    const marker = screen.getByText("(optional)");
    expect(marker).toBeInTheDocument();
    expect(marker).not.toHaveAttribute("aria-hidden");
  });

  it("can show both markers at once", () => {
    render(
      <StyledFormLabel required optional>
        Odd but permitted
      </StyledFormLabel>,
    );
    expect(screen.getByText("*")).toBeInTheDocument();
    expect(screen.getByText("(optional)")).toBeInTheDocument();
  });

  it("forwards arbitrary props to the label element", () => {
    render(
      <StyledFormLabel data-testid="lbl" id="my-label">
        Anything
      </StyledFormLabel>,
    );
    const el = screen.getByTestId("lbl");
    expect(el.tagName).toBe("LABEL");
    expect(el).toHaveAttribute("id", "my-label");
  });

  describe("theming — the three colours that used to be literals", () => {
    // These assert the generated stylesheet, which is the only place the fix is
    // observable: a hardcoded `#e53e3e` type-checks, renders, and looks fine on
    // the one theme it was picked for. Same defect class as NEH-165/166/171.
    const styleSheet = () =>
      Array.from(document.styleSheets)
        .flatMap((s) => Array.from(s.cssRules))
        .map((r) => r.cssText)
        .join("\n");

    it("paints the required marker from a token, not a hex literal", () => {
      const { container } = render(
        <StyledFormLabel required>Password</StyledFormLabel>,
      );
      expect(container.innerHTML).not.toMatch(/#e53e3e/i);
      expect(styleSheet()).not.toMatch(/#e53e3e/i);
    });

    it("paints the optional marker from a token, not a hex literal", () => {
      const { container } = render(
        <StyledFormLabel optional>Middle name</StyledFormLabel>,
      );
      expect(container.innerHTML).not.toMatch(/#888/i);
      expect(styleSheet()).not.toMatch(/#888\b/i);
    });

    it("does not reference the removed Chakra custom property", () => {
      // The label read `var(--chakra-colors-gray-700, #2D3748)` in an app that
      // had finished removing Chakra, so every label was painted by the
      // fallback and sat outside theming entirely — invisible because it
      // worked.
      const { container } = render(<StyledFormLabel>Email</StyledFormLabel>);
      expect(container.innerHTML).not.toMatch(/chakra/i);
      expect(styleSheet()).not.toMatch(/--chakra-colors/i);
    });
  });
});
