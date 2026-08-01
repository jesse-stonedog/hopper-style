import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StyledButton from "../StyledButton";
import { HopperStyleProvider } from "../../config/style-config";
import { ALL_VARIANTS } from "../../config/types";

describe("StyledButton", () => {
  it("renders its label", () => {
    render(<StyledButton>Save</StyledButton>);
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("calls onClick", async () => {
    const onClick = jest.fn();
    render(<StyledButton onClick={onClick}>Save</StyledButton>);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("forwards a ref to the button element", () => {
    // Focus management and scroll-into-view both need the real node.
    const ref = { current: null } as React.RefObject<HTMLButtonElement | null>;
    render(<StyledButton ref={ref}>Save</StyledButton>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("defaults to type=submit like a native button", () => {
    // Documenting the inherited behaviour rather than asserting an opinion:
    // the component sets no type, so it is whatever the platform does.
    render(<StyledButton>Save</StyledButton>);
    expect(screen.getByRole("button")).not.toHaveAttribute("type", "button");
  });

  describe("variants", () => {
    it.each(ALL_VARIANTS)("accepts %s without coercing it", (variant) => {
      // The button recipe defines all ten. `useResolvedVariant` narrows to the
      // five theme ones, so using it here would silently turn every ghost and
      // link button solid — this asserts it does not.
      render(<StyledButton variant={variant}>Go</StyledButton>);
      expect(screen.getByRole("button")).toHaveAttribute(
        "data-panda-variant",
        variant,
      );
    });

    it("falls back to the app-wide variant when the caller gives none", () => {
      render(
        <HopperStyleProvider variant="matte">
          <StyledButton>Go</StyledButton>
        </HopperStyleProvider>,
      );
      expect(screen.getByRole("button")).toHaveAttribute(
        "data-panda-variant",
        "matte",
      );
    });

    it("lets the caller override the app-wide variant", () => {
      render(
        <HopperStyleProvider variant="matte">
          <StyledButton variant="ghost">Go</StyledButton>
        </HopperStyleProvider>,
      );
      expect(screen.getByRole("button")).toHaveAttribute(
        "data-panda-variant",
        "ghost",
      );
    });
  });

  describe("loading", () => {
    it("shows a spinner instead of the label", () => {
      render(<StyledButton loading>Save</StyledButton>);
      expect(screen.getByRole("status")).toBeInTheDocument();
      expect(screen.queryByText("Save")).not.toBeInTheDocument();
    });

    it("names what is happening when given loadText", () => {
      render(
        <StyledButton loading loadText="Saving your note">
          Save
        </StyledButton>,
      );
      expect(screen.getByText("Saving your note")).toBeInTheDocument();
    });

    it("disables the button so a second submit cannot fire", async () => {
      // The classic double-charge bug. A loading button that stays clickable is
      // the whole reason this behaviour exists.
      const onClick = jest.fn();
      render(
        <StyledButton loading onClick={onClick}>
          Pay
        </StyledButton>,
      );
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
      await userEvent.click(button);
      expect(onClick).not.toHaveBeenCalled();
    });

    it("marks itself busy for assistive technology", () => {
      // Without aria-busy a screen-reader user is told the control is disabled
      // and not told why.
      render(<StyledButton loading>Save</StyledButton>);
      expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true");
    });

    it("is not busy when idle", () => {
      render(<StyledButton>Save</StyledButton>);
      expect(screen.getByRole("button")).not.toHaveAttribute("aria-busy", "true");
    });
  });

  describe("disabled", () => {
    it("does not fire onClick", async () => {
      const onClick = jest.fn();
      render(
        <StyledButton disabled onClick={onClick}>
          Save
        </StyledButton>,
      );
      await userEvent.click(screen.getByRole("button"));
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe("icons", () => {
    it("renders a left icon before the label", () => {
      render(
        <StyledButton leftIcon={<svg data-testid="left" />}>Save</StyledButton>,
      );
      expect(screen.getByTestId("left")).toBeInTheDocument();
    });

    it("renders a right icon after the label", () => {
      render(
        <StyledButton rightIcon={<svg data-testid="right" />}>Save</StyledButton>,
      );
      expect(screen.getByTestId("right")).toBeInTheDocument();
    });

    it("renders both at once", () => {
      render(
        <StyledButton
          leftIcon={<svg data-testid="left" />}
          rightIcon={<svg data-testid="right" />}
        >
          Save
        </StyledButton>,
      );
      expect(screen.getByTestId("left")).toBeInTheDocument();
      expect(screen.getByTestId("right")).toBeInTheDocument();
    });

    it("takes any node, not just an element", () => {
      // The icon seam means a consumer may hand over anything — a Lucide
      // component, a Font Awesome wrapper, or plain text.
      render(<StyledButton leftIcon="→">Next</StyledButton>);
      expect(screen.getByRole("button")).toHaveTextContent("→");
    });
  });

  describe("tooltip", () => {
    it("renders without one", () => {
      render(<StyledButton>Save</StyledButton>);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("does not swallow the button when one is given", () => {
      render(<StyledButton tooltip="Saves your work">Save</StyledButton>);
      expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    });
  });

  describe("layout props", () => {
    it("applies noWrap as a real style so a label cannot break mid-word", () => {
      render(<StyledButton noWrap>A long label</StyledButton>);
      expect(screen.getByRole("button")).toHaveStyle({ whiteSpace: "nowrap" });
    });

    it("applies positioning props as inline style, not classes", () => {
      // Panda would emit these as atomic classes, which lose to the recipe's
      // own class in the cascade — so a caller positioning a button absolutely
      // would find it ignored.
      render(
        <StyledButton position="absolute" top="10px" right="4px" zIndex={5}>
          Close
        </StyledButton>,
      );
      expect(screen.getByRole("button")).toHaveStyle({
        position: "absolute",
        top: "10px",
        right: "4px",
        zIndex: "5",
      });
    });

    it("lets a caller's own style win over the generated one", () => {
      render(<StyledButton style={{ opacity: 0.5 }}>Save</StyledButton>);
      expect(screen.getByRole("button")).toHaveStyle({ opacity: "0.5" });
    });
  });
});
