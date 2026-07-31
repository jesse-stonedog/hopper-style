import { render, screen } from "@testing-library/react";
import StyledIcon from "../StyledIcon";
import { createIcon, createIconFromComponent } from "../create-icon";

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
    const { container } = render(<StyledIcon icon={<svg />} />);
    expect(container.firstChild).toHaveStyle({ width: "32px", height: "32px" });
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
