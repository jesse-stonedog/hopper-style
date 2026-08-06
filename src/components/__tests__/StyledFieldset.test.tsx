import React from "react";
import { render, screen } from "@testing-library/react";
import { formRecipe } from "styled-system/recipes";
import StyledFieldset from "../StyledFieldset";
import StyledFormLabel from "../StyledFormLabel";

describe("StyledFieldset", () => {
  it("names the group with its legend", () => {
    // The reason to reach for a fieldset at all: it is the only markup that
    // gives a *group* an accessible name.
    render(
      <StyledFieldset>
        <StyledFieldset.Legend>Contact preferences</StyledFieldset.Legend>
        <StyledFieldset.Content>
          <input aria-label="Email" />
        </StyledFieldset.Content>
      </StyledFieldset>,
    );
    expect(
      screen.getByRole("group", { name: "Contact preferences" }),
    ).toBeInTheDocument();
  });

  describe("variant resolution", () => {
    it("styles itself when no variant is given", () => {
      // THE defect this migration fixes. The originating root read
      // `variant ? formRecipe({ variant }) : ""`, so a fieldset without an
      // explicit variant got an empty class string — no surface, no border, no
      // padding, and no response to the app-wide appearance. 18 HopperGuard
      // call sites were relying on that default.
      render(
        <StyledFieldset data-testid="fs">
          <StyledFieldset.Legend>Group</StyledFieldset.Legend>
        </StyledFieldset>,
      );
      expect(screen.getByTestId("fs").className).toContain(
        formRecipe({ variant: "solid" }),
      );
    });

    it("emits a non-empty class list with no variant", () => {
      // Stated separately from the assertion above because "" was the actual
      // observed value, and a test comparing against a recipe call would still
      // pass if both sides became empty.
      render(
        <StyledFieldset data-testid="fs">
          <StyledFieldset.Legend>Group</StyledFieldset.Legend>
        </StyledFieldset>,
      );
      expect(screen.getByTestId("fs").className.trim()).not.toBe("");
    });

    it("honours an explicit variant", () => {
      render(
        <StyledFieldset variant="outline" data-testid="fs">
          <StyledFieldset.Legend>Group</StyledFieldset.Legend>
        </StyledFieldset>,
      );
      expect(screen.getByTestId("fs").className).toContain(
        formRecipe({ variant: "outline" }),
      );
    });
  });

  describe("Label", () => {
    it("is StyledFormLabel, not a second divergent label", () => {
      // Two labels in one design system is how a product ends up with form
      // rows that do not match each other. The identity check is the assertion
      // — a copy that merely looks the same today drifts tomorrow.
      expect(StyledFieldset.Label).toBe(StyledFormLabel);
    });

    it("associates with its control", () => {
      render(
        <StyledFieldset>
          <StyledFieldset.Legend>Contact</StyledFieldset.Legend>
          <StyledFieldset.Content>
            <StyledFieldset.Field>
              <StyledFieldset.Label htmlFor="email">Email</StyledFieldset.Label>
              <StyledFieldset.Value>
                <input id="email" />
              </StyledFieldset.Value>
            </StyledFieldset.Field>
          </StyledFieldset.Content>
        </StyledFieldset>,
      );
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
    });

    it("carries the required and optional markers it previously lacked", () => {
      render(
        <StyledFieldset>
          <StyledFieldset.Legend>Contact</StyledFieldset.Legend>
          <StyledFieldset.Label htmlFor="a" required>
            Surname
          </StyledFieldset.Label>
          <StyledFieldset.Label htmlFor="b" optional>
            Middle name
          </StyledFieldset.Label>
        </StyledFieldset>,
      );
      expect(screen.getByText("*")).toBeInTheDocument();
      expect(screen.getByText("(optional)")).toBeInTheDocument();
    });
  });

  it("renders every slot", () => {
    render(
      <StyledFieldset>
        <StyledFieldset.Legend>Legend</StyledFieldset.Legend>
        <StyledFieldset.Content>
          <StyledFieldset.Field>
            <StyledFieldset.Label htmlFor="x">Label</StyledFieldset.Label>
            <StyledFieldset.Value>Value</StyledFieldset.Value>
          </StyledFieldset.Field>
        </StyledFieldset.Content>
      </StyledFieldset>,
    );
    ["Legend", "Label", "Value"].forEach((t) =>
      expect(screen.getByText(t)).toBeInTheDocument(),
    );
  });

  it("keeps a caller's className", () => {
    render(
      <StyledFieldset className="mine" data-testid="fs">
        <StyledFieldset.Legend>Group</StyledFieldset.Legend>
      </StyledFieldset>,
    );
    expect(screen.getByTestId("fs")).toHaveClass("mine");
  });

  it("forwards a ref to the fieldset", () => {
    const ref = React.createRef<HTMLFieldSetElement>();
    render(
      <StyledFieldset ref={ref}>
        <StyledFieldset.Legend>Group</StyledFieldset.Legend>
      </StyledFieldset>,
    );
    expect(ref.current?.tagName).toBe("FIELDSET");
  });

  it("disables every control inside it when disabled", () => {
    // Native fieldset behaviour, and the reason not to reimplement this as a
    // styled div — a div cannot do it.
    render(
      <StyledFieldset disabled>
        <StyledFieldset.Legend>Group</StyledFieldset.Legend>
        <input aria-label="Email" />
      </StyledFieldset>,
    );
    expect(screen.getByLabelText("Email")).toBeDisabled();
  });
});
