"use client";

import { log } from "../config/logger";
import React from "react";
import { styled } from "styled-system/jsx";
import type { HTMLStyledProps } from "styled-system/types";

/**
 * A mark beside a wordmark, at one of three sizes.
 *
 * Copyright (C) 2026 StoneDogCode L.L.C. All rights reserved.
 *
 * ## Why this exists
 *
 * HopperGuard carries **nine** logo files — `logos/{elder,hopperguard,kids}/
 * logo-{large,medium,small}-*.tsx` — that are ~95% identical markup differing
 * only in size constants and colour tokens. NEH-287 names the consequence: the
 * per-size numbers drifted apart, so the logo's proportions were not stable
 * across breakpoints, and a fix had to be applied nine times or not at all.
 * Optima Filings Cloud was about to become the tenth.
 *
 * So the *structure* lives here once and the *content* is passed in. This
 * package owns shape and knows nothing about any brand — no artwork, no
 * colours, no product names. `logo` and `title` are both `ReactNode`, which is
 * what lets HopperGuard pass its two-part `HOPPER`+`Guard` wordmark (two fonts,
 * two colour tokens, one letter-spacing) while Optima passes a plain string.
 *
 * ## What it deliberately does NOT do
 *
 * **No trademark glyph.** The previous implementation nudged a `™` into place
 * with hand-tuned pixel offsets that were different at every size — three magic
 * pairs whose only job was to make one glyph land, and which a screen reader
 * announced as "trade mark sign" on every page. NEH-287 moves that notice to
 * the footer, where it is a stronger notice and read once. A caller that wants
 * a symbol can put one in `title`; nothing here positions it.
 *
 * **No by-line.** Same issue: only one brand had one, and centring the column
 * that held it pushed the wordmark visibly above the mark's optical centre.
 * Provenance belongs beside the copyright, not in the chrome on every screen.
 *
 * With both gone the row is a mark and a single line of text, so
 * `alignItems: center` centres it correctly with no compensating offset — which
 * is the whole reason those offsets existed.
 */

/** The three rungs. Named, not numeric, so a caller cannot invent a tenth. */
export const TITLE_LOGO_SIZES = ["small", "medium", "large"] as const;
export type TitleLogoSize = (typeof TITLE_LOGO_SIZES)[number];

export function isTitleLogoSize(value: unknown): value is TitleLogoSize {
  return TITLE_LOGO_SIZES.includes(value as TitleLogoSize);
}

interface SizeMetrics {
  /** Box the mark is given. Square: every mark here is a round or square badge. */
  readonly mark: string;
  /** Wordmark size, as a `--font-sizes-*` key so the host's scale still applies. */
  readonly title: string;
  readonly subtitle: string;
  readonly gap: string;
}

/**
 * rem throughout, never px.
 *
 * A logo pinned in px ignores the browser's own font-size setting, which is the
 * affordance people with low vision actually reach for — and a header that
 * refuses to grow with it is the one piece of chrome on every page.
 */
export const TITLE_LOGO_METRICS: Record<TitleLogoSize, SizeMetrics> = {
  small: { mark: "2rem", title: "lg", subtitle: "xs", gap: "0.5rem" },
  medium: { mark: "3rem", title: "2xl", subtitle: "sm", gap: "0.75rem" },
  large: { mark: "4.5rem", title: "4xl", subtitle: "md", gap: "1rem" },
};

const Row = styled("span", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    minWidth: 0,
  },
});

const Mark = styled("span", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    // Anything handed in — an <img>, an <svg>, a self-sizing component — is
    // contained rather than allowed to set the row's height. Without this a
    // logo with its own intrinsic size silently drives the header's height and
    // the three rungs stop meaning anything.
    "& > *": { maxWidth: "100%", maxHeight: "100%" },
    "& img, & svg": { width: "100%", height: "100%", objectFit: "contain" },
  },
});

const TextColumn = styled("span", {
  base: {
    display: "inline-flex",
    flexDirection: "column",
    justifyContent: "center",
    minWidth: 0,
  },
});

export interface TitleLogoProps extends Omit<HTMLStyledProps<"span">, "title"> {
  /** The wordmark. A string, or nodes when the brand styles it in parts. */
  title: React.ReactNode;
  /** The mark. Omit for a text-only lockup. */
  logo?: React.ReactNode | undefined;
  /** Optional second line. Prefer the footer for provenance — see the header. */
  subtitle?: React.ReactNode | undefined;
  size?: TitleLogoSize | undefined;
  /**
   * Accessible name for the lockup as a whole.
   *
   * Given, the row becomes a single labelled image to assistive tech and the
   * decorative mark is hidden — otherwise a screen reader announces the mark
   * and the wordmark as two separate things, which is one thing too many for a
   * logo. Defaults to `title` when that is a plain string.
   */
  label?: string | undefined;
}

export const TitleLogo = React.forwardRef<HTMLSpanElement, TitleLogoProps>(
  function TitleLogo(
    { title, logo, subtitle, size = "medium", label, ...rest },
    ref,
  ) {
    log.trace("TitleLogo rendered");

    const metrics = TITLE_LOGO_METRICS[isTitleLogoSize(size) ? size : "medium"];
    const accessibleName = label ?? (typeof title === "string" ? title : undefined);

    return (
      <Row
        ref={ref}
        gap={metrics.gap}
        data-testid="title-logo"
        data-size={size}
        {...(accessibleName ? { role: "img", "aria-label": accessibleName } : {})}
        {...rest}
      >
        {logo ? (
          <Mark
            data-testid="title-logo-mark"
            width={metrics.mark}
            height={metrics.mark}
            // Hidden when the row already carries the name: announcing the mark
            // separately would repeat it.
            {...(accessibleName ? { "aria-hidden": true } : {})}
          >
            {logo}
          </Mark>
        ) : null}

        <TextColumn>
          <styled.span
            data-testid="title-logo-title"
            fontSize={metrics.title}
            fontWeight="600"
            lineHeight="1.1"
            letterSpacing="-0.01em"
          >
            {title}
          </styled.span>
          {subtitle ? (
            <styled.span
              data-testid="title-logo-subtitle"
              fontSize={metrics.subtitle}
              lineHeight="1.2"
              opacity={0.75}
            >
              {subtitle}
            </styled.span>
          ) : null}
        </TextColumn>
      </Row>
    );
  },
);

export default TitleLogo;
