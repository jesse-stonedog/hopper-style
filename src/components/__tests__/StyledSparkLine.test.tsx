import React from "react";
import { render, screen } from "@testing-library/react";
import StyledSparkLine from "../StyledSparkLine";

describe("StyledSparkLine", () => {
  const data = [1, 4, 2, 8, 5];

  it("renders nothing for fewer than two points", () => {
    // One point has no line to draw, and interpolating from it would invent a
    // trend that the data does not contain.
    const { container } = render(<StyledSparkLine data={[3]} label="Weight" />);
    expect(container.querySelector("svg")).toBeNull();
  });

  it("renders nothing for an empty series", () => {
    const { container } = render(<StyledSparkLine data={[]} label="Weight" />);
    expect(container.querySelector("svg")).toBeNull();
  });

  it("exposes itself to assistive tech with the caller's name", () => {
    // The defect this replaces: a bare <svg> with no role and no name is
    // skipped entirely by a screen reader, so the trend did not exist for
    // anyone not looking at it.
    render(<StyledSparkLine data={data} label="Blood pressure, last 7 days" />);
    expect(
      screen.getByRole("img", { name: "Blood pressure, last 7 days" }),
    ).toBeInTheDocument();
  });

  it("is hidden from assistive tech when explicitly decorative", () => {
    // An empty label is a decision — the surrounding copy already says it.
    // Distinct from a missing label, which is an oversight, and which the
    // required prop makes impossible.
    const { container } = render(<StyledSparkLine data={data} label="" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).not.toHaveAttribute("role");
    expect(svg).not.toHaveAttribute("aria-label");
  });

  it("defaults its colour to currentColor, not a namespaced custom property", () => {
    // It used to hardcode `var(--hopper-text-primary-text, #666)`, which only
    // themed correctly under the default cssVarPrefix (NEH-256/NEH-171). A
    // sparkline is punctuation inside running text; inheriting is both correct
    // and free for the host.
    const { container } = render(<StyledSparkLine data={data} label="Trend" />);
    const line = container.querySelector("polyline");
    expect(line).toHaveAttribute("stroke", "currentColor");
    expect(container.innerHTML).not.toContain("--hopper-");
  });

  it("lets a caller override the colour", () => {
    const { container } = render(
      <StyledSparkLine data={data} label="Trend" color="rebeccapurple" />,
    );
    expect(container.querySelector("polyline")).toHaveAttribute(
      "stroke",
      "rebeccapurple",
    );
  });

  it("plots one point per datum", () => {
    const { container } = render(<StyledSparkLine data={data} label="Trend" />);
    const points = container
      .querySelector("polyline")!
      .getAttribute("points")!
      .trim()
      .split(/\s+/);
    expect(points).toHaveLength(data.length);
  });

  it("spans the full width, first point to last", () => {
    const { container } = render(
      <StyledSparkLine data={data} label="Trend" width={100} />,
    );
    const points = container
      .querySelector("polyline")!
      .getAttribute("points")!
      .trim()
      .split(/\s+/);
    const xOf = (p: string | undefined) => Number(p?.split(",")[0]);
    expect(xOf(points[0])).toBeCloseTo(1); // the 1px padding
    expect(xOf(points[points.length - 1])).toBeCloseTo(99);
  });

  it("survives a flat series without dividing by zero", () => {
    // range === 0; the guard is `|| 1`. Without it every y is NaN and the
    // polyline silently renders nothing.
    const { container } = render(
      <StyledSparkLine data={[5, 5, 5]} label="Flat" />,
    );
    expect(container.querySelector("polyline")!.getAttribute("points")).not.toContain(
      "NaN",
    );
  });
});
