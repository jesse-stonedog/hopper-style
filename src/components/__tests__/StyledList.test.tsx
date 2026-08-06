import React from "react";
import { render, screen } from "@testing-library/react";
import { listRecipe } from "styled-system/recipes";
import StyledList from "../StyledList";

describe("StyledList", () => {
  it("renders a ul by default", () => {
    render(
      <StyledList.Root>
        <StyledList.Item>One</StyledList.Item>
      </StyledList.Root>,
    );
    expect(screen.getByRole("list").tagName).toBe("UL");
  });

  it("renders an ol when numbered", () => {
    render(
      <StyledList.Root showNumbers>
        <StyledList.Item>One</StyledList.Item>
      </StyledList.Root>,
    );
    expect(screen.getByRole("list").tagName).toBe("OL");
  });

  describe("variant resolution", () => {
    it("falls back to solid, not to a variant that does not exist", () => {
      // THE defect this migration fixes. The originating version defaulted to
      // `"list"` — the recipe's className, not one of its variants — so with no
      // provider supplying a global variant the recipe matched nothing and the
      // list rendered with no surface, no border and no row separators.
      render(
        <StyledList.Root>
          <StyledList.Item>One</StyledList.Item>
        </StyledList.Root>,
      );
      expect(screen.getByRole("list").className).toContain(
        listRecipe({ variant: "solid" }).root,
      );
    });

    it("never emits the recipe's own class name as a variant", () => {
      const { container } = render(
        <StyledList.Root>
          <StyledList.Item>One</StyledList.Item>
        </StyledList.Root>,
      );
      // `list--variant_list` is what the old default produced. A variant class
      // naming a variant the recipe never defined is the signature.
      expect(container.innerHTML).not.toContain("variant_list");
    });

    it("honours an explicit variant", () => {
      render(
        <StyledList.Root variant="outline">
          <StyledList.Item>One</StyledList.Item>
        </StyledList.Root>,
      );
      expect(screen.getByRole("list").className).toContain(
        listRecipe({ variant: "outline" }).root,
      );
    });

    it("coerces an unsupported variant rather than passing it through", () => {
      render(
        // @ts-expect-error — deliberately outside ListVariant; a consumer on
        // plain JS can still do this, and the resolver is what catches it.
        <StyledList.Root variant="not-a-variant">
          <StyledList.Item>One</StyledList.Item>
        </StyledList.Root>,
      );
      expect(screen.getByRole("list").className).toContain(
        listRecipe({ variant: "solid" }).root,
      );
    });
  });

  describe("Item owns its own styling", () => {
    // The originating Root walked its children and cloneElement'd the item
    // class onto each. That only worked when every row was a direct child.

    it("styles a row that is a direct child", () => {
      render(
        <StyledList.Root>
          <StyledList.Item>One</StyledList.Item>
        </StyledList.Root>,
      );
      expect(screen.getByText("One").className).toContain(
        listRecipe({ variant: "solid" }).item,
      );
    });

    it("styles rows rendered from a map", () => {
      render(
        <StyledList.Root>
          {["a", "b", "c"].map((k) => (
            <StyledList.Item key={k}>{k}</StyledList.Item>
          ))}
        </StyledList.Root>,
      );
      const itemClass = listRecipe({ variant: "solid" }).item;
      ["a", "b", "c"].forEach((k) =>
        expect(screen.getByText(k).className).toContain(itemClass),
      );
    });

    it("styles rows inside a fragment", () => {
      // Under the old cloning approach the class landed on the FRAGMENT, which
      // silently discards it, so these rows rendered bare.
      render(
        <StyledList.Root>
          <>
            <StyledList.Item>One</StyledList.Item>
            <StyledList.Item>Two</StyledList.Item>
          </>
        </StyledList.Root>,
      );
      const itemClass = listRecipe({ variant: "solid" }).item;
      expect(screen.getByText("One").className).toContain(itemClass);
      expect(screen.getByText("Two").className).toContain(itemClass);
    });

    it("styles rows rendered by an intermediate component", () => {
      const Row = ({ children }: { children: React.ReactNode }) => (
        <StyledList.Item>{children}</StyledList.Item>
      );
      render(
        <StyledList.Root>
          <Row>Nested</Row>
        </StyledList.Root>,
      );
      expect(screen.getByText("Nested").className).toContain(
        listRecipe({ variant: "solid" }).item,
      );
    });

    it("keeps a caller's own className", () => {
      render(
        <StyledList.Root>
          <StyledList.Item className="mine">One</StyledList.Item>
        </StyledList.Root>,
      );
      expect(screen.getByText("One")).toHaveClass("mine");
    });
  });

  describe("gap", () => {
    it("is a real CSS gap, not a margin written into each child", () => {
      // The old version cloned `style.marginBottom` onto every child but the
      // last, which overwrote any margin the caller had set inline.
      render(
        <StyledList.Root gap="1rem">
          <StyledList.Item>One</StyledList.Item>
          <StyledList.Item>Two</StyledList.Item>
        </StyledList.Root>,
      );
      expect(screen.getByRole("list")).toHaveStyle({ gap: "1rem" });
      expect(screen.getByText("One").style.marginBottom).toBe("");
    });

    it("leaves a row's own inline style alone", () => {
      render(
        <StyledList.Root gap="1rem">
          <StyledList.Item style={{ marginBottom: "3rem" }}>One</StyledList.Item>
          <StyledList.Item>Two</StyledList.Item>
        </StyledList.Root>,
      );
      expect(screen.getByText("One")).toHaveStyle({ marginBottom: "3rem" });
    });
  });

  describe("style props", () => {
    // These are TYPE assertions as much as runtime ones: `tsc` covers the test
    // files, so if the props type stops admitting `w`/`h`/`mt` this file fails
    // to compile. That is the actual guard — 9 HopperGuard call sites pass
    // them, and the originating component only accepted them by way of a
    // `[key: string]: unknown` index signature that disabled type checking on
    // every other prop at the same time.
    it("accepts Panda style props on the root", () => {
      render(
        <StyledList.Root w="100%" h="100%" mt="4">
          <StyledList.Item>One</StyledList.Item>
        </StyledList.Root>,
      );
      expect(screen.getByRole("list")).toBeInTheDocument();
    });

    it("accepts Panda style props on a row", () => {
      render(
        <StyledList.Root>
          <StyledList.Item px="6">One</StyledList.Item>
        </StyledList.Root>,
      );
      expect(screen.getByText("One")).toBeInTheDocument();
    });

    it("still forwards plain DOM attributes", () => {
      render(
        <StyledList.Root aria-label="Vitals" data-testid="list">
          <StyledList.Item>One</StyledList.Item>
        </StyledList.Root>,
      );
      expect(screen.getByTestId("list")).toHaveAttribute("aria-label", "Vitals");
    });
  });

  describe("list semantics", () => {
    it("keeps an explicit role when markers are suppressed", () => {
      // Safari drops list semantics from any <ul> with `list-style: none`,
      // which is this component's default. Without the role, VoiceOver stops
      // announcing "list, N items".
      render(
        <StyledList.Root>
          <StyledList.Item>One</StyledList.Item>
        </StyledList.Root>,
      );
      expect(screen.getByRole("list")).toHaveAttribute("role", "list");
    });

    it("omits the redundant role when bullets are shown", () => {
      render(
        <StyledList.Root showBullets>
          <StyledList.Item>One</StyledList.Item>
        </StyledList.Root>,
      );
      expect(screen.getByRole("list")).not.toHaveAttribute("role");
    });

    it("counts its rows", () => {
      render(
        <StyledList.Root>
          <StyledList.Item>One</StyledList.Item>
          <StyledList.Item>Two</StyledList.Item>
          <StyledList.Item>Three</StyledList.Item>
        </StyledList.Root>,
      );
      expect(screen.getAllByRole("listitem")).toHaveLength(3);
    });
  });
});
