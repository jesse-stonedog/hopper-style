import { render, screen, fireEvent } from "@testing-library/react";
import StyledCollapsible from "../StyledCollapsible";

/**
 * StyledCollapsible.
 *
 * The assertions worth having are about the two decisions that are easy to
 * "improve" into bugs: that collapsed content stays mounted, and that the
 * trigger's state lives in `aria-expanded` rather than in its name.
 */
function renderCollapsible(
  props: Partial<React.ComponentProps<typeof StyledCollapsible>> = {},
) {
  return render(
    <StyledCollapsible trigger="Details" aria-label="Details" {...props}>
      <input data-testid="inner" defaultValue="" />
    </StyledCollapsible>,
  );
}

describe("StyledCollapsible — disclosure semantics", () => {
  it("starts closed and opens on press", () => {
    renderCollapsible();
    const trigger = screen.getByRole("button", { name: "Details" });

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("points aria-controls at the region it actually toggles", () => {
    renderCollapsible({ contentTestId: "content" });
    const trigger = screen.getByRole("button", { name: "Details" });
    // A dangling aria-controls is worse than none: it promises assistive
    // technology a relationship that does not resolve.
    expect(screen.getByTestId("content")).toHaveAttribute(
      "id",
      trigger.getAttribute("aria-controls"),
    );
  });

  it("hides collapsed content without unmounting it", () => {
    renderCollapsible({ contentTestId: "content" });

    // Still in the document — `hidden`, not gone. Unmounting would discard
    // focus, scroll position and any part-typed input, so a mis-press would
    // destroy work rather than merely hide it.
    const content = screen.getByTestId("content");
    expect(content).toBeInTheDocument();
    expect(content).toHaveAttribute("hidden");

    fireEvent.click(screen.getByRole("button", { name: "Details" }));
    expect(screen.getByTestId("content")).not.toHaveAttribute("hidden");
  });

  it("keeps what the reader typed across a collapse", () => {
    // The concrete reason for the rule above, asserted rather than trusted.
    renderCollapsible({ defaultOpen: true });
    const input = screen.getByTestId("inner") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "half a sentence" } });

    fireEvent.click(screen.getByRole("button", { name: "Details" }));
    fireEvent.click(screen.getByRole("button", { name: "Details" }));

    expect((screen.getByTestId("inner") as HTMLInputElement).value).toBe("half a sentence");
  });

  it("keeps state out of the accessible name", () => {
    // A name like "Collapse details" is announced as "Collapse details,
    // expanded" — the same fact twice, in opposite tenses. The name says what
    // the control is for; aria-expanded says what it is.
    renderCollapsible();
    const trigger = screen.getByRole("button", { name: "Details" });
    fireEvent.click(trigger);
    expect(trigger).toHaveAccessibleName("Details");
  });
});

describe("StyledCollapsible — controlled vs uncontrolled", () => {
  it("honours defaultOpen when uncontrolled", () => {
    renderCollapsible({ defaultOpen: true, contentTestId: "content" });
    expect(screen.getByTestId("content")).not.toHaveAttribute("hidden");
  });

  it("lets a controlled host win over defaultOpen", () => {
    renderCollapsible({ open: false, defaultOpen: true, contentTestId: "content" });
    expect(screen.getByTestId("content")).toHaveAttribute("hidden");
  });

  it("reports the press without moving on its own when controlled", () => {
    const onOpenChange = jest.fn();
    renderCollapsible({ open: false, onOpenChange, contentTestId: "content" });

    fireEvent.click(screen.getByRole("button", { name: "Details" }));

    expect(onOpenChange).toHaveBeenCalledWith(true);
    // The host owns the value and has not changed it, so nothing moved.
    expect(screen.getByTestId("content")).toHaveAttribute("hidden");
  });

  it("still reports the press when uncontrolled", () => {
    const onOpenChange = jest.fn();
    renderCollapsible({ onOpenChange });
    fireEvent.click(screen.getByRole("button", { name: "Details" }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });
});
