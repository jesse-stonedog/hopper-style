"use client";

import React, { useCallback, useId, useState } from "react";
import { styled } from "styled-system/jsx";
import StyledBox from "./StyledBox";
import StyledText from "./StyledText";

/**
 * The application footer: a bar that is always on screen, and a panel that
 * opens to show version and service status (NEH-394).
 *
 * Shared by HopperGuard, rozcards.com and optimafilings.com, which is what
 * every decision below follows from.
 *
 * ## It knows nothing about any product
 *
 * Copyright text, trademark legend, version strings, status content and the
 * action buttons all arrive as props. In particular **the actions are a prop,
 * not built in**: HopperGuard passes a row of controls, while rozcards and
 * Optima pass a single dark-mode toggle. A component that knew what the buttons
 * were could not be shared, which is the whole point.
 *
 * ## The toggle is its own control, and the actions are NOT inside it
 *
 * The obvious shape — make the whole bar the trigger — nests the action buttons
 * inside a clickable region, so pressing "dark mode" also toggles the panel and
 * screen readers announce a button inside a button. Here the trigger is one
 * explicit control with `aria-expanded` / `aria-controls`, and the actions sit
 * beside it as siblings.
 *
 * It opens on click, never hover: a panel that closes when the pointer drifts
 * fails anyone whose hand is unsteady, and the harder they try the more it
 * moves.
 *
 * ## No Chakra
 *
 * HopperGuard's version is built on a Chakra `Collapsible`. This package cannot
 * take that dependency, so the disclosure is rebuilt here on a button and a
 * region. It is deliberately NOT `<details>`/`<summary>` either — a `<summary>`
 * would have to contain the action buttons to keep them on the collapsed bar,
 * which is the nested-interactive problem again.
 *
 * ## Sizing lives in inline `style`
 *
 * Panda extracts LITERAL values only, so a metric passed as a prop resolves to
 * no CSS while the class name still lands in the DOM. Anything dimensional here
 * is an inline style reaching the host's scale through custom properties, which
 * also makes it immune to a consumer's Panda `include` glob being wrong.
 */

const Bar = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 2,
    width: "100%",
    flexWrap: "wrap",
  },
});

/**
 * `minHeight`/`minWidth` are stated rather than left to emerge from padding, so
 * no density rung or font scale can erode the target below the house floor of
 * 48px (above WCAG 2.5.5 AAA's 44, deliberately — our readers mis-aim more).
 */
const ToggleButton = styled("button", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    minHeight: "48px",
    minWidth: "48px",
    paddingInline: 3,
    borderRadius: "md",
    border: "1px solid transparent",
    backgroundColor: "transparent",
    color: "textMain",
    cursor: "pointer",
    _hover: { textDecoration: "underline" },
    _focusVisible: { outline: "2px solid", outlineOffset: "2px" },
  },
});

/** Rotates rather than swapping glyphs, so there is one element to label. */
const Chevron = styled("span", {
  base: {
    display: "inline-block",
    lineHeight: 1,
    transition: "transform 150ms ease",
  },
});

const Panel = styled("div", {
  base: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 4,
    width: "100%",
    paddingBlockStart: 2,
  },
});

export interface StyledFooterVersion {
  /** Human-facing release name, e.g. "Spring 2026". */
  name?: string | undefined;
  /** Build identifier, e.g. the package version. */
  build?: string | undefined;
}

export interface StyledFooterProps {
  /** Always visible. The consumer's own line — no product is named here. */
  copyright: string;
  /**
   * Always visible, on its OWN line beneath the copyright.
   *
   * Rendered as a block: `StyledText` is a `<span>`, and two inline siblings
   * share a line however their container is styled — the defect NEH-388 fixed
   * in HopperGuard's footer, reproduced here if this were left inline.
   */
  legend?: string | undefined;
  /** Always visible, at the end of the bar. Whatever controls the product has. */
  actions?: React.ReactNode | undefined;
  /** Shown in the panel when open. */
  version?: StyledFooterVersion | undefined;
  /**
   * Shown in the panel when open — service status, links, anything.
   *
   * A slot rather than a URL on purpose. Status badges are moving vendor
   * (NEH-399), and a component that hard-coded one would need a release to
   * follow. **Note a real constraint before putting a cross-origin badge here:**
   * a browser logs a failed image request whatever the element does about it,
   * and HopperGuard's post-deploy smoke asserts zero console errors — which has
   * already withheld two release tags (NEH-387). Serve such a badge from a
   * same-origin path that can fail server-side, rather than pointing an `<img>`
   * straight at the monitoring host.
   */
  status?: React.ReactNode | undefined;
  /** Controlled open state. Omit to let the component own it. */
  open?: boolean | undefined;
  /** Initial state when uncontrolled. Closed by default: the bar is the point. */
  defaultOpen?: boolean | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;
  /** Visible toggle text. Icons alone assume the reader already knows. */
  showDetailsLabel?: string | undefined;
  hideDetailsLabel?: string | undefined;
  "data-testid"?: string | undefined;
}

export function StyledFooter({
  copyright,
  legend,
  actions,
  version,
  status,
  open,
  defaultOpen = false,
  onOpenChange,
  showDetailsLabel = "Details",
  hideDetailsLabel = "Hide details",
  "data-testid": testId = "styled-footer",
}: StyledFooterProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const panelId = useId();

  // Controlled when `open` is supplied, uncontrolled otherwise — both, because
  // HopperGuard drives this from app state while a marketing site does not want
  // to hold state it has no other use for.
  const isOpen = open ?? uncontrolledOpen;

  const toggle = useCallback(() => {
    const next = !isOpen;
    if (open === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }, [isOpen, open, onOpenChange]);

  return (
    <StyledBox as="footer" width="100%" p={2} data-testid={testId}>
      <Bar>
        <StyledBox p={0}>
          <StyledText size="lg" display="block" data-testid="footer-copyright">
            {copyright}
          </StyledText>
          {legend && (
            <StyledText
              size="sm"
              color="textSecondary"
              display="block"
              data-testid="footer-legend"
            >
              {legend}
            </StyledText>
          )}
        </StyledBox>

        <Bar style={{ width: "auto", flex: "0 0 auto" }}>
          <ToggleButton
            type="button"
            onClick={toggle}
            aria-expanded={isOpen}
            aria-controls={panelId}
            data-testid="footer-toggle"
          >
            <Chevron
              aria-hidden="true"
              style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}
            >
              ›
            </Chevron>
            {/* Visible, not just an aria-label: a label a sighted reader
                cannot see is no label for the audience this serves. */}
            <StyledText size="sm">
              {isOpen ? hideDetailsLabel : showDetailsLabel}
            </StyledText>
          </ToggleButton>
          {actions}
        </Bar>
      </Bar>

      {/* Unmounted rather than hidden: nothing in the panel should be tabbable,
          announced, or fetching while it is closed. */}
      {isOpen && (
        <Panel id={panelId} data-testid="footer-panel">
          {version?.name && (
            <StyledText size="sm" data-testid="footer-version-name">
              {version.name}
            </StyledText>
          )}
          {version?.build && (
            <StyledText size="sm" color="textSecondary" data-testid="footer-version-build">
              {`build ${version.build}`}
            </StyledText>
          )}
          {status}
        </Panel>
      )}
    </StyledBox>
  );
}

export default StyledFooter;
