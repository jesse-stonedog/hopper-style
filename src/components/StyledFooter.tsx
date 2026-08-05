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

export interface StyledFooterStatusBadge {
  /**
   * Where to load the badge image from.
   *
   * **A SAME-ORIGIN path, not the monitoring vendor's URL.** This is the whole
   * reason the prop takes a URL rather than a monitor id, and it is not a
   * preference:
   *
   * A cross-origin image that fails to load logs a console error, and nothing
   * the element does can suppress it — `onError` can hide the picture but
   * cannot un-log the request. HopperGuard's post-deploy smoke asserts zero
   * console errors, so a monitoring host having a bad day **withholds a
   * production release tag**. That has already happened twice (NEH-387), which
   * is why an embedded status page was removed from that app entirely.
   *
   * The shape that works is a route on your own origin that proxies the vendor
   * and **always answers with an image** — a placeholder SVG on failure, never
   * a 4xx/5xx. HopperGuard's `/api/status-badge` does exactly that, and reads
   * its `UPTIMESIGNAL_MONITOR_ID` from server env, so the id never reaches the
   * browser and this component never needs to know it.
   */
  src: string;
  /**
   * Accessible name, used as the image's `alt`. Default: "Service status".
   *
   * Not empty by default: the badge carries information (a service is up or it
   * is not), so it is not decorative, and `alt=""` would hide that from a
   * screen reader entirely.
   */
  label?: string | undefined;
  /** Optional link to a fuller status page, wrapped around the badge. */
  href?: string | undefined;
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
   * An uptime badge, shown in the panel when open.
   *
   * **Optional, and the footer is complete without it.** Every product using
   * this today has a monitor, but a page that has none — a marketing site, a
   * preview build, a product before its monitor exists — must still render a
   * correct footer rather than a gap or a broken image. Omitting it renders
   * nothing at all, and a test pins that.
   *
   * See `StyledFooterStatusBadge.src` for why this is a URL and not a monitor
   * id. It is the difference between a badge and a withheld release tag.
   */
  statusBadge?: StyledFooterStatusBadge | undefined;
  /**
   * Anything else for the panel — extra links, a build date, a region.
   *
   * The general escape hatch, kept alongside `statusBadge` rather than replaced
   * by it. `statusBadge` exists because three products would otherwise each
   * hand-roll the same `<img>` and each get the failure handling subtly
   * different; this is for the cases it does not cover.
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

/**
 * The badge, or nothing.
 *
 * Hides itself if the image fails rather than leaving a broken-image icon in
 * the footer. Note what this does NOT do: it cannot prevent the browser logging
 * the failed request. That is why `src` must be a same-origin route that always
 * answers with an image — see `StyledFooterStatusBadge.src`. This handles the
 * cosmetic half; the src choice handles the half that breaks deploys.
 */
function StatusBadge({ src, label, href }: StyledFooterStatusBadge) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;

  const img = (
    <img
      src={src}
      alt={label ?? "Service status"}
      // Height only: a badge's width varies with its text ("99.98% uptime" is
      // wider than "up"), so constraining both would distort it. A literal in
      // inline style rather than a Panda prop, because a consumer's `include`
      // glob being wrong would otherwise leave this unsized.
      style={{ height: "20px", display: "block" }}
      onError={() => setFailed(true)}
      data-testid="footer-status-badge"
    />
  );

  if (!href) return img;
  return (
    <a href={href} target="_blank" rel="noreferrer noopener" data-testid="footer-status-link">
      {img}
    </a>
  );
}

export function StyledFooter({
  copyright,
  legend,
  actions,
  version,
  statusBadge,
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
          {statusBadge && <StatusBadge {...statusBadge} />}
          {status}
        </Panel>
      )}
    </StyledBox>
  );
}

export default StyledFooter;
