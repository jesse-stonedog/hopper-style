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

describe("StyledSidebar — keyboard reach", () => {
  /**
   * The *pixel* half of §G24 — a visible focus ring, a working Enter — is in
   * StyledSidebar.ct.tsx, because jsdom neither lays out nor translates a
   * keypress on a native button into a click. What jsdom CAN answer is the
   * structural half, and it is the half that silently regresses: a control
   * built from a div, or one taken out of the tab order.
   */
  it("builds every control from a real button, none of them removed from the tab order", () => {
    renderSidebar({ overflow: "paging", itemsPerPage: 2, onCollapsedChange: jest.fn() });

    const controls = [
      screen.getByTestId("sidebar-item-calendar"),
      screen.getByRole("button", { name: "What does Calendar do?" }),
      screen.getByTestId("sidebar-prev"),
      screen.getByTestId("sidebar-next"),
      screen.getByTestId("sidebar-collapse"),
    ];

    for (const control of controls) {
      expect(control.tagName).toBe("BUTTON");
      // `type="button"` matters wherever a host drops this inside a form: the
      // default is `submit`, and choosing a tool would post the page.
      expect(control).toHaveAttribute("type", "button");
      expect(control).not.toHaveAttribute("tabindex", "-1");
    }
  });

  it("gives the help control one accessible name, not two", () => {
    // StyledTooltip used to name its wrapper as well as its trigger, so the
    // same control was announced twice with different words (NEH-151). In click
    // mode the wrapper must stay anonymous.
    renderSidebar();
    const help = screen.getByRole("button", { name: "What does Calendar do?" });
    expect(screen.getAllByRole("button", { name: "What does Calendar do?" })).toHaveLength(1);
    expect(help.parentElement).not.toHaveAttribute("aria-label");
    expect(help.parentElement).not.toHaveAttribute("role");
  });
});

describe("StyledSidebar — scroll mode", () => {
  it("puts the list in the library's scroll container, and only in scroll mode", () => {
    // §D14. The old suite could only see that no pager rendered, which is
    // equally true of a rail that silently cuts the remaining tools off.
    const { rerender } = renderSidebar();
    expect(screen.getByTestId("sidebar-scroll")).toContainElement(
      screen.getByTestId("sidebar-items"),
    );

    rerender(<StyledSidebar items={TOOLS} onSelect={jest.fn()} overflow="paging" />);
    expect(screen.queryByTestId("sidebar-scroll")).not.toBeInTheDocument();
  });
});

describe("StyledSidebar — token compliance", () => {
  /**
   * The package's oldest defect class, and this component carried two of them:
   * an inline `style={{ background: "var(--colors-box-bg-accent)" }}` for the
   * selected row, and `color="fg.muted"` on the description — a token from a
   * namespace nothing here defines, which Panda passed through as the literal
   * `color: fg.muted` and the browser discarded. Neither produced a build
   * error, a console warning, or a failing test; the muted description simply
   * never rendered muted.
   *
   * Both now go through the token layer, which is the only thing that
   * re-points under a consumer's `cssVarPrefix` — and, just as usefully, the
   * only thing a stylesheet grep can see.
   */
  it("paints the selected row from tokens rather than an inline custom property", () => {
    renderSidebar({ selectedId: "tasks" });
    const selected = screen.getByTestId("sidebar-item-tasks");

    expect(selected.getAttribute("style") ?? "").not.toContain("var(--");
    expect(selected.className).toContain("bd-c_borderBgAccent");
    expect(selected.className).toContain("bg_boxBgAccent");
  });

  it("distinguishes the selected row by weight as well as colour", () => {
    // WCAG 1.4.1 — the border and background are a colour signal, so the
    // label's weight has to carry it too, or greyscale loses the selection.
    renderSidebar({ selectedId: "tasks" });
    const selectedLabel = screen.getByText("Tasks");
    const plainLabel = screen.getByText("Notes");
    expect(selectedLabel.className).not.toBe(plainLabel.className);
    expect(selectedLabel.className).toContain("fw_bold");
  });

  it("names a description colour the token contract actually defines", () => {
    renderSidebar();
    const description = screen.getByText("Events & appointments");
    expect(description.className).toContain("c_textSecondary");
    expect(description.className).not.toContain("fg.muted");
  });
});
