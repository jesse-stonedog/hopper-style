"use client";

import { useSyncExternalStore } from "react";

/**
 * Can the primary input on this device hover?
 *
 * Exists because a hover-triggered tooltip is not merely *degraded* on a touch
 * screen — it is **unreachable**. There is no hover event to fire, and tapping
 * a tooltipped control activates the control rather than explaining it. The
 * help is rendered, correct, and impossible to see.
 *
 * That was a documented gap in this package for as long as `StyledTooltip` has
 * existed, and it stopped being cosmetic when HopperGuard shipped an icon-only
 * navigation rail: on a tablet the icons had no visible names *and* no way to
 * ask for one.
 *
 * ## `(hover: none)`, not `(pointer: coarse)`
 *
 * They are different questions and only the first one is ours. `pointer:
 * coarse` asks how *precise* the input is — a stylus and a TV remote are
 * coarse, and both can hover perfectly well. `hover: none` asks whether the
 * primary input can hover at all, which is exactly the capability a hover
 * trigger depends on.
 *
 * ## Why it defaults to "can hover"
 *
 * `matchMedia` does not exist on the server, and a component that rendered one
 * thing during SSR and another after hydration would produce a mismatch — and
 * a control that appears a moment after the page settles, which for this
 * audience is worse than one that was always there. So the server and the
 * first client render both assume hover, and a device that cannot hover
 * corrects itself on mount.
 *
 * The direction of that default matters: assuming hover means a touch device
 * briefly renders what it has always rendered, then gains the control.
 * Assuming *no* hover would make every desktop render an unnecessary control
 * first and then remove it, which is a visible flicker on the majority case.
 */

const QUERY = "(hover: none)";

function subscribe(onChange: () => void): () => void {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => {};
  }
  const list = window.matchMedia(QUERY);

  // `addEventListener` where it exists, `addListener` where it does not. Safari
  // gained the modern form late, and this package's audience skews towards
  // older devices — exactly the population still on a browser that only has the
  // deprecated one.
  if (typeof list.addEventListener === "function") {
    list.addEventListener("change", onChange);
    return () => list.removeEventListener("change", onChange);
  }
  list.addListener(onChange);
  return () => list.removeListener(onChange);
}

function getSnapshot(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return true;
  return !window.matchMedia(QUERY).matches;
}

/** The server's answer: assume hover, and let the client correct it. */
function getServerSnapshot(): boolean {
  return true;
}

export function useCanHover(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export default useCanHover;
