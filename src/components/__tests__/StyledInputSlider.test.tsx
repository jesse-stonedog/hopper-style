import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import StyledInputSlider from "../StyledInputSlider";

describe("StyledInputSlider", () => {
  it("renders a slider at the given value", () => {
    render(<StyledInputSlider value={40} onChange={() => {}} />);
    expect(screen.getByRole("slider")).toHaveValue("40");
  });

  it("passes min, max and step through to the input", () => {
    render(
      <StyledInputSlider value={5} onChange={() => {}} min={0} max={10} step={1} />,
    );
    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("min", "0");
    expect(slider).toHaveAttribute("max", "10");
    expect(slider).toHaveAttribute("step", "1");
  });

  it("reports the new value as a number, not a string", () => {
    const onChange = jest.fn();
    render(<StyledInputSlider value={40} onChange={onChange} />);
    fireEvent.change(screen.getByRole("slider"), { target: { value: "70" } });
    expect(onChange).toHaveBeenCalledWith(70);
  });

  describe("fractional steps", () => {
    // The regression this migration fixed. `parseInt("2.5", 10)` is 2, so a
    // half-step slider reported a value the user had not chosen and the thumb
    // snapped back as it round-tripped. Fails on the pre-fix code.
    it("keeps the fraction when step is 0.5", () => {
      const onChange = jest.fn();
      render(
        <StyledInputSlider value={2} onChange={onChange} min={0} max={5} step={0.5} />,
      );
      fireEvent.change(screen.getByRole("slider"), { target: { value: "2.5" } });
      expect(onChange).toHaveBeenCalledWith(2.5);
    });

    it("keeps the fraction on a 0.1 step too", () => {
      const onChange = jest.fn();
      render(
        <StyledInputSlider value={1} onChange={onChange} min={0} max={2} step={0.1} />,
      );
      fireEvent.change(screen.getByRole("slider"), { target: { value: "1.3" } });
      expect(onChange).toHaveBeenCalledWith(1.3);
    });

    it("still reports whole numbers as whole numbers", () => {
      const onChange = jest.fn();
      render(<StyledInputSlider value={1} onChange={onChange} step={1} />);
      fireEvent.change(screen.getByRole("slider"), { target: { value: "3" } });
      expect(onChange).toHaveBeenCalledWith(3);
    });
  });

  describe("labels", () => {
    it("renders the end labels", () => {
      render(
        <StyledInputSlider
          value={3}
          onChange={() => {}}
          minLabel="Quiet"
          maxLabel="Loud"
        />,
      );
      expect(screen.getByText("Quiet")).toBeInTheDocument();
      expect(screen.getByText("Loud")).toBeInTheDocument();
    });

    it("omits them when not given", () => {
      const { container } = render(
        <StyledInputSlider value={3} onChange={() => {}} />,
      );
      expect(container.textContent).toBe("");
    });

    it("renders the readout with the live value", () => {
      render(
        <StyledInputSlider value={7} onChange={() => {}} currentLabel="Volume" />,
      );
      expect(screen.getByText(/Volume:\s*7/)).toBeInTheDocument();
    });
  });

  describe("accessible name", () => {
    // The other fix. The readout is a sibling <StyledText>, so nothing named
    // the control and a screen reader met "slider, 40".
    it("names the control from currentLabel", () => {
      render(
        <StyledInputSlider value={40} onChange={() => {}} currentLabel="Volume" />,
      );
      expect(screen.getByRole("slider", { name: "Volume" })).toBeInTheDocument();
    });

    it("lets an explicit aria-label win", () => {
      render(
        <StyledInputSlider
          value={40}
          onChange={() => {}}
          currentLabel="Volume"
          aria-label="Playback volume"
        />,
      );
      expect(
        screen.getByRole("slider", { name: "Playback volume" }),
      ).toBeInTheDocument();
    });

    it("is unnamed when the caller supplies nothing — by omission, not by accident", () => {
      render(<StyledInputSlider value={40} onChange={() => {}} />);
      expect(screen.getByRole("slider")).not.toHaveAttribute("aria-label");
    });
  });

  it("forwards other input attributes", () => {
    render(
      <StyledInputSlider
        value={40}
        onChange={() => {}}
        id="vol"
        disabled
        data-testid="slider"
      />,
    );
    const slider = screen.getByTestId("slider");
    expect(slider).toHaveAttribute("id", "vol");
    expect(slider).toBeDisabled();
  });
});
