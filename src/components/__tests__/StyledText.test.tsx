import { render, screen } from "@testing-library/react";
import StyledText from "../StyledText";
import StyledHeading from "../StyledHeading";
import { StonedogStyleProvider } from "../../config/style-config";
import { fontSizeMap, getFontSizeValue } from "../../config/font-size";

describe("StyledText", () => {
  it("renders its children", () => {
    render(<StyledText>hello</StyledText>);
    expect(screen.getByText("hello")).toBeInTheDocument();
  });

  it("sizes text from the app-wide profile", () => {
    render(
      <StonedogStyleProvider fontSizeProfile="xl">
        <StyledText>big</StyledText>
      </StonedogStyleProvider>,
    );
    expect(screen.getByText("big")).toHaveStyle({ fontSize: fontSizeMap.xl });
  });

  it("lets an explicit size win over the profile", () => {
    render(
      <StonedogStyleProvider fontSizeProfile="xl">
        <StyledText size="xs">small anyway</StyledText>
      </StonedogStyleProvider>,
    );
    expect(screen.getByText("small anyway")).toHaveStyle({
      fontSize: fontSizeMap.xs,
    });
  });

  it("pins text to md when fixedSize is set", () => {
    // Used where a label must not grow with the profile — e.g. text inside a
    // fixed-height control that would otherwise clip.
    render(
      <StonedogStyleProvider fontSizeProfile="xl">
        <StyledText fixedSize>pinned</StyledText>
      </StonedogStyleProvider>,
    );
    expect(screen.getByText("pinned")).toHaveStyle({ fontSize: fontSizeMap.md });
  });

  it("truncates with ellipsis when asked", () => {
    render(<StyledText ellipsis>long</StyledText>);
    expect(screen.getByText("long")).toHaveStyle({
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      overflow: "hidden",
    });
  });

  it("renders as another element when `as` is given", () => {
    render(<StyledText as="label">labelled</StyledText>);
    expect(screen.getByText("labelled").tagName).toBe("LABEL");
  });
});

describe("StyledHeading", () => {
  it("renders one tier above the current profile, so hierarchy survives every font size", () => {
    render(
      <StonedogStyleProvider fontSizeProfile="md">
        <StyledHeading>title</StyledHeading>
      </StonedogStyleProvider>,
    );
    expect(screen.getByText("title")).toHaveStyle({ fontSize: fontSizeMap.lg });
  });

  it("clamps at the top of the scale rather than running off the end", () => {
    render(<StyledHeading size="9xl">huge</StyledHeading>);
    expect(screen.getByText("huge")).toHaveStyle({ fontSize: fontSizeMap["9xl"] });
  });

  it("defaults to an h1", () => {
    render(<StyledHeading>heading</StyledHeading>);
    expect(screen.getByText("heading").tagName).toBe("H1");
  });

  it("renders the requested heading level", () => {
    render(<StyledHeading as="h3">sub</StyledHeading>);
    expect(screen.getByText("sub").tagName).toBe("H3");
  });
});

describe("the font-size scale", () => {
  it("is expressed in rem, never px, so it honours the browser's own setting", () => {
    // The accessibility affordance users with low vision actually reach for is
    // the browser font size; a px scale silently ignores it.
    for (const value of Object.values(fontSizeMap)) {
      expect(value).toMatch(/rem\)$/);
      expect(value).not.toMatch(/\dpx/);
    }
  });

  it("increases monotonically", () => {
    const sizes = Object.keys(fontSizeMap).map((k) =>
      parseFloat(getFontSizeValue(k)),
    );
    // Pairwise, so each element is read once and narrowed. Indexing twice per
    // iteration under noUncheckedIndexedAccess needs two assertions, and an
    // assertion in a test is a place a real regression can hide.
    for (let i = 1; i < sizes.length; i += 1) {
      const previous = sizes[i - 1];
      const current = sizes[i];
      expect(previous).toBeDefined();
      expect(current).toBeDefined();
      expect(current as number).toBeGreaterThan(previous as number);
    }
  });

  it("reports unknown for a size it does not define", () => {
    expect(getFontSizeValue("gigantic")).toBe("unknown");
  });
});
