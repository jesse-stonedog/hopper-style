import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StyledFooter from "../StyledFooter";

/**
 * The prop contract and the disclosure behaviour (NEH-394).
 *
 * SCOPE: everything here is structural — what is rendered, what is announced,
 * what is unmounted. The *layout* claims (the legend sits on its own line
 * beneath the copyright; the actions stay reachable on the collapsed bar) are
 * unanswerable in jsdom, which has no layout engine and reports a zero-sized
 * box for every element. Those live in `StyledFooter.ct.tsx`.
 */
describe("StyledFooter", () => {
  const base = { copyright: "© 2026 Example L.L.C. All rights reserved." };

  describe("the always-visible bar", () => {
    it("renders the copyright it is given, and nothing product-specific", () => {
      render(<StyledFooter {...base} />);
      expect(screen.getByTestId("footer-copyright")).toHaveTextContent(
        "© 2026 Example L.L.C. All rights reserved.",
      );
      // The component must not smuggle in a brand of its own.
      expect(screen.getByTestId("styled-footer").textContent).not.toMatch(
        /HopperGuard|ElderLink|rozcards|Optima/i,
      );
    });

    it("omits the legend entirely when there is none", () => {
      // Optima cannot assert a trademark it has not cleared, so "no legend"
      // has to be a real state rather than an empty line.
      render(<StyledFooter {...base} />);
      expect(screen.queryByTestId("footer-legend")).not.toBeInTheDocument();
    });

    it("renders the legend when given", () => {
      render(<StyledFooter {...base} legend="X and Y are trademarks of Z." />);
      expect(screen.getByTestId("footer-legend")).toHaveTextContent(
        "X and Y are trademarks of Z.",
      );
    });

    it("renders the caller's actions, whatever they are", () => {
      // The reason this component can be shared at all: it never knows what
      // the buttons do. rozcards and Optima pass exactly one.
      render(
        <StyledFooter {...base} actions={<button type="button">Dark mode</button>} />,
      );
      expect(screen.getByRole("button", { name: "Dark mode" })).toBeInTheDocument();
    });

    it("keeps the actions OUTSIDE the toggle, so pressing one cannot expand the panel", () => {
      // A bar that is itself the trigger nests a button inside a button:
      // "dark mode" would also toggle, and the nesting is invalid ARIA.
      render(
        <StyledFooter {...base} actions={<button type="button">Dark mode</button>} />,
      );
      const toggle = screen.getByTestId("footer-toggle");
      const action = screen.getByRole("button", { name: "Dark mode" });
      expect(toggle.contains(action)).toBe(false);
    });
  });

  describe("the disclosure", () => {
    it("starts closed, because the bar is the point", () => {
      render(<StyledFooter {...base} />);
      expect(screen.queryByTestId("footer-panel")).not.toBeInTheDocument();
      expect(screen.getByTestId("footer-toggle")).toHaveAttribute(
        "aria-expanded",
        "false",
      );
    });

    it("opens on click and wires aria-controls to the panel it opens", () => {
      render(<StyledFooter {...base} defaultOpen />);
      const toggle = screen.getByTestId("footer-toggle");
      const panel = screen.getByTestId("footer-panel");
      expect(toggle).toHaveAttribute("aria-expanded", "true");
      expect(toggle.getAttribute("aria-controls")).toBe(panel.getAttribute("id"));
    });

    it("toggles when uncontrolled", async () => {
      render(<StyledFooter {...base} version={{ build: "1.2.3" }} />);
      await userEvent.click(screen.getByTestId("footer-toggle"));
      expect(screen.getByTestId("footer-panel")).toBeInTheDocument();
      await userEvent.click(screen.getByTestId("footer-toggle"));
      expect(screen.queryByTestId("footer-panel")).not.toBeInTheDocument();
    });

    it("obeys the caller when controlled, and does not move on its own", async () => {
      const onOpenChange = jest.fn();
      render(<StyledFooter {...base} open={false} onOpenChange={onOpenChange} />);

      await userEvent.click(screen.getByTestId("footer-toggle"));

      // It reports intent and waits. A controlled component that also flipped
      // itself would fight the parent's state on the next render.
      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(screen.queryByTestId("footer-panel")).not.toBeInTheDocument();
    });

    it("carries a VISIBLE label, not only an accessible name", async () => {
      // An icon alone assumes the reader can decode it; aria-label serves a
      // screen reader and does nothing for someone who cannot.
      render(<StyledFooter {...base} />);
      expect(screen.getByTestId("footer-toggle")).toHaveTextContent("Details");
      await userEvent.click(screen.getByTestId("footer-toggle"));
      expect(screen.getByTestId("footer-toggle")).toHaveTextContent("Hide details");
    });

    it("takes the labels from the caller, so it can be localised", async () => {
      render(
        <StyledFooter {...base} showDetailsLabel="Mehr" hideDetailsLabel="Weniger" />,
      );
      expect(screen.getByTestId("footer-toggle")).toHaveTextContent("Mehr");
      await userEvent.click(screen.getByTestId("footer-toggle"));
      expect(screen.getByTestId("footer-toggle")).toHaveTextContent("Weniger");
    });
  });

  describe("the panel", () => {
    it("shows the version it is given", () => {
      render(
        <StyledFooter {...base} defaultOpen version={{ name: "Spring 2026", build: "1.2.3" }} />,
      );
      expect(screen.getByTestId("footer-version-name")).toHaveTextContent("Spring 2026");
      expect(screen.getByTestId("footer-version-build")).toHaveTextContent("build 1.2.3");
    });

    it("omits each version line independently", () => {
      // rozcards has a build and no release name; the panel must not render
      // "build undefined" or an empty slot for the half it lacks.
      render(<StyledFooter {...base} defaultOpen version={{ build: "1.2.3" }} />);
      expect(screen.queryByTestId("footer-version-name")).not.toBeInTheDocument();
      expect(screen.getByTestId("footer-version-build")).toHaveTextContent("build 1.2.3");
    });

    it("renders the status slot as given", () => {
      render(
        <StyledFooter {...base} defaultOpen status={<span>All systems normal</span>} />,
      );
      expect(screen.getByText("All systems normal")).toBeInTheDocument();
    });

    it("does not mount the status while closed", () => {
      // Load-bearing: a status badge that mounted behind a closed panel would
      // fetch on every page view, and a failed request logs a console error
      // that HopperGuard's post-deploy smoke treats as a failure (NEH-387).
      render(<StyledFooter {...base} status={<span data-testid="probe">x</span>} />);
      expect(screen.queryByTestId("probe")).not.toBeInTheDocument();
    });
  });
});
