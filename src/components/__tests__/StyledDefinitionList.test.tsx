import React from "react";
import { render, screen } from "@testing-library/react";
import { dlRecipe } from "styled-system/recipes";
import StyledDefinitionList, {
  type StyledDefinitionListProps,
} from "../StyledDefinitionList";

const Sample = ({ variant }: Pick<StyledDefinitionListProps, "variant">) => (
  <StyledDefinitionList.Root variant={variant} data-testid="dl">
    <StyledDefinitionList.Term>Admitted</StyledDefinitionList.Term>
    <StyledDefinitionList.Definition>4 March</StyledDefinitionList.Definition>
    <StyledDefinitionList.Term>Discharged</StyledDefinitionList.Term>
    <StyledDefinitionList.Definition>11 March</StyledDefinitionList.Definition>
  </StyledDefinitionList.Root>
);

describe("StyledDefinitionList", () => {
  it("renders a dl of dt/dd pairs", () => {
    render(<Sample />);
    const dl = screen.getByTestId("dl");
    expect(dl.tagName).toBe("DL");
    expect(dl.querySelectorAll("dt")).toHaveLength(2);
    expect(dl.querySelectorAll("dd")).toHaveLength(2);
  });

  it("keeps each term with its definition in document order", () => {
    // The pairing is the whole reason this is a <dl> and not two columns of a
    // table — a screen reader reads a term and then its definition.
    render(<Sample />);
    const children = Array.from(screen.getByTestId("dl").children).map(
      (el) => [el.tagName, el.textContent] as const,
    );
    expect(children).toEqual([
      ["DT", "Admitted"],
      ["DD", "4 March"],
      ["DT", "Discharged"],
      ["DD", "11 March"],
    ]);
  });

  describe("variant resolution", () => {
    it("falls back to solid when none is given", () => {
      // It used to default to a literal "solid" and never consult the host's
      // configuration, so one panel stayed solid in a `matte` product. It goes
      // through `useResolvedVariant` now — which with no provider mounted also
      // yields "solid", so the assertion that it is actually consulting the
      // resolver is the coercion test below.
      render(<Sample />);
      expect(screen.getByTestId("dl").className).toContain(
        dlRecipe({ variant: "solid" }),
      );
    });

    it("honours an explicit variant", () => {
      render(<Sample variant="matte" />);
      expect(screen.getByTestId("dl").className).toContain(
        dlRecipe({ variant: "matte" }),
      );
    });

    it("coerces a variant the recipe does not define", () => {
      // `ghost` is a legitimate AllowedVariant — a call site may ask for it —
      // but `dlRecipe` has no case for it. The originating version hand-mapped
      // `link`/`ghost`/`selected` onto solid; the allow-list does it now, in
      // one place, for every value including ones nobody thought of.
      render(<Sample variant="ghost" />);
      expect(screen.getByTestId("dl").className).toContain(
        dlRecipe({ variant: "solid" }),
      );
    });

    it("coerces every style variant the recipe lacks", () => {
      const lacking = ["ghost", "link", "selected"] as const;
      const solid = dlRecipe({ variant: "solid" });
      lacking.forEach((variant) => {
        const { unmount } = render(<Sample variant={variant} />);
        expect(screen.getByTestId("dl").className).toContain(solid);
        unmount();
      });
    });
  });

  it("keeps a caller's className alongside the recipe's", () => {
    render(
      <StyledDefinitionList.Root className="mine" data-testid="dl">
        <StyledDefinitionList.Term>A</StyledDefinitionList.Term>
        <StyledDefinitionList.Definition>B</StyledDefinitionList.Definition>
      </StyledDefinitionList.Root>,
    );
    expect(screen.getByTestId("dl")).toHaveClass("mine");
  });

  it("forwards a ref to the dl", () => {
    const ref = React.createRef<HTMLDListElement>();
    render(
      <StyledDefinitionList.Root ref={ref}>
        <StyledDefinitionList.Term>A</StyledDefinitionList.Term>
        <StyledDefinitionList.Definition>B</StyledDefinitionList.Definition>
      </StyledDefinitionList.Root>,
    );
    expect(ref.current?.tagName).toBe("DL");
  });
});
