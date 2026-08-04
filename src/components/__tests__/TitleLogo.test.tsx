import React from "react";
import { render, screen } from "@testing-library/react";
import TitleLogo, {
  TITLE_LOGO_METRICS,
  TITLE_LOGO_SIZES,
  isTitleLogoSize,
} from "../TitleLogo";

describe("TitleLogo", () => {
  it("renders the title it is handed", () => {
    render(<TitleLogo title="Optima Filings Cloud" />);
    expect(screen.getByTestId("title-logo-title")).toHaveTextContent(
      "Optima Filings Cloud",
    );
  });

  it("renders the mark it is handed", () => {
    render(<TitleLogo title="Brand" logo={<svg data-testid="mark" />} />);
    expect(screen.getByTestId("mark")).toBeInTheDocument();
  });

  it("is text-only when no logo is given", () => {
    render(<TitleLogo title="Brand" />);
    expect(screen.queryByTestId("title-logo-mark")).not.toBeInTheDocument();
  });

  it("accepts nodes as a title, so a brand can style it in parts", () => {
    render(
      <TitleLogo
        title={
          <>
            <span data-testid="part-one">HOPPER</span>
            <span data-testid="part-two">Guard</span>
          </>
        }
      />,
    );
    expect(screen.getByTestId("part-one")).toBeInTheDocument();
    expect(screen.getByTestId("part-two")).toBeInTheDocument();
  });

  it("omits the subtitle unless one is given", () => {
    render(<TitleLogo title="Brand" />);
    expect(screen.queryByTestId("title-logo-subtitle")).not.toBeInTheDocument();
  });

  describe("sizes", () => {
    it.each(TITLE_LOGO_SIZES)("renders at %s", (size) => {
      render(<TitleLogo title="Brand" size={size} logo={<svg />} />);
      expect(screen.getByTestId("title-logo")).toHaveAttribute("data-size", size);
    });

    it("defaults to medium", () => {
      render(<TitleLogo title="Brand" />);
      expect(screen.getByTestId("title-logo")).toHaveAttribute("data-size", "medium");
    });

    /**
     * The rungs must actually differ. Three names that resolve to the same
     * metrics would type-check, render, and be useless — which is the failure
     * this package is trying to remove from HopperGuard's nine logo files.
     */
    it("gives every rung distinct metrics", () => {
      const marks = TITLE_LOGO_SIZES.map((s) => TITLE_LOGO_METRICS[s].mark);
      expect(new Set(marks).size).toBe(TITLE_LOGO_SIZES.length);

      const titles = TITLE_LOGO_SIZES.map((s) => TITLE_LOGO_METRICS[s].title);
      expect(new Set(titles).size).toBe(TITLE_LOGO_SIZES.length);
    });

    /**
     * rem, never px — a logo pinned in px ignores the browser's own font-size
     * setting, and this is the one piece of chrome on every page.
     */
    it("states every metric in rem", () => {
      for (const size of TITLE_LOGO_SIZES) {
        expect(TITLE_LOGO_METRICS[size].mark).toMatch(/rem$/);
        expect(TITLE_LOGO_METRICS[size].gap).toMatch(/rem$/);
      }
    });

    /**
     * Metrics must be real CSS, not Panda token keys.
     *
     * They are applied as inline `style`, because Panda cannot statically
     * resolve a runtime Record lookup — a token key like "lg" would simply be
     * an invalid inline value and the text would render at the inherited size.
     * Font sizes go through the host's custom properties so the host's scale
     * still applies, with a literal fallback for a host that defines none.
     */
    it("expresses type sizes as real CSS, not token keys", () => {
      for (const size of TITLE_LOGO_SIZES) {
        const { title, subtitle } = TITLE_LOGO_METRICS[size];
        expect(title).toMatch(/^var\(--font-sizes-[\w-]+, .+\)$/);
        expect(subtitle).toMatch(/^var\(--font-sizes-[\w-]+, .+\)$/);
      }
    });

    /**
     * The regression that reached a consumer: passing these as Panda style
     * props emitted no CSS at all, so the mark rendered at its natural size
     * (512px) and blew the masthead out. Inline style is what makes the
     * component immune to a consumer's `include` glob.
     */
    it("applies the mark's size inline, where extraction cannot fail", () => {
      render(<TitleLogo title="Brand" size="small" logo={<svg />} />);
      const mark = screen.getByTestId("title-logo-mark");

      expect(mark.style.width).toBe(TITLE_LOGO_METRICS.small.mark);
      expect(mark.style.height).toBe(TITLE_LOGO_METRICS.small.mark);
    });

    it("applies the gap inline too", () => {
      render(<TitleLogo title="Brand" size="large" logo={<svg />} />);
      expect(screen.getByTestId("title-logo").style.gap).toBe(
        TITLE_LOGO_METRICS.large.gap,
      );
    });

    it("falls back to medium for a size that is not one of the three", () => {
      // Reaches this repo from storage or an API in real use, and may predate
      // a rename — so it must not throw or render nothing.
      render(<TitleLogo title="Brand" size={"enormous" as never} logo={<svg />} />);
      expect(screen.getByTestId("title-logo-title")).toBeInTheDocument();
    });

    it("validates a size", () => {
      expect(isTitleLogoSize("small")).toBe(true);
      expect(isTitleLogoSize("enormous")).toBe(false);
      expect(isTitleLogoSize(undefined)).toBe(false);
    });
  });

  describe("accessibility", () => {
    /**
     * A logo is ONE thing. Announcing the mark and the wordmark separately is
     * one thing too many, which is the noise NEH-287 objects to.
     */
    it("names the lockup once and hides the decorative mark", () => {
      render(<TitleLogo title="Optima Filings Cloud" logo={<svg data-testid="mark" />} />);

      expect(screen.getByRole("img", { name: "Optima Filings Cloud" })).toBeInTheDocument();
      expect(screen.getByTestId("title-logo-mark")).toHaveAttribute("aria-hidden", "true");
    });

    it("takes an explicit label when the title is not a plain string", () => {
      render(
        <TitleLogo
          title={<span>HOPPERGuard</span>}
          logo={<svg />}
          label="HopperGuard"
        />,
      );
      expect(screen.getByRole("img", { name: "HopperGuard" })).toBeInTheDocument();
    });

    /**
     * With no derivable name, it must NOT claim `role="img"` — an image with no
     * accessible name is worse than markup that was never given the role, since
     * a screen reader announces "image" and nothing else.
     */
    it("does not claim to be an image when it cannot be named", () => {
      render(<TitleLogo title={<span>Styled</span>} logo={<svg />} />);
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });
  });

  /**
   * NEH-287: the trademark glyph and the by-line are gone on purpose. This
   * guards the decision rather than the markup — re-adding either here (rather
   * than in the footer, or in the caller's `title`) should fail.
   */
  it("renders no trademark glyph of its own", () => {
    const { container } = render(<TitleLogo title="Brand" logo={<svg />} />);
    expect(container.textContent).not.toContain("™");
  });
});
