import React from "react";
import StyledSidebar, { type SidebarItem } from "./StyledSidebar";

/**
 * Mount targets for `StyledSidebar.ct.tsx`.
 *
 * Playwright CT mounts by importing the module a component is declared in, so
 * anything defined inside the spec file fails with "Component X cannot be
 * mounted". Every one of these also needs real state (selection, collapse) or a
 * real height constraint, neither of which survives serialisation as a prop.
 */

const icon = (
  <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="10" fill="currentColor" />
  </svg>
);

const TOOLS: SidebarItem[] = [
  {
    id: "calendar",
    icon,
    label: "Calendar",
    description: "Events & appointments",
    help: "Shows what is coming up this week.",
  },
  { id: "notes", icon, label: "Notes", description: "Reminders & messages" },
  { id: "tasks", icon, label: "Tasks", description: "Daily to-do items" },
  { id: "sites", icon, label: "Sites", description: "Saved links & pages" },
];

/** Thirty tools, to exercise both overflow modes at their real size. */
const MANY: SidebarItem[] = Array.from({ length: 30 }, (_, i) => ({
  id: `tool-${i}`,
  icon,
  label: `Tool number ${i + 1}`,
  description: "What this tool is for",
}));

/** A sidebar in a narrow rail, which is how a host actually places one. */
function Rail({ children, height }: { children: React.ReactNode; height?: string }) {
  return (
    <div
      data-testid="rail"
      style={{ width: "260px", display: "flex", flexDirection: "column", ...(height ? { height } : {}) }}
    >
      {children}
    </div>
  );
}

/** Four tools, selection held here so a keypress can be seen to move it. */
export function SidebarBasic() {
  const [selectedId, setSelectedId] = React.useState("calendar");
  return (
    <Rail>
      <StyledSidebar items={TOOLS} selectedId={selectedId} onSelect={setSelectedId} heading="TOOLS" />
    </Rail>
  );
}

/**
 * Thirty tools in a rail the host has constrained to 400px.
 *
 * This is the only arrangement in which scroll mode can produce a scrollbar at
 * all — `StyledScrollbar` is `flex: 1; min-height: 0; overflow: auto`, which
 * needs a column of known height above it. An unconstrained host gets a rail
 * that simply grows, which is correct and is not what this fixture is for.
 */
export function SidebarScrolling() {
  const [selectedId, setSelectedId] = React.useState("tool-0");
  return (
    <Rail height="400px">
      <StyledSidebar items={MANY} selectedId={selectedId} onSelect={setSelectedId} heading="TOOLS" />
    </Rail>
  );
}

/** Paging, with a collapse control, so both rail controls are on screen. */
export function SidebarPaging() {
  const [selectedId, setSelectedId] = React.useState("tool-0");
  const [collapsed, setCollapsed] = React.useState(false);
  return (
    <Rail>
      <StyledSidebar
        items={MANY}
        selectedId={selectedId}
        onSelect={setSelectedId}
        overflow="paging"
        itemsPerPage={4}
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        heading="TOOLS"
      />
    </Rail>
  );
}

/** Names longer than the rail, and one unbroken word longer still (PRD §A3). */
export function SidebarLongLabels() {
  return (
    <Rail>
      <StyledSidebar
        items={[
          {
            id: "long",
            icon,
            label: "Medication reminders and refill scheduling",
            description: "Everything about the medicines taken this month",
            help: "Explains the medication schedule.",
          },
          { id: "unbroken", icon, label: "Elektroenzephalographiegeraetehersteller" },
        ]}
        selectedId="long"
        onSelect={() => {}}
        heading="TOOLS"
      />
    </Rail>
  );
}
