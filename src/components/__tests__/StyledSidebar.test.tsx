import { render, screen, fireEvent } from "@testing-library/react";
import StyledSidebar, { type SidebarItem } from "../StyledSidebar";

/**
 * StyledSidebar, against PRD-0001.
 *
 * The tests worth having here are the ones that pin *decisions*, not markup:
 * that the component never reorders or filters, that selection survives a
 * filter, that paging resets when the item set changes, and that nothing
 * responds to hover. Each of those is a behaviour someone could plausibly
 * "improve" into a bug.
 */
const TOOLS: SidebarItem[] = [
  { id: "calendar", label: "Calendar", description: "Events & appointments", help: "Shows what is coming up." },
  { id: "notes", label: "Notes", description: "Reminders & messages" },
  { id: "tasks", label: "Tasks", description: "Daily to-do items" },
  { id: "sites", label: "Sites", description: "Saved links & pages" },
];

function renderSidebar(props: Partial<React.ComponentProps<typeof StyledSidebar>> = {}) {
  const onSelect = jest.fn();
  const utils = render(
    <StyledSidebar items={TOOLS} onSelect={onSelect} heading="TOOLS" {...props} />,
  );
  return { onSelect, ...utils };
}

describe("StyledSidebar — landmark", () => {
  it("renders a named navigation landmark", () => {
    // Regression: this was `as="nav"` on StyledBox, which does not reach the
    // DOM through Panda's factory — so the sidebar rendered a plain div with
    // an aria-label naming nothing, and screen-reader users had no landmark to
    // jump to. Every behaviour test still passed.
    render(<StyledSidebar items={TOOLS} onSelect={jest.fn()} aria-label="Care Tools" />);
    expect(screen.getByRole("navigation", { name: "Care Tools" })).toBeInTheDocument();
  });

  it("defaults the landmark name when the host gives none", () => {
    render(<StyledSidebar items={TOOLS} onSelect={jest.fn()} />);
    expect(screen.getByRole("navigation", { name: "Tools" })).toBeInTheDocument();
  });
});

describe("StyledSidebar — items", () => {
  it("renders every tool with its name, not an icon alone", () => {
    renderSidebar();
    for (const tool of TOOLS) {
      expect(screen.getByText(tool.label)).toBeInTheDocument();
    }
  });

  it("shows descriptions, and drops them when collapsed — but never the names", () => {
    const { rerender } = renderSidebar();
    expect(screen.getByText("Events & appointments")).toBeInTheDocument();

    rerender(<StyledSidebar items={TOOLS} onSelect={jest.fn()} collapsed />);

    expect(screen.queryByText("Events & appointments")).not.toBeInTheDocument();
    // The name survives collapsing. An icon-only rail is exactly what this
    // component refuses to become.
    expect(screen.getByText("Calendar")).toBeInTheDocument();
  });

  it("reports the chosen tool", () => {
    const { onSelect } = renderSidebar();
    fireEvent.click(screen.getByTestId("sidebar-item-notes"));
    expect(onSelect).toHaveBeenCalledWith("notes");
  });

  it("renders items in the order given — it never sorts", () => {
    const reversed = [...TOOLS].reverse();
    render(<StyledSidebar items={reversed} onSelect={jest.fn()} />);
    const rendered = screen.getAllByRole("listitem").map((li) => li.textContent);
    expect(rendered[0]).toContain("Sites");
    expect(rendered[3]).toContain("Calendar");
  });
});

describe("StyledSidebar — selection", () => {
  it("marks the selected tool for assistive technology", () => {
    renderSidebar({ selectedId: "tasks" });
    expect(screen.getByTestId("sidebar-item-tasks")).toHaveAttribute("aria-current", "true");
    expect(screen.getByTestId("sidebar-item-notes")).not.toHaveAttribute("aria-current");
  });

  it("keeps the selection when the host filters that tool out", () => {
    const { rerender } = renderSidebar({ selectedId: "tasks" });
    // The host narrowed `items` — the reader is searching, not navigating away.
    rerender(
      <StyledSidebar items={[TOOLS[0]!]} selectedId="tasks" onSelect={jest.fn()} />,
    );
    expect(screen.getByTestId("sidebar-item-calendar")).toBeInTheDocument();
    expect(screen.queryByTestId("sidebar-item-tasks")).not.toBeInTheDocument();
  });
});

describe("StyledSidebar — help", () => {
  it("offers help only for tools that have it", () => {
    renderSidebar();
    expect(screen.getByRole("button", { name: "What does Calendar do?" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "What does Notes do?" })).not.toBeInTheDocument();
  });

  it("opens on click and not on hover", () => {
    renderSidebar();
    const help = screen.getByRole("button", { name: "What does Calendar do?" });

    fireEvent.mouseEnter(help);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

    fireEvent.click(help);
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });
});

describe("StyledSidebar — overflow", () => {
  it("scrolls by default, with no pager", () => {
    renderSidebar();
    expect(screen.queryByTestId("sidebar-next")).not.toBeInTheDocument();
  });

  it("pages when asked, stating the position in words", () => {
    renderSidebar({ overflow: "paging", itemsPerPage: 2 });

    expect(screen.getByTestId("sidebar-page-status")).toHaveTextContent("Page 1 of 2");
    expect(screen.getByText("Calendar")).toBeInTheDocument();
    expect(screen.queryByText("Tasks")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("sidebar-next"));

    expect(screen.getByTestId("sidebar-page-status")).toHaveTextContent("Page 2 of 2");
    expect(screen.getByText("Tasks")).toBeInTheDocument();
  });

  it("disables the pager at each end rather than wrapping", () => {
    renderSidebar({ overflow: "paging", itemsPerPage: 2 });
    expect(screen.getByTestId("sidebar-prev")).toBeDisabled();
    fireEvent.click(screen.getByTestId("sidebar-next"));
    expect(screen.getByTestId("sidebar-next")).toBeDisabled();
  });

  it("resets to page 1 when the item set changes", () => {
    const { rerender } = renderSidebar({ overflow: "paging", itemsPerPage: 2 });
    fireEvent.click(screen.getByTestId("sidebar-next"));
    expect(screen.getByTestId("sidebar-page-status")).toHaveTextContent("Page 2 of 2");

    // A search narrowed the list. Without the reset the reader is stranded on
    // a page that no longer exists.
    rerender(
      <StyledSidebar items={[TOOLS[0]!]} onSelect={jest.fn()} overflow="paging" itemsPerPage={2} />,
    );

    expect(screen.getByText("Calendar")).toBeInTheDocument();
    expect(screen.queryByTestId("sidebar-page-status")).not.toBeInTheDocument();
  });
});

describe("StyledSidebar — empty and collapsing", () => {
  it("announces an empty result instead of showing a blank panel", () => {
    render(
      <StyledSidebar items={[]} onSelect={jest.fn()} emptyState="No tools match that search." />,
    );
    const empty = screen.getByTestId("sidebar-empty");
    expect(empty).toHaveTextContent("No tools match that search.");
    // role="status" so a screen reader learns the search found nothing.
    expect(empty).toHaveAttribute("role", "status");
  });

  it("collapses by explicit press, with a name that says what happens next", () => {
    const onCollapsedChange = jest.fn();
    renderSidebar({ onCollapsedChange });

    const toggle = screen.getByRole("button", { name: "Hide tool descriptions" });
    expect(toggle).toHaveAttribute("aria-expanded", "true");

    fireEvent.mouseEnter(toggle);
    expect(onCollapsedChange).not.toHaveBeenCalled(); // never on hover

    fireEvent.click(toggle);
    expect(onCollapsedChange).toHaveBeenCalledWith(true);
  });

  it("omits the collapse control when the host does not handle it", () => {
    renderSidebar();
    expect(screen.queryByTestId("sidebar-collapse")).not.toBeInTheDocument();
  });
});
