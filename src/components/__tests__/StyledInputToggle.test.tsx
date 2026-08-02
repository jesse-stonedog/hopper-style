import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import StyledInputToggle from "../StyledInputToggle";

describe("StyledInputToggle", () => {
  it("is a switch", () => {
    render(<StyledInputToggle value={false} onChange={() => {}} label="Notifications" />);
    expect(screen.getByRole("switch", { name: "Notifications" })).toBeInTheDocument();
  });

  it("is a real button, not a div wearing a role", () => {
    // The platform then owns focus, activation and disabled semantics — and
    // gets right the cases hand-rolled key handling misses, like activating on
    // key-up rather than key-down.
    render(<StyledInputToggle value={false} onChange={() => {}} label="X" />);
    expect(screen.getByRole("switch").tagName).toBe("BUTTON");
  });

  it("is type=button, so it never submits a surrounding form", () => {
    render(<StyledInputToggle value={false} onChange={() => {}} label="X" />);
    expect(screen.getByRole("switch")).toHaveAttribute("type", "button");
  });

  it("reports its state", () => {
    const { rerender } = render(
      <StyledInputToggle value={false} onChange={() => {}} label="X" />,
    );
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");
    rerender(<StyledInputToggle value onChange={() => {}} label="X" />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  });

  it("toggles on click", () => {
    const onChange = jest.fn();
    render(<StyledInputToggle value={false} onChange={onChange} label="X" />);
    fireEvent.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("toggles back", () => {
    const onChange = jest.fn();
    render(<StyledInputToggle value onChange={onChange} label="X" />);
    fireEvent.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  describe("disabled", () => {
    it("is disabled natively, not by an aria attribute alone", () => {
      render(<StyledInputToggle value={false} onChange={() => {}} label="X" disabled />);
      expect(screen.getByRole("switch")).toBeDisabled();
    });

    it("does not fire", () => {
      const onChange = jest.fn();
      render(<StyledInputToggle value={false} onChange={onChange} label="X" disabled />);
      fireEvent.click(screen.getByRole("switch"));
      expect(onChange).not.toHaveBeenCalled();
    });

    it("strikes the icon through, hidden from assistive tech", () => {
      // Decorative: the switch already announces disabled itself, so an
      // announced strike would be noise.
      render(
        <StyledInputToggle
          value={false}
          onChange={() => {}}
          label="X"
          disabled
          iconOff={<svg />}
        />,
      );
      expect(screen.getByTestId("toggle-strike")).toHaveAttribute("aria-hidden", "true");
    });

    it("draws no strike when there is no icon to strike", () => {
      render(<StyledInputToggle value={false} onChange={() => {}} label="X" disabled />);
      expect(screen.queryByTestId("toggle-strike")).toBeNull();
    });
  });

  describe("icons", () => {
    it("shows the on icon when on", () => {
      render(
        <StyledInputToggle
          value
          onChange={() => {}}
          label="X"
          iconOn={<svg data-testid="on" />}
          iconOff={<svg data-testid="off" />}
        />,
      );
      expect(screen.getByTestId("on")).toBeInTheDocument();
      expect(screen.queryByTestId("off")).toBeNull();
    });

    it("shows the off icon when off", () => {
      render(
        <StyledInputToggle
          value={false}
          onChange={() => {}}
          label="X"
          iconOn={<svg data-testid="on" />}
          iconOff={<svg data-testid="off" />}
        />,
      );
      expect(screen.getByTestId("off")).toBeInTheDocument();
    });

    it("renders without either", () => {
      render(<StyledInputToggle value={false} onChange={() => {}} label="X" />);
      expect(screen.getByRole("switch")).toBeInTheDocument();
    });
  });

  describe("accessible name", () => {
    it("falls back to a string tooltip", () => {
      render(<StyledInputToggle value={false} onChange={() => {}} tooltip="Mute alerts" />);
      expect(screen.getByRole("switch", { name: "Mute alerts" })).toBeInTheDocument();
    });

    it("prefers an explicit label over the tooltip", () => {
      render(
        <StyledInputToggle
          value={false}
          onChange={() => {}}
          tooltip="Mute alerts"
          label="Alert sound"
        />,
      );
      expect(screen.getByRole("switch", { name: "Alert sound" })).toBeInTheDocument();
    });

    it("is unnamed when a node tooltip is the only candidate", () => {
      // Pinning the gap rather than pretending it is handled: a node cannot be
      // flattened into a name, so a call site passing only a node tooltip must
      // pass `label` too. The old component had the same hole and no test.
      render(
        <StyledInputToggle value={false} onChange={() => {}} tooltip={<span>Mute</span>} />,
      );
      expect(screen.getByRole("switch")).not.toHaveAttribute("aria-label");
    });
  });

  it("uses no palette literals", () => {
    // It painted itself `gray.300` / `green.400` / `white`, so it ignored the
    // theme and dark mode. The tokens now come from TEXT_BACKGROUND_PAIRS, so
    // the handle is readable against whichever track is under it.
    const { container } = render(
      <StyledInputToggle value onChange={() => {}} label="X" />,
    );
    const sheet = Array.from(document.styleSheets)
      .flatMap((s) => Array.from(s.cssRules))
      .map((r) => r.cssText)
      .join("\n");
    expect(container.innerHTML).not.toMatch(/green\.400|gray\.300/);
    expect(sheet).not.toMatch(/#fff\b|\bwhite\b/i);
  });
});
