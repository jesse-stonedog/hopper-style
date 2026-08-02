"use client";

import React from "react";
import { styled } from "styled-system/jsx";
import StyledTooltip from "./StyledTooltip";

/**
 * An on/off switch.
 *
 * ## No animation library
 *
 * The originating component used framer-motion for two things: sliding the
 * handle, and growing a strike-through when disabled. Both are a CSS
 * transition, and a whole animation library is a heavy thing to make three
 * products carry for a 26px circle that moves 30px. This package has one
 * runtime dependency and that is worth defending.
 *
 * The spring is gone with it. A spring on a binary control is decoration —
 * there is no in-between state to communicate — and it delayed the settled
 * position by longer than the ease does.
 *
 * **It honours `prefers-reduced-motion`.** Motion is a vestibular trigger, not
 * only a preference; under that query the handle moves instantly.
 *
 * ## It is a real button
 *
 * The original was a `<div role="switch">` with hand-written `Space`/`Enter`
 * handling and a manual `tabIndex`. A `<button>` gets all of that from the
 * platform — focus, activation, the disabled semantics — and gets them right in
 * the cases hand-rolled versions miss, like activation on key-up rather than
 * key-down.
 *
 * ## Three defects fixed on the way in
 *
 * **It was under the tap-target floor.** The switch was 60×30 CSS px against a
 * 44×44 minimum (WCAG 2.5.5). The track still *looks* 60×30 — the button pads
 * out to 44 around it, so the appearance is unchanged and the target is legal.
 * Shrinking the visible track would have been the wrong fix; a switch reads as
 * a switch at that size.
 *
 * **It painted itself from the raw palette** — `gray.300`, `green.400`,
 * `white` — so it ignored the theme and dark mode entirely. Now tokens, chosen
 * from `TEXT_BACKGROUND_PAIRS` rather than by eye: the handle is the *text*
 * token belonging to whichever track surface is under it, which is the
 * package's own contract for "these two are readable together".
 *
 * **It could end up with no accessible name.** The old fallback used `tooltip`
 * only when it happened to be a string, so a node tooltip left the switch
 * announced as "switch" with no name at all. `label` is now explicit, with the
 * string tooltip still serving as a fallback.
 */

export interface StyledInputToggleProps {
  id?: string;
  value: boolean;
  onChange: (value: boolean) => void;
  /** Shown above the switch when on. */
  iconOn?: React.ReactNode;
  /** Shown above the switch when off. */
  iconOff?: React.ReactNode;
  disabled?: boolean;
  tooltip?: React.ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
  /** Accessible name. Pass it — see above. */
  label?: string;
  ["data-testid"]?: string;
}

const ToggleContainer = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "2",
  },
});

const IconContainer = styled("div", {
  base: { position: "relative" },
});

const StrikeThrough = styled("div", {
  base: {
    position: "absolute",
    top: "50%",
    left: 0,
    width: "100%",
    height: "2px",
    backgroundColor: "currentColor",
    transformOrigin: "center",
    transform: "scaleX(1)",
    animation: "stonedogStrikeIn 200ms ease-out",
    "@media (prefers-reduced-motion: reduce)": {
      animation: "none",
    },
  },
});

/**
 * The button. Its padding is what carries the 44px floor: the visible track
 * inside stays 60×30, so nothing looks different and the target is legal.
 */
const SwitchButton = styled("button", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "48px",
    minHeight: "48px",
    padding: "0",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    borderRadius: "md",
    _disabled: {
      cursor: "not-allowed",
      opacity: 0.5,
    },
  },
});

const Track = styled("span", {
  base: {
    display: "flex",
    alignItems: "center",
    width: "60px",
    height: "30px",
    borderRadius: "15px",
    padding: "2px",
    transition: "background-color 200ms ease",
    "@media (prefers-reduced-motion: reduce)": {
      transition: "none",
    },
  },
  variants: {
    on: {
      // Token pairs from TEXT_BACKGROUND_PAIRS — the handle below reads against
      // whichever of these is under it.
      true: { backgroundColor: "buttonBgAccent" },
      false: { backgroundColor: "boxBgSecondary" },
    },
  },
});

const Handle = styled("span", {
  base: {
    width: "26px",
    height: "26px",
    borderRadius: "50%",
    // translateX, not `margin-left: auto` — a margin change is not animatable,
    // which is why the original needed a layout animation to move at all.
    transform: "translateX(0)",
    transition: "transform 200ms ease, background-color 200ms ease",
    "@media (prefers-reduced-motion: reduce)": {
      transition: "none",
    },
  },
  variants: {
    on: {
      true: {
        transform: "translateX(30px)",
        backgroundColor: "buttonTextAccent",
      },
      false: { backgroundColor: "textSecondary" },
    },
  },
});

export default function StyledInputToggle({
  id,
  value,
  onChange,
  iconOn,
  iconOff,
  disabled,
  tooltip,
  placement,
  label,
  ...props
}: StyledInputToggleProps) {
  const hasIcons = iconOn || iconOff;
  const name = label ?? (typeof tooltip === "string" ? tooltip : undefined);

  const content = (
    <ToggleContainer id={id}>
      {hasIcons && (
        <IconContainer>
          {value ? iconOn : iconOff}
          {/* Decorative: the switch's own state is already announced by
              aria-checked and aria-disabled. */}
          {disabled && <StrikeThrough aria-hidden="true" data-testid="toggle-strike" />}
        </IconContainer>
      )}
      <SwitchButton
        type="button"
        role="switch"
        aria-checked={value}
        aria-label={name}
        disabled={disabled}
        data-state={value ? "on" : "off"}
        // The caller's id lands on the BUTTON, not the container. A test that
        // does `click(getByTestId(...))` has to hit the interactive element —
        // clicking a wrapper does nothing, and the failure looks like a broken
        // component rather than a mis-aimed selector.
        data-testid={props["data-testid"] ?? "toggle-switch"}
        onClick={() => onChange(!value)}
      >
        <Track on={value}>
          <Handle on={value} />
        </Track>
      </SwitchButton>
    </ToggleContainer>
  );

  if (tooltip) {
    return (
      <StyledTooltip tooltip={tooltip} placement={placement}>
        {content}
      </StyledTooltip>
    );
  }

  return content;
}
