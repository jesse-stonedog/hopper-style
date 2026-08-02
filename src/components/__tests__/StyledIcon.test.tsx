import React from "react";
import { render, screen } from "@testing-library/react";
import StyledIcon from "../StyledIcon";
import { createIcon, createIconFromComponent } from "../create-icon";
import { StonedogStyleProvider } from "../../config/style-config";
import type { IconSize } from "../../config/types";

/** Renders inside a provider that sets only the app-wide icon size. */
function withIconSize(iconSize: IconSize) {
  return function IconSizeWrapper({ children }: { children: React.ReactNode }) {
    return (
      <StonedogStyleProvider iconSize={iconSize}>{children}</StonedogStyleProvider>
    );
  };
}

describe("StyledIcon", () => {
  it("renders whatever node it is handed", () => {
    render(<StyledIcon icon={<svg data-testid="glyph" />} />);
    expect(screen.getByTestId("glyph")).toBeInTheDocument();
  });

  it("accepts children as an equivalent to the icon prop", () => {
    render(
      <StyledIcon>
        <svg data-testid="glyph" />
      </StyledIcon>,
    );
    expect(screen.getByTestId("glyph")).toBeInTheDocument();
  });

  it("sizes the box from the size name", () => {
    const { container } = render(<StyledIcon size="lg" icon={<svg />} />);
    expect(container.firstChild).toHaveStyle({ width: "24px", height: "24px" });
  });

  it("defaults to 2x", () => {
    // The package default is pinned to what the originating application already
    // renders at ~150 call sites. Changing it would be an invisible, app-wide
    // visual change to every existing consumer.
    const { container } = render(<StyledIcon icon={<svg />} />);
    expect(container.firstChild).toHaveStyle({ width: "32px", height: "32px" });
  });

  it("takes the app-wide default icon size from the provider", () => {
    // The seam that lets a host run a conventional web scale without forking
    // the package or naming a size at every call site.
    const { container } = render(<StyledIcon icon={<svg />} />, {
      wrapper: withIconSize("md"),
    });
    expect(container.firstChild).toHaveStyle({ width: "20px", height: "20px" });
  });

  it("lets a call site override the app-wide default", () => {
    const { container } = render(<StyledIcon size="lg" icon={<svg />} />, {
      wrapper: withIconSize("md"),
    });
    expect(container.firstChild).toHaveStyle({ width: "24px", height: "24px" });
  });

  it("keeps 2x when a host mounts the provider but sets no icon size", () => {
    // Partial config must not silently reset the other settings — a host that
    // only cares about the variant should not have its icons resize.
    const { container } = render(<StyledIcon icon={<svg />} />, {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <StonedogStyleProvider variant="glass">{children}</StonedogStyleProvider>
      ),
    });
    expect(container.firstChild).toHaveStyle({ width: "32px", height: "32px" });
  });

  it.each(["2xs", "xs", "sm", "1x", "md", "lg", "2x", "xl", "2xl", "3x", "10x"] as const)(
    "resolves the size name %s to a real box",
    (size) => {
      // Every name in the union must map to a px value. A name with no entry
      // silently falls back to 20px, so an icon would render at the wrong size
      // with nothing failing — and the union has to stay a superset of Font
      // Awesome's SizeProp for hopper-icons to map onto it at all.
      const { container } = render(<StyledIcon size={size} icon={<svg />} />);
      const width = (container.firstChild as HTMLElement).style.width;
      expect(width).toMatch(/^\d+px$/);
      expect(width).not.toBe("");
    },
  );

  it("gives every size name a distinct box across the scale", () => {
    const seen = ["2xs", "xs", "sm", "lg", "2x", "2xl", "3x"].map((size) => {
      const { container } = render(<StyledIcon size={size as never} icon={<svg />} />);
      return (container.firstChild as HTMLElement).style.width;
    });
    expect(new Set(seen).size).toBe(seen.length);
  });

  it("does not let a caller's inline style defeat the size prop", () => {
    // `size` is the prop that exists to control the box. A stray height in a
    // spread style object silently winning would make sizing unpredictable.
    const { container } = render(
      <StyledIcon size="sm" style={{ height: "200px" }} icon={<svg />} />,
    );
    expect(container.firstChild).toHaveStyle({ height: "16px" });
  });

  it("sets color so currentColor-based icon sets inherit it", () => {
    // Lucide, Heroicons, Feather and most hand-rolled SVGs draw with
    // currentColor and need nothing else.
    const { container } = render(<StyledIcon color="#ff0000" icon={<svg />} />);
    expect(container.firstChild).toHaveStyle({ color: "#ff0000" });
  });

  it("falls back to theme tokens rather than a literal colour", () => {
    const { container } = render(<StyledIcon icon={<svg />} />);
    const style = (container.firstChild as HTMLElement).getAttribute("style");
    expect(style).toContain("var(--colors-text-main)");
    expect(style).not.toMatch(/#[0-9a-f]{3,6}/i);
  });

  it("publishes neutral custom properties for sets that paint from variables", () => {
    // Named --icon-* rather than any library's own, so no icon dependency is
    // baked into the package. Adapters map them; see the README.
    const { container } = render(
      <StyledIcon
        color="#111"
        secondaryColor="#222"
        secondaryOpacity={0.4}
        icon={<svg />}
      />,
    );
    const style = (container.firstChild as HTMLElement).getAttribute("style");
    expect(style).toContain("--icon-primary-color: #111");
    expect(style).toContain("--icon-secondary-color: #222");
    expect(style).toContain("--icon-secondary-opacity: 0.4");
    expect(style).not.toContain("--fa-");
  });

  it("hides a decorative icon from assistive technology", () => {
    // An icon beside text that already says the same thing must not be
    // announced again.
    const { container } = render(<StyledIcon icon={<svg />} />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
    expect(container.firstChild).not.toHaveAttribute("role");
  });

  it("names and roles an icon that carries meaning", () => {
    render(<StyledIcon title="Delete" icon={<svg />} />);
    const icon = screen.getByRole("img", { name: "Delete" });
    expect(icon).not.toHaveAttribute("aria-hidden");
  });

  it("forwards data attributes and handlers", () => {
    render(<StyledIcon data-testid="wrapper" icon={<svg />} />);
    expect(screen.getByTestId("wrapper")).toBeInTheDocument();
  });
});

describe("createIcon", () => {
  it("builds a named component that forwards every icon prop", () => {
    const Home = createIcon("StyledHome", <svg data-testid="home" />);
    expect(Home.displayName).toBe("StyledHome");

    const { container } = render(<Home size="lg" color="#0f0" />);
    expect(screen.getByTestId("home")).toBeInTheDocument();
    expect(container.firstChild).toHaveStyle({
      width: "24px",
      color: "#0f0",
    });
  });

  it("keeps accessibility props working through the wrapper", () => {
    const Trash = createIcon("StyledTrash", <svg />);
    render(<Trash title="Delete" />);
    expect(screen.getByRole("img", { name: "Delete" })).toBeInTheDocument();
  });

  it("inherits the app-wide icon size, so a whole icon set retunes at once", () => {
    // This is the property hopper-icons depends on: its ~145 wrappers are one
    // line each around StyledIcon and name no size, so a host that sets
    // `iconSize` retunes the entire licensed set without touching it.
    const Home = createIcon("StyledHome", <svg />);
    const { container } = render(<Home />, { wrapper: withIconSize("sm") });
    expect(container.firstChild).toHaveStyle({ width: "16px", height: "16px" });
  });
});

describe("createIconFromComponent", () => {
  it("fills the box rather than letting the set's own default size win", () => {
    // Most sets default to 24px and would otherwise ignore `size` entirely.
    const Glyph = (props: { width?: string; height?: string }) => (
      <svg data-testid="glyph" {...props} />
    );
    const Icon = createIconFromComponent("StyledGlyph", Glyph);

    render(<Icon size="5x" />);
    const glyph = screen.getByTestId("glyph");
    expect(glyph).toHaveAttribute("width", "100%");
    expect(glyph).toHaveAttribute("height", "100%");
  });

  it("lets explicit component props override the fill defaults", () => {
    const Glyph = (props: { width?: string; strokeWidth?: number }) => (
      <svg data-testid="glyph" {...props} />
    );
    const Icon = createIconFromComponent("StyledGlyph", Glyph, {
      strokeWidth: 3,
    });
    render(<Icon />);
    expect(screen.getByTestId("glyph")).toHaveAttribute("stroke-width", "3");
  });
});
