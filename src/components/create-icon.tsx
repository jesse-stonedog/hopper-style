"use client";

import React from "react";
import StyledIcon, { type StyledIconProps } from "./StyledIcon";

/**
 * Build a named icon component from any node.
 *
 * An icon set is a few hundred near-identical wrappers, and hand-writing them
 * is how a set drifts — one forgets to forward `size`, another hardcodes a
 * colour, a third omits `displayName` and shows up as `Unknown` in every stack
 * trace. This makes each one a single line and forces them to agree.
 *
 * ```tsx
 * import { Home } from "lucide-react";
 * export const StyledHome = createIcon("StyledHome", <Home />);
 * ```
 *
 * The artwork stays yours: nothing about the icon set reaches this package, so
 * a commercially licensed set can be wrapped in a private package while the
 * components that lay it out stay open.
 */
export function createIcon(
  displayName: string,
  node: React.ReactNode,
): React.FC<Omit<StyledIconProps, "icon" | "children">> {
  const Icon: React.FC<Omit<StyledIconProps, "icon" | "children">> = (props) => (
    <StyledIcon {...props} icon={node} />
  );
  Icon.displayName = displayName;
  return Icon;
}

/**
 * The same, for sets whose icons are components taking their own props —
 * Lucide, Heroicons, react-icons, and anything else exporting one component per
 * glyph.
 *
 * ```tsx
 * import { Home } from "lucide-react";
 * export const StyledHome = createIconFromComponent("StyledHome", Home);
 * ```
 *
 * The wrapped component is rendered with `width`/`height` at 100% so it fills
 * the box `size` establishes rather than fighting it — most sets default to
 * 24px and would otherwise ignore the size prop entirely.
 */
export function createIconFromComponent<P extends object>(
  displayName: string,
  Component: React.ComponentType<P>,
  componentProps?: P,
): React.FC<Omit<StyledIconProps, "icon" | "children">> {
  const Icon: React.FC<Omit<StyledIconProps, "icon" | "children">> = (props) => (
    <StyledIcon
      {...props}
      icon={
        <Component
          {...({ width: "100%", height: "100%" } as unknown as P)}
          {...(componentProps ?? ({} as P))}
        />
      }
    />
  );
  Icon.displayName = displayName;
  return Icon;
}
