import { render, screen } from "@testing-library/react";
import StyledText from "../StyledText";
import StyledHeading from "../StyledHeading";
import { HopperStyleProvider } from "../../config/style-config";
import { fontSizeMap, getFontSizeValue } from "../../config/font-size";

describe("StyledText", () => {
  it("renders its children", () => {
    render(<StyledText>hello</StyledText>);
    expect(screen.getByText("hello")).toBeInTheDocument();
  });

  it("sizes text from the app-wide profile", () => {
    render(
      <HopperStyleProvider fontSizeProfile="xl">
        <StyledText>big</StyledText>
      </HopperStyleProvider>,
    );
    expect(screen.getByText("big")).toHaveStyle({ fontSize: fontSizeMap.xl });
  });

  it("lets an explicit size win over the profile", () => {
    render(
      <HopperStyleProvider fontSizeProfile="xl">
        <StyledText size="xs">small anyway</StyledText>
      </HopperStyleProvider>,
    );
    expect(screen.getByText("small anyway")).toHaveStyle({
      fontSize: fontSizeMap.xs,
    });
  });

  it("pins text to md when fixedSize is set", () => {
    // Used where a label must not grow with the profile — e.g. text inside a
    // fixed-height control that would otherwise clip.
    render(
      <HopperStyleProvider fontSizeProfile="xl">
        <StyledText fixedSize>pinned</StyledText>
      </HopperStyleProvider>,
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
      <HopperStyleProvider fontSizeProfile="md">
        <StyledHeading>title</StyledHeading>
      </HopperStyleProvider>,
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
    for (let i = 1; i < sizes.length; i++) {
      expect(sizes[i]).toBeGreaterThan(sizes[i - 1]);
    }
  });

  it("reports unknown for a size it does not define", () => {
    expect(getFontSizeValue("gigantic")).toBe("unknown");
  });
});
