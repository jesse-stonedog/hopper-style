import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HopperStyleProvider } from "../../config/style-config";
import { ICON_INTENTS, missingIntentIcons } from "../../config/intent-icons";
import {
  StyledDeleteButton,
  StyledSaveButton,
  StyledAddButton,
} from "../intent-buttons";

const trash = <svg data-testid="trash" />;
const disk = <svg data-testid="disk" />;

const withIcons = (ui: React.ReactNode, density?: "compact" | "normal" | "comfortable") => (
  <HopperStyleProvider density={density} icons={{ delete: trash, save: disk }}>
    {ui}
  </HopperStyleProvider>
);

describe("intent buttons", () => {
  it("render their default label", () => {
    render(withIcons(<StyledDeleteButton />));
    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
  });

  it("take a caller's label instead", () => {
    render(withIcons(<StyledDeleteButton>Remove note</StyledDeleteButton>));
    expect(screen.getByRole("button", { name: /remove note/i })).toBeInTheDocument();
  });

  it("draw the icon the host registered for their intent", () => {
    render(withIcons(<StyledDeleteButton />));
    expect(screen.getByTestId("trash")).toBeInTheDocument();
  });

  it("let a call site override the registered icon", () => {
    render(withIcons(<StyledDeleteButton icon={<svg data-testid="custom" />} />));
    expect(screen.getByTestId("custom")).toBeInTheDocument();
    expect(screen.queryByTestId("trash")).not.toBeInTheDocument();
  });

  it("render without an icon rather than throwing when the intent is unregistered", () => {
    // A host that forgot to register `add` should get a working button, not a
    // crashed page. Silence is why `missingIntentIcons` exists.
    render(withIcons(<StyledAddButton />));
    expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
  });

  it("pass clicks through", async () => {
    const onClick = jest.fn();
    render(withIcons(<StyledSaveButton onClick={onClick} />));
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("name their own loading state", () => {
    render(withIcons(<StyledSaveButton loading />));
    expect(screen.getByText("Saving")).toBeInTheDocument();
  });

  describe("compact density", () => {
    it("hides the label", () => {
      render(withIcons(<StyledDeleteButton />, "compact"));
      expect(screen.queryByText("Delete")).not.toBeInTheDocument();
      expect(screen.getByTestId("trash")).toBeInTheDocument();
    });

    it("KEEPS the accessible name once the label is hidden", () => {
      // The regression this guards is nasty because it is conditional: at
      // `normal` the button reads "Delete", and for the user who chose
      // `compact` it announced as "button". It passes review and fails in use.
      render(withIcons(<StyledDeleteButton />, "compact"));
      expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
    });

    it("uses the caller's label as the name, not the intent default", () => {
      render(withIcons(<StyledDeleteButton>Remove note</StyledDeleteButton>, "compact"));
      expect(screen.getByRole("button", { name: "Remove note" })).toBeInTheDocument();
    });

    it("falls back to the intent label when the child is not a string", () => {
      // A node child cannot be flattened reliably; the alternative is
      // "[object Object]" in aria-label.
      render(withIcons(<StyledDeleteButton><em>Gone</em></StyledDeleteButton>, "compact"));
      expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
    });

    it("lets an explicit aria-label win", () => {
      render(
        withIcons(<StyledDeleteButton aria-label="Delete this note permanently" />, "compact"),
      );
      expect(
        screen.getByRole("button", { name: "Delete this note permanently" }),
      ).toBeInTheDocument();
    });
  });

  describe("iconOnly overrides density", () => {
    it("forces icon-only at normal density", () => {
      render(withIcons(<StyledDeleteButton iconOnly />, "normal"));
      expect(screen.queryByText("Delete")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
    });

    it("forces the label on at compact density", () => {
      render(withIcons(<StyledDeleteButton iconOnly={false} />, "compact"));
      expect(screen.getByText("Delete")).toBeInTheDocument();
    });
  });

  describe("the registry", () => {
    it("reports which intents a host has not registered", () => {
      const missing = missingIntentIcons({ delete: trash, save: disk });
      expect(missing).not.toContain("delete");
      expect(missing).not.toContain("save");
      expect(missing.length).toBe(ICON_INTENTS.length - 2);
    });

    it("names intents by what the button does, never by the glyph", () => {
      // `delete`, not `trash` — a host mapping delete to a broom is free to.
      for (const intent of ICON_INTENTS) {
        expect(intent).not.toMatch(/icon|glyph|svg/i);
      }
    });
  });
});
