"use client";

import React from "react";

/**
 * A tiny inline trend line — the shape of a series, at the size of a word.
 *
 * It is deliberately not a chart. No axes, no ticks, no tooltip: a sparkline
 * earns its place by sitting *inside* a sentence or a table cell, and anything
 * that makes it want its own space has turned it into a chart that belongs in
 * a chart component.
 *
 * ## Two defects fixed on the way across
 *
 * **It hardcoded the host's custom-property namespace.** The default colour was
 * `var(--hopper-text-primary-text, #666)` — a literal `--hopper-*` property, so
 * the component only themed correctly inside an app that had chosen that
 * prefix. `cssVarPrefix` is configurable and still defaults to `"hopper"`
 * (NEH-256), so a consumer that renames it would silently have got `#666`
 * everywhere. Same defect class as NEH-171.
 *
 * The replacement is `currentColor`, which is better than reaching for any
 * token: a sparkline is punctuation inside running text, so inheriting the
 * colour of the text it sits in is what a reader expects, and it costs the
 * host nothing to define. A caller wanting a specific colour still passes one.
 *
 * **It was invisible to assistive technology.** A bare `<svg>` with no role and
 * no name is skipped entirely by a screen reader, so the trend simply did not
 * exist for anyone not looking at it. It now renders as `role="img"` with a
 * name, and `label` is required for that reason — there is no sensible default,
 * because only the caller knows what the series *is*.
 *
 * If the surrounding text already states the trend, pass `label=""`: that marks
 * it explicitly decorative (`aria-hidden`) rather than leaving it unnamed by
 * accident. The distinction is the point — an empty string is a decision, a
 * missing prop is an oversight.
 */

export interface StyledSparkLineProps {
  /** The series, in order. Fewer than two points renders nothing. */
  data: number[];
  /**
   * What the line describes, for assistive tech — e.g. "Blood pressure, last
   * 7 days". Pass `""` to mark it decorative when the surrounding copy
   * already says it.
   */
  label: string;
  width?: number;
  height?: number;
  /** Defaults to `currentColor` — it inherits from the text around it. */
  color?: string;
  fillOpacity?: number;
}

const StyledSparkLine: React.FC<StyledSparkLineProps> = ({
  data,
  label,
  width = 80,
  height = 24,
  color = "currentColor",
  fillOpacity = 0.1,
}) => {
  if (!data || data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const padding = 1;

  const points = data.map((v, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = padding + (1 - (v - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  const linePoints = points.join(" ");

  // Closed path for the fill area: the line, then down and back along the
  // baseline.
  const firstX = padding;
  const lastX = padding + (width - padding * 2);
  const fillPath = `M${points[0]} ${points
    .slice(1)
    .map((p) => `L${p}`)
    .join(" ")} L${lastX},${height - padding} L${firstX},${height - padding} Z`;

  const decorative = label === "";

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      // Inline, not a Panda prop: these are layout facts the component owns,
      // and `flexShrink` in particular is what stops a table cell squashing it
      // into a vertical line.
      style={{ display: "block", flexShrink: 0 }}
      // An `<svg>` defaults to `role="graphics-document"` in some engines and
      // to nothing in others. Naming the role removes the difference.
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : label}
    >
      <path d={fillPath} fill={color} opacity={fillOpacity} />
      <polyline
        points={linePoints}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
};

StyledSparkLine.displayName = "StyledSparkLine";

export default StyledSparkLine;
