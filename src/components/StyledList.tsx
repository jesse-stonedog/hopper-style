"use client";

import React from "react";
import { styled } from "styled-system/jsx";
import { listRecipe } from "styled-system/recipes";
import { useResolvedVariant } from "../config/style-config";
import { log } from "../config/logger";

/**
 * A vertical list of rows — the surface, borders and row separators that turn
 * a `<ul>` into a panel.
 *
 * Compose it: `StyledList.Root` draws the container, `StyledList.Item` draws a
 * row. Both are required; an `Item` outside a `Root` is a bare `<li>`, which is
 * the correct behaviour and also the reason the previous version had a bug —
 * see below.
 *
 * ## The variants a call site can ask for
 *
 * The five app-wide appearances plus `ghost`, `none` and `unstyled`. Anything
 * else falls back to `solid` through `useResolvedVariant`, rather than being
 * passed to the recipe and rendering as nothing.
 *
 * ## Three defects fixed on the way across
 *
 * **The default variant was a variant that does not exist.** The originating
 * version read `variant ?? globalVariant ?? "list"` — and `"list"` is the
 * recipe's *className*, not one of its variants. Any consumer rendering a list
 * before a `StonedogStyleProvider` had supplied a global variant therefore
 * asked the recipe for `variant: "list"`, matched nothing, and got an unstyled
 * list: no surface, no border, no row separators. It looked like a list that
 * had simply not been styled yet, which is exactly why it survived.
 *
 * Resolution goes through `useResolvedVariant` now, with the allow-list, which
 * is the mechanism NEH-234 added for precisely this class of miss.
 *
 * **The row styling was injected by the parent, not owned by the row.** `Root`
 * walked its children with `React.Children.map` and `cloneElement`d the item
 * class onto each one. That breaks in the three ways cloning children always
 * breaks: a `<>fragment</>` of rows received the class on the *fragment*, a
 * row rendered by a child component never saw it, and any row that was not a
 * direct child was skipped. It also meant `StyledList.Item` had no styling of
 * its own — so the component only worked in the one arrangement its author
 * happened to test.
 *
 * `Item` now carries its own slot class. Rows render correctly wherever they
 * are, including inside a `.map()`, a fragment, or a wrapper component.
 *
 * **`gap` was hand-implemented as a margin on every child but the last.** The
 * recipe root is already `display: flex; flex-direction: column`, so this was
 * reimplementing the `gap` property — badly, because writing `marginBottom`
 * into each child's inline `style` silently overwrote any margin the caller had
 * set there. It is a real `gap` now.
 *
 * ## `role="list"` is not redundant here
 *
 * Safari removes list semantics from any `<ul>` whose `list-style` is `none` —
 * a deliberate WebKit decision, and this component sets exactly that whenever
 * bullets are off (the default). Without the explicit role, VoiceOver stops
 * announcing "list, 6 items", which is the one piece of information a
 * non-visual reader needs before deciding whether to read on.
 */

const PandaUl = styled("ul");
const PandaOl = styled("ol");
const PandaListItem = styled("li");

/** What a call site may ask for, beyond the five app-wide appearances. */
export const LIST_VARIANTS = [
  "solid",
  "outline",
  "lines",
  "aurora",
  "glass",
  "matte",
  "ghost",
  "none",
  "unstyled",
] as const;

export type ListVariant = (typeof LIST_VARIANTS)[number];

export type StyledListRootProps = React.PropsWithChildren<
  React.HTMLAttributes<HTMLUListElement | HTMLOListElement> & {
    /**
     * `| undefined` is spelled out throughout this file because the repo runs
     * `exactOptionalPropertyTypes`: without it a caller holding a
     * possibly-unset variant cannot forward it, even though "unset" is exactly
     * the case this component handles by following the app.
     */
    variant?: ListVariant | undefined;
    /** Space between rows. A real CSS `gap` — see the note above. */
    gap?: string | number | undefined;
    /** Render as `<ol>` with numbers. */
    showNumbers?: boolean;
    /** Render bullets. Off by default; see the `role="list"` note. */
    showBullets?: boolean;
  }
>;

const StyledListRoot = React.forwardRef<
  HTMLUListElement | HTMLOListElement,
  StyledListRootProps
>(
  (
    { children, variant, gap, showNumbers, showBullets, className, style, ...rest },
    ref,
  ) => {
    log.trace("StyledListRoot rendered");

    const resolved = useResolvedVariant(variant, LIST_VARIANTS);
    const recipeClasses = listRecipe({ variant: resolved });

    const listStyle = showNumbers ? "decimal" : showBullets ? "disc" : "none";

    const ListTag = showNumbers ? PandaOl : PandaUl;

    return (
      <ListTag
        ref={ref as React.Ref<HTMLUListElement & HTMLOListElement>}
        className={[recipeClasses.root, className].filter(Boolean).join(" ")}
        // `role` only when the marker is gone — with real markers the native
        // semantics are intact and an explicit role would be noise.
        role={listStyle === "none" ? "list" : undefined}
        style={{
          listStyleType: listStyle,
          paddingLeft: listStyle !== "none" ? "1.5em" : undefined,
          // Inline rather than a Panda `gap` prop: the value arrives at
          // runtime, and Panda extracts at build time, so a prop here would
          // emit a class with no rule behind it. Same trap as NEH-233.
          ...(gap !== undefined ? { gap } : {}),
          ...style,
        }}
        {...rest}
      >
        {children}
      </ListTag>
    );
  },
);

StyledListRoot.displayName = "StyledList.Root";

export type StyledListItemProps = React.LiHTMLAttributes<HTMLLIElement> & {
  /**
   * Match the `Root`'s variant. Only needed when a row is rendered outside the
   * `Root`'s own subtree — otherwise leave it; rows inherit their surface from
   * the container's recipe.
   */
  variant?: ListVariant | undefined;
};

const StyledListItem = React.forwardRef<HTMLLIElement, StyledListItemProps>(
  ({ children, className, variant, ...props }, ref) => {
    const resolved = useResolvedVariant(variant, LIST_VARIANTS);
    const recipeClasses = listRecipe({ variant: resolved });

    return (
      <PandaListItem
        ref={ref}
        className={[recipeClasses.item, className].filter(Boolean).join(" ")}
        {...props}
      >
        {children}
      </PandaListItem>
    );
  },
);

StyledListItem.displayName = "StyledList.Item";

const StyledList = {
  Root: StyledListRoot,
  Item: StyledListItem,
};

export default StyledList;
