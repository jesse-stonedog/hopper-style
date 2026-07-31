import { render, screen, fireEvent, act } from "@testing-library/react";
import StyledTooltip from "../StyledTooltip";

/**
 * The tooltip opens after a delay, so every assertion has to push timers.
 * Kept as a helper rather than repeated so a change to the default delay does
 * not mean editing eight tests.
 */
function openBy(trigger: (el: HTMLElement) => void, el: HTMLElement) {
  trigger(el);
  act(() => {
    jest.advanceTimersByTime(200);
  });
}

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

describe("StyledTooltip", () => {
  it("renders children alone and adds nothing when there is no tooltip text", () => {
    render(
      <StyledTooltip tooltip={null}>
        <button>bare</button>
      </StyledTooltip>,
    );
    expect(screen.getByRole("button", { name: "bare" })).toBeInTheDocument();
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("stays closed until the delay elapses", () => {
    render(
      <StyledTooltip tooltip="Save your work">
        <button>Save</button>
      </StyledTooltip>,
    );
    fireEvent.mouseEnter(screen.getByRole("button").parentElement!);
    // Before the delay: nothing. A tooltip that fires instantly flickers on
    // every pointer transit across a toolbar.
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("opens on hover", () => {
    render(
      <StyledTooltip tooltip="Save your work">
        <button>Save</button>
      </StyledTooltip>,
    );
    openBy(fireEvent.mouseEnter, screen.getByRole("button").parentElement!);
    expect(screen.getByRole("tooltip")).toHaveTextContent("Save your work");
  });

  it("opens on keyboard focus, not only on hover", () => {
    // WCAG 2.2: content revealed on hover must also be reachable by keyboard.
    render(
      <StyledTooltip tooltip="Save your work">
        <button>Save</button>
      </StyledTooltip>,
    );
    openBy(fireEvent.focus, screen.getByRole("button").parentElement!);
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });

  it("closes again on blur", () => {
    render(
      <StyledTooltip tooltip="Save your work">
        <button>Save</button>
      </StyledTooltip>,
    );
    const trigger = screen.getByRole("button").parentElement!;
    openBy(fireEvent.focus, trigger);
    fireEvent.blur(trigger);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("describes the focusable child rather than the wrapper", () => {
    // aria-describedby has to sit on whatever actually receives focus, or a
    // screen reader announces the control with no description at all.
    render(
      <StyledTooltip tooltip="Save your work">
        <button>Save</button>
      </StyledTooltip>,
    );
    const button = screen.getByRole("button");
    openBy(fireEvent.focus, button.parentElement!);
    const tooltip = screen.getByRole("tooltip");
    expect(button).toHaveAttribute("aria-describedby", tooltip.id);
  });

  it("does not give a focusable child a second tab stop", () => {
    // The child already owns the tab stop; adding one to the wrapper is what
    // produced two tab stops per control, the second of them silent.
    render(
      <StyledTooltip tooltip="Save your work">
        <button>Save</button>
      </StyledTooltip>,
    );
    expect(screen.getByRole("button").parentElement).not.toHaveAttribute("tabindex");
  });

  it("gives a NON-focusable child a tab stop, with a role and a name", () => {
    // A focusable element needs both a role and an accessible name (WCAG 4.1.2).
    render(
      <StyledTooltip tooltip="Explanation">
        <span />
      </StyledTooltip>,
    );
    const trigger = screen.getByRole("button");
    expect(trigger).toHaveAttribute("tabindex", "0");
    expect(trigger).toHaveAccessibleName("Explanation");
  });

  it("does not invent a name when an ancestor already provides one", () => {
    // Naming unconditionally is what produced two elements claiming the same
    // label, with role="button" nested inside an already-named ancestor.
    render(
      <div aria-label="Shared with three people">
        <StyledTooltip tooltip="Explanation">
          <span />
        </StyledTooltip>
      </div>,
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("does not use a non-string tooltip as an accessible name", () => {
    // Stringifying a React element would announce "[object Object]".
    render(
      <StyledTooltip tooltip={<em>rich</em>}>
        <span />
      </StyledTooltip>,
    );
    const trigger = screen.getByText("", { selector: "[tabindex='0']" });
    expect(trigger).not.toHaveAttribute("aria-label");
  });
});
