"use client";

import React, { useEffect, useRef, useState } from "react";
import { styled } from "styled-system/jsx";
import StyledBox from "./StyledBox";
import StyledText from "./StyledText";
import StyledVStack from "./StyledVStack";
import StyledHStack from "./StyledHStack";
import StyledScrollbar from "./StyledScrollbar";
import StyledTooltip from "./StyledTooltip";

/**
 * Tool navigation for applications whose readers are often elderly and
 * sometimes cognitively impaired. See `docs/prd/PRD-0001-styled-sidebar.md`
 * for the reasoning behind each of these choices — this file implements it.
 *
 * The short version of the contract:
 *
 *   **This component renders what it is given.** It does not sort, does not
 *   filter, and owns no search field. `items` arrive already ordered and
 *   already filtered, so ordering is a host preference and search is a host
 *   concern — which is also what lets a host supply a dictation-capable input
 *   this package could never depend on.
 *
 * Every item is an icon *and* a name; there is no icon-only rendering, not
 * even collapsed. Help opens on click, never hover. Nothing anywhere in here
 * changes state on hover.
 *
 * **`iconOnlyWhenCollapsed` is the one documented exception** (PRD §20a), and
 * it is opt-in for exactly that reason. A host that sets it accepts an
 * icon-only rail — the thing §20 rejects — in exchange for the horizontal
 * space. The mitigations that make it defensible are not optional and are
 * enforced below: the button keeps the tool's name as its accessible name, so
 * nothing is lost to assistive technology, and the name and description are
 * reachable as a tooltip. Read `collapsedTooltipTrigger` before assuming a
 * touch reader can see either.
 */

/**
 * Minimum interactive size, stated as a `minHeight` on the element's own base
 * rather than left to emerge from padding — so no density step, font profile
 * or zoom level can erode it (PRD §A4).
 *
 * Two floors, not one. 48 is the hard minimum the whole package holds itself
 * to; the PRD asks for 60 "where layout allows", and a full-width item row is
 * exactly where it allows. The narrow rail controls (pager, collapse) sit in a
 * strip beside the list, where 60 would crowd the tools themselves, so they
 * keep the 48 floor.
 */
const ITEM_MIN_TARGET = "60px";
const CONTROL_MIN_TARGET = "48px";

export interface SidebarItem {
  id: string;
  /** Supplied by the host — this package ships no icons. */
  icon?: React.ReactNode;
  /** The tool's name. Always rendered. */
  label: string;
  /** One line, rendered beneath the name. */
  description?: string;
  /** Revealed by the item's help control, on click. */
  help?: React.ReactNode;
}

export interface StyledSidebarProps {
  /** Already ordered and already filtered by the host. */
  items: SidebarItem[];
  selectedId?: string;
  onSelect: (id: string) => void;
  /** How to handle more items than fit. Default `"scroll"`. */
  overflow?: "scroll" | "paging";
  /** Items per page when `overflow="paging"`. */
  itemsPerPage?: number;
  /** Controlled. Omit to let the component own the state via `defaultCollapsed`. */
  collapsed?: boolean;
  /**
   * Initial collapsed state when uncontrolled. Default `false`.
   *
   * Separate from `collapsed` so a host can say "start collapsed" without
   * taking on the state itself. Supplying `collapsed` wins.
   */
  defaultCollapsed?: boolean;
  onCollapsedChange?: (next: boolean) => void;
  /**
   * Render collapsed items as an icon-only rail, with the name and description
   * moved into a tooltip. Default `false`.
   *
   * **This is the PRD §20a exception and it is off by default deliberately.**
   * §20 rejects an icon-only rail because it reinstates the guess-the-glyph
   * problem the component exists to remove. A host opting in is trading that
   * away for horizontal space, which is a decision only a host can make — the
   * package will not make it for them, and the two other consumers of this
   * component must not inherit it silently.
   *
   * The name is *never* actually lost: collapsed buttons carry it as their
   * accessible name, so a screen reader announces the tool regardless.
   *
   * **On its own this recovers NO horizontal space, and that surprises people.**
   * The sidebar fills whatever width its container gives it; it does not narrow
   * itself, because layout is the host's to own. A host that sets this flag and
   * leaves its rail at its old width has traded away the visible names for
   * nothing — with no build error and nothing to notice. **Narrow the container
   * when collapsed; that is the other half of the bargain.** A component test
   * pins the part this component does owe: it must survive being narrowed.
   */
  iconOnlyWhenCollapsed?: boolean;
  /**
   * How the collapsed item's name/description tooltip opens. Default `"hover"`.
   *
   * `"click"` renders an explicit control instead, and is what a host should
   * pass when its reader has asked for help-on-press — HopperGuard drives this
   * from its `accessibility.clickForTooltips` setting.
   *
   * **It is also the only mode a touch reader can use.** `StyledTooltip` has no
   * touch trigger (hover and focus only), so on a tablet the hover mode reveals
   * nothing: tapping an icon-only item activates it rather than explaining it.
   * A host shipping `iconOnlyWhenCollapsed` to touch devices wants `"click"`.
   */
  collapsedTooltipTrigger?: "hover" | "click";
  /** Rendered when `items` is empty — e.g. "No tools match that search." */
  emptyState?: React.ReactNode;
  /** e.g. "TOOLS". */
  heading?: React.ReactNode;
  /** Names the navigation landmark. */
  "aria-label"?: string;
}

const ItemButton = styled("button", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "3",
    // `flex: 1` + `minWidth: 0`, not `width: 100%`. The row also holds the help
    // control, and a child that insists on the full width pushes that control
    // off the edge — which at 375px is the whole reason the help exists.
    flex: "1 1 auto",
    minWidth: 0,
    minHeight: ITEM_MIN_TARGET,
    px: "3",
    py: "2",
    textAlign: "left",
    borderRadius: "md",
    // The width is constant across states, so selecting an item cannot change
    // its size and shuffle everything below it. Only the colour moves — and
    // colour is never the only signal (see the label's weight below).
    borderWidth: "2px",
    borderStyle: "solid",
    cursor: "pointer",
  },
});

/**
 * The label column.
 *
 * A plain styled span rather than `StyledVStack`, purely so these two
 * declarations are statically extractable: `minWidth: 0` is what lets a long
 * tool name wrap instead of overflowing the rail (a flex child's default
 * `min-width: auto` refuses to shrink below its longest word), and
 * `overflowWrap` handles the single word longer than the rail (PRD §A3).
 */
const ItemLabels = styled("span", {
  base: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    minWidth: 0,
    overflowWrap: "anywhere",
  },
});

/** Keeps a host's icon from being squashed by a long label. */
const ItemIcon = styled("span", {
  base: { display: "inline-flex", flexShrink: 0 },
});

/** Keeps the help control at its full size when the label is long. */
const HelpSlot = styled("span", {
  base: { display: "inline-flex", flexShrink: 0 },
});

const PagerButton = styled("button", {
  base: {
    minWidth: CONTROL_MIN_TARGET,
    minHeight: CONTROL_MIN_TARGET,
    px: "3",
    borderRadius: "md",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "borderBgPrimary",
    color: "textPrimary",
    cursor: "pointer",
    _disabled: { opacity: 0.5, cursor: "not-allowed" },
  },
});

const CollapseButton = styled("button", {
  base: {
    minWidth: CONTROL_MIN_TARGET,
    minHeight: CONTROL_MIN_TARGET,
    px: "2",
    borderRadius: "md",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "borderBgPrimary",
    color: "textPrimary",
    cursor: "pointer",
  },
});

const StyledSidebar: React.FC<StyledSidebarProps> = ({
  items,
  selectedId,
  onSelect,
  overflow = "scroll",
  itemsPerPage = 8,
  collapsed,
  defaultCollapsed,
  onCollapsedChange,
  iconOnlyWhenCollapsed = false,
  collapsedTooltipTrigger = "hover",
  emptyState,
  heading,
  "aria-label": ariaLabel = "Tools",
}) => {
  const [page, setPage] = useState(0);

  // Controlled when `collapsed` is supplied, uncontrolled otherwise. The
  // internal state moves either way — see the toggle below.
  const [uncontrolledCollapsed, setUncontrolledCollapsed] = useState(defaultCollapsed ?? false);
  const isCollapsed = collapsed !== undefined ? collapsed : uncontrolledCollapsed;

  // Whether this sidebar can collapse AT ALL, which is a different question
  // from whether it currently is.
  //
  // `defaultCollapsed` is read undefined-vs-absent rather than defaulted to
  // `false`, because those two mean different things here: a host that says
  // nothing must keep the sidebar it already has. Treating "uncontrolled" as
  // "collapsible" would grow a collapse control on optima-filings and
  // optima-cloud-saas, neither of which asked for one and neither of which
  // would see a build error — the silent-default hazard CLAUDE.md describes.
  const canCollapse = onCollapsedChange !== undefined || defaultCollapsed !== undefined;

  const toggleCollapsed = () => {
    const next = !isCollapsed;
    if (collapsed === undefined) setUncontrolledCollapsed(next);
    onCollapsedChange?.(next);
  };

  // The rail is icon-only only when BOTH are true. Keeping this one derived
  // value rather than testing the pair at each site is what stops a later edit
  // dropping the icon while leaving the label suppressed, which would render an
  // item with nothing in it at all.
  const iconOnly = isCollapsed && iconOnlyWhenCollapsed;

  // Paging resets whenever the item set changes. Without this a host that
  // narrows `items` (a search) leaves the reader on a page that no longer
  // exists — the single most likely bug in this component (PRD §D16).
  const itemsKey = items.map((i) => i.id).join("|");
  const lastKey = useRef(itemsKey);
  useEffect(() => {
    if (lastKey.current !== itemsKey) {
      lastKey.current = itemsKey;
      setPage(0);
    }
  }, [itemsKey]);

  const paging = overflow === "paging";
  const pageCount = paging ? Math.max(1, Math.ceil(items.length / itemsPerPage)) : 1;
  const safePage = Math.min(page, pageCount - 1);
  const visible = paging
    ? items.slice(safePage * itemsPerPage, safePage * itemsPerPage + itemsPerPage)
    : items;

  const list = (
    <StyledVStack gap={1} alignItems="stretch" role="list" data-testid="sidebar-items">
      {visible.map((item) => {
        const isSelected = item.id === selectedId;

        const button = (
          <ItemButton
              type="button"
              onClick={() => onSelect(item.id)}
              // Selection is announced, not just drawn.
              aria-current={isSelected ? "true" : undefined}
              // The name survives the icon-only rail. Without this the button's
              // accessible name is whatever the host's icon happens to expose —
              // usually nothing — so a screen reader announces "button" and the
              // rail becomes unusable rather than merely terse. This is the
              // mitigation that makes PRD §20a defensible; it is not optional.
              aria-label={iconOnly ? item.label : undefined}
              data-testid={`sidebar-item-${item.id}`}
              data-icon-only={iconOnly ? "true" : undefined}
              data-selected={isSelected ? "true" : undefined}
              // Tokens, as ternaries on Panda style props — never an inline
              // `style={{ background: "var(--colors-…)" }}`. A literal custom
              // property in a component bypasses the token layer, which is the
              // only thing that re-points under a consumer's `cssVarPrefix`,
              // and it also never reaches the stylesheet so nothing can grep
              // for it. This is the package's oldest defect class (CLAUDE.md,
              // "Token compliance").
              borderColor={isSelected ? "borderBgAccent" : "transparent"}
              background={isSelected ? "boxBgAccent" : "transparent"}
            >
              {item.icon !== undefined && item.icon !== null && <ItemIcon>{item.icon}</ItemIcon>}
              {/* The labels are dropped entirely only under the §20a opt-in.
                  Plain `collapsed` still renders the name and drops just the
                  description, which is what §20 asks for and remains the
                  default for every host that says nothing. */}
              {!iconOnly && (
                <ItemLabels>
                  <StyledText
                    // Weight, not just colour. Selection must survive greyscale,
                    // a high-contrast theme and colour blindness (PRD §C10) —
                    // and `aria-current` carries it to assistive technology.
                    fontWeight={isSelected ? "bold" : "normal"}
                    color={isSelected ? "textAccent" : "textPrimary"}
                  >
                    {item.label}
                  </StyledText>
                  {!isCollapsed && item.description && (
                    // `size`, not `fontSize`: StyledText writes its resolved size
                    // into an inline `style`, which beats any class a `fontSize`
                    // prop would generate. The prop looked right and did nothing.
                    <StyledText size="sm" color={isSelected ? "textAccent" : "textSecondary"}>
                      {item.description}
                    </StyledText>
                  )}
                </ItemLabels>
              )}
            </ItemButton>
        );

        return (
          <StyledHStack key={item.id} gap={1} alignItems="center" role="listitem">
            {iconOnly ? (
              // The name and description are what the rail just took away, so
              // this tooltip is not decoration — it is the only place a sighted
              // reader can recover them without expanding.
              //
              // `tooltip` carries both, and the description is omitted rather
              // than rendered empty when the host did not supply one: a panel
              // containing a name the button already announces is worse than no
              // panel, because it teaches the reader that pressing help wastes
              // their time.
              <StyledTooltip
                tooltip={
                  item.description ? (
                    <>
                      <StyledText fontWeight="bold">{item.label}</StyledText>
                      <StyledText size="sm">{item.description}</StyledText>
                    </>
                  ) : (
                    <StyledText fontWeight="bold">{item.label}</StyledText>
                  )
                }
                trigger={collapsedTooltipTrigger}
                helpLabel={`What does ${item.label} do?`}
                // `sidebar-tooltip-`, NOT `sidebar-item-tooltip-`: the latter
                // prefix-matches the `/^sidebar-item-/` selector the component
                // tests already use to enumerate rows, silently doubling the
                // count. A testid that shadows another is a trap for whoever
                // writes the next query.
                data-testid={`sidebar-tooltip-${item.id}`}
              >
                {button}
              </StyledTooltip>
            ) : (
              button
            )}

            {item.help && (
              // trigger="click" — a drifting pointer must not spawn this, nor
              // dismiss one being read. Unconditionally click even when the
              // name/description tooltip above is on hover: this one is the
              // longer explanation, and it is the one a reader dwells on.
              <HelpSlot>
                <StyledTooltip tooltip={item.help} trigger="click" helpLabel={`What does ${item.label} do?`}>
                  <span />
                </StyledTooltip>
              </HelpSlot>
            )}
          </StyledHStack>
        );
      })}
    </StyledVStack>
  );

  return (
    // `role="navigation"` rather than `as="nav"`: StyledBox accepts an `as`
    // prop, but it does not survive Panda's styled factory here, so `as="nav"`
    // rendered a plain div and the landmark silently never existed — an
    // aria-label on an unroled div names nothing. Caught by a rendering test
    // in the consuming app, which is exactly the kind of gap a behaviour test
    // sails past.
    <StyledBox
      role="navigation"
      aria-label={ariaLabel}
      data-testid="styled-sidebar"
      borderRightWidth="1px"
      borderColor="borderBgPrimary"
      p={2}
      // `height: 100%` + `minHeight: 0` is what makes scroll mode work at all.
      // StyledScrollbar is `flex: 1; min-height: 0; overflow: auto`, which can
      // only produce a scrollbar inside a column whose height is constrained.
      // Against an auto-height parent `height: 100%` computes to auto, so this
      // costs a host that does not constrain the sidebar nothing.
      height="100%"
      minHeight="0"
      noWrap
    >
      <StyledVStack gap={2} alignItems="stretch" height="100%" minHeight="0">
        <StyledHStack justifyContent="space-between" alignItems="center">
          {heading && <StyledText fontWeight="bold">{heading}</StyledText>}
          {/* Gating on `onCollapsedChange` alone would leave a host that only
              set `defaultCollapsed` with a permanently collapsed rail and no way
              out of it — see `canCollapse` for why it is not simply
              "uncontrolled". */}
          {canCollapse && (
            <CollapseButton
              type="button"
              onClick={toggleCollapsed}
              aria-expanded={!isCollapsed}
              // The name says what pressing it will do, not what state it is in.
              // Under the icon-only opt-in it will reveal the names themselves,
              // not merely the descriptions, so it says so — a reader who cannot
              // identify the glyphs is precisely the one reaching for this.
              aria-label={
                iconOnlyWhenCollapsed
                  ? isCollapsed
                    ? "Show tool names"
                    : "Hide tool names"
                  : isCollapsed
                    ? "Show tool descriptions"
                    : "Hide tool descriptions"
              }
              data-testid="sidebar-collapse"
            >
              {isCollapsed ? "»" : "«"}
            </CollapseButton>
          )}
        </StyledHStack>

        {items.length === 0 ? (
          // A live region: someone filtering with a screen reader has to learn
          // that nothing matched (PRD §F22).
          <StyledBox role="status" data-testid="sidebar-empty">
            {emptyState}
          </StyledBox>
        ) : paging ? (
          <>
            {list}
            {pageCount > 1 && (
              <StyledHStack gap={2} alignItems="center" justifyContent="space-between">
                <PagerButton
                  type="button"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={safePage === 0}
                  aria-label="Previous page of tools"
                  data-testid="sidebar-prev"
                >
                  ‹
                </PagerButton>
                {/* Position is stated, not implied by a row of dots. */}
                <StyledText size="sm" data-testid="sidebar-page-status">
                  Page {safePage + 1} of {pageCount}
                </StyledText>
                <PagerButton
                  type="button"
                  onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                  disabled={safePage >= pageCount - 1}
                  aria-label="Next page of tools"
                  data-testid="sidebar-next"
                >
                  ›
                </PagerButton>
              </StyledHStack>
            )}
          </>
        ) : (
          <StyledScrollbar data-testid="sidebar-scroll">{list}</StyledScrollbar>
        )}
      </StyledVStack>
    </StyledBox>
  );
};

export default StyledSidebar;
export { StyledSidebar };
