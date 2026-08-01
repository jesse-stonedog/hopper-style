# PRD-0001 — StyledSidebar

**Status:** Shipped (component) · **Owner:** eng · **Component:** `StyledSidebar`
**Risk:** Medium — this becomes the primary navigation for applications whose users are often elderly and sometimes cognitively impaired. The failure mode is not a crash; it is a person who cannot find the thing they were looking for and stops trying.

> This repository is public and Apache-2.0. This document specifies a **library
> component**, so it describes requirements in terms of any host application.
> Where a consuming product's behaviour is relevant it is named as "the host",
> not detailed here.

## Problem

Applications built on this library present a set of tools, and the obvious ways to lay them out both fail as that set grows:

- **A horizontal bar of icons.** Cheap to build, and it degrades badly past roughly six items — it demands scanning, precise targeting, and prior knowledge of what each glyph means. One reference consumer has **24 tools for a single role**, which no header strip can hold.
- **A generic nav library.** These assume a confident user: hover to reveal, dense rows, icon-only rails, drag to reorder. Every one of those assumptions is wrong for this audience.

There is no component here for navigating a tool set at all, and each host inventing its own means each host re-derives — usually re-fails — the same accessibility decisions.

## Goals

- One navigation component that is **legible without prior knowledge**: an icon paired with the tool's name, and help available on demand.
- **Predictable**: nothing moves, opens, or closes except when the user asks.
- **Usable with a wandering pointer, a keyboard, a screen reader, or a finger.**
- **Policy-free**: the host decides what the tools are, what order they are in, and which are visible. The component decides how they look and how they are operated.
- Scales from 3 tools to ~30 without a redesign.

## Non-goals

- **Sorting.** The component never reorders `items`.
- **Filtering, and any search field.** See "Why search lives outside" — this is the decision most likely to be second-guessed, so it is argued rather than asserted.
- **Icons.** This package deliberately ships none; icons arrive as props.
- **Routing.** `onSelect` reports a choice; navigation is the host's.
- **Persistence.** The component holds no preferences.

## Users

- **The primary reader** — often older, possibly with low vision, tremor, arthritis, or mild cognitive impairment. Navigates by position and by recognising words, not by decoding icons.
- **A helper or family member** using the same screen occasionally, at speed.
- **Staff** in a professional context, high-frequency, keyboard-heavy.

All three get the same component. Nothing here should be optimised for the third at the first's expense.

## Requirements

### A. Item presentation

1. Every item renders an **icon and the tool's name**. There is no icon-only rendering — including when collapsed (§E).
2. An item may carry a **short description**, rendered beneath the name.
3. Name and description are **never truncated to the point of ambiguity** at large text sizes or zoom; they wrap.
4. Item hit areas are at least **48×48 CSS px**; 60×60 is preferred and should be the default where layout allows.

### B. Help on demand

5. An item may carry **help text**. When present, the item shows a **help control** which, **on click or Enter/Space, opens** an explanation of what the tool does.
6. Help **must not open on hover**. A pointer that drifts across a row must not spawn a panel, and a pointer that drifts off must not dismiss one the reader is still reading.
7. Help is **dismissible** by an explicit action and by Escape, and returns focus to the control that opened it.
8. The help control is a real, focusable, named control in tab order — not a bare icon with a title attribute.

> **Implementation note — done.** `StyledTooltip` now takes
> `trigger?: "hover" | "click"` (defaulting to `"hover"`, so existing callers
> are unaffected). In click mode it renders a **separate help control** beside
> the child, because the child is usually a button and that click belongs to
> the button — the reader must be able to see both that help exists and where
> to press for it. Escape closes it and returns focus; a press outside closes
> it; a press inside does not. Hosts generally wire `trigger` to a user
> preference rather than setting it per call site.

### C. Selection

9. Exactly one item may be **selected**, and it is **unmistakable** — a strong border or a distinct background, not a subtle tint.
10. Selection is **never conveyed by colour alone** (WCAG 1.4.1).
11. The selected item is exposed to assistive technology as the current item (`aria-current`).
12. **Selection survives a change to `items`.** If the host narrows the list and the selected tool is no longer present, it stays selected — the user is searching, not navigating away.

### D. Overflow: scrolling or paging

13. The host chooses `overflow: "scroll" | "paging"`. Both are first-class; neither is a fallback.
14. **Scrolling** uses the library's scroll container so the scrollbar is visible and sized for a large pointer.
15. **Paging** shows previous/next controls with the current position ("Page 2 of 4"), each meeting the target-size floor and reachable by keyboard.
16. **When `items` changes, paging resets to the first page.** Otherwise a narrowed list strands the reader on an empty page 3 — the single most likely bug in this component.
17. Neither mode may hide the fact that more tools exist. A silent cut-off is worse than a scrollbar.

### E. Collapsing

18. The sidebar may be **collapsed** and expanded, controlled by the host (`collapsed` + `onCollapsedChange`).
19. Collapse/expand is an **explicit control** — never hover-triggered.
20. **Collapsed still shows each tool's name**, at reduced prominence: icon plus name, with descriptions suppressed. It does **not** become an icon-only rail. An icon-only rail is the conventional answer and it is rejected here: it re-introduces exactly the "guess what the glyph means" problem that Requirement 1 exists to remove.
21. The collapsed/expanded state is announced, and the control's accessible name reflects what it will do next.

### F. Empty and edge states

22. When `items` is empty the component renders an **`emptyState`** supplied by the host, inside a live region so a screen-reader user learns that a filter matched nothing.
23. A single item is a valid list; so is one that exactly fills a page.

### G. Interaction floors (all of the above)

24. Every control is reachable and operable by **keyboard alone**, with a visible focus indicator.
25. **Nothing anywhere in this component changes state on hover.** Hover may change appearance; it may not open, close, select, or reorder.
26. No functionality requires a **drag** (WCAG 2.2 SC 2.5.7). The component has no drag interaction at all; a host that builds reordering must provide a non-drag path.

## Why search lives outside the component

The obvious design is a search box inside the sidebar. It is rejected.

**1. Filtering is policy.** Does a query match the name only, or the description and help text too? Case- and accent-insensitivity? Fuzzy matching? These are product decisions with different right answers per host. Baking one set into a shared library forces every future consumer to inherit it.

**2. It would break dictation.** In the reference consumer, speech-to-text is wired into the application's own text input — engine selection, feature flag, and the dictation hook all live in application code. This package cannot import that, and must not grow a dependency on any host. A search field built *here* would therefore be a second input that **cannot** dictate, in an application where every other search can. The requirement "the search should support speech-to-text like other searches" is satisfied precisely by **not** building the search here.

**3. It keeps the component honest.** `items` in, selection out. No hidden state, and tests that cannot drift from behaviour.

**The contract:** the host renders its own search wherever it likes — above the list, below it, elsewhere on the page — holds the query, filters, and passes the result as `items`. The component re-renders and never learns a search exists. Requirements 12, 16 and 22 exist to make that seamless.

## Prop API

```ts
export interface SidebarItem {
  id: string;
  icon: React.ReactNode;      // supplied by the host; this package ships none
  label: string;              // the tool's name — always rendered
  description?: string;       // short, rendered beneath the label
  help?: React.ReactNode;     // revealed on click (§B)
}

export interface StyledSidebarProps {
  items: SidebarItem[];       // already ordered and already filtered
  selectedId?: string;
  onSelect: (id: string) => void;

  overflow?: "scroll" | "paging";   // default "scroll"
  itemsPerPage?: number;            // paging only

  collapsed?: boolean;
  onCollapsedChange?: (next: boolean) => void;

  emptyState?: React.ReactNode;
  heading?: React.ReactNode;        // e.g. "TOOLS"
  "aria-label"?: string;            // names the navigation landmark
}
```

`items` being **pre-ordered and pre-filtered** is the load-bearing part of this API: it is what makes ordering a host preference, search a host concern, and this component deterministic.

## Accessibility

Binding, not aspirational:

- **Icon + text always** (§A1) — an icon alone assumes knowledge the reader may not have.
- **Target size ≥ 48×48**, 60×60 preferred. Above the WCAG 2.5.5 floor of 44 on purpose.
- **No hover-triggered state** (§G25) — pointer drift must not change what is on screen.
- **Unmistakable selection**, never colour alone (§C9–11).
- **No dragging** (§G26, SC 2.5.7).
- Renders as a **navigation landmark** with an accessible name; the item list is a list; the selected item carries `aria-current`.
- Full keyboard operation with visible focus (§G24).
- Text wraps rather than truncating at large zoom (§A3).

## Rollout

1. ~~Extend `StyledTooltip` with a click trigger~~ — **done**: `trigger="click"` with its own help control.
2. ~~Build `StyledSidebar` against this API, with tests~~ — **done**.
3. The reference consumer adopts it behind its existing navigation, then switches over.

Nothing here is breaking: this is a new component.

## Success criteria

- A reader who has never seen the app can name what each tool does, from the sidebar alone plus its help.
- No control changes state on hover; nothing requires a drag; everything is keyboard-reachable.
- A list of 3 and a list of 30 are both comfortable, in both overflow modes.
- Narrowing `items` to zero produces a clear, announced empty state — never a blank panel.
- The component's tests never need a search box or a sort function.

## Open questions

1. **`itemsPerPage`: host-set or measured?** A fixed count is predictable but wrong at large zoom, where fewer items fit. Measuring adapts but makes "Page 2 of 4" unstable. Leaning host-set with a sensible default.
2. **Does the collapsed state belong here at all**, or should a host that wants more room simply not render the sidebar? §E is specified, but a component that is *sometimes* narrow may be worse than two clear layouts.
3. **Should `help` be required rather than optional?** If a tool needs explaining and none is supplied, the reader is back to guessing. Making it required would force hosts to write it.
4. **Grouping.** At ~30 tools, a flat list may be the real limit. Deferred; the API can gain grouped items without breaking §A.
