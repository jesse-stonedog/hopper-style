import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import StyledInputRadio from "../StyledInputRadio";

const ITEMS = [
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

describe("StyledInputRadio", () => {
  it("renders a radio per item", () => {
    render(<StyledInputRadio items={ITEMS} name="cycle" label="Billing cycle" />);
    expect(screen.getAllByRole("radio")).toHaveLength(2);
  });

  it("is announced as a named group", () => {
    // The gap this migration closed. A shared `name` makes the browser treat
    // them as one group for arrow keys, so it worked — but nothing said what
    // the choice was ABOUT, so a screen reader met loose radios.
    render(<StyledInputRadio items={ITEMS} name="cycle" label="Billing cycle" />);
    expect(screen.getByRole("radiogroup", { name: "Billing cycle" })).toBeInTheDocument();
  });

  it("still forms a group without a label, just an unnamed one", () => {
    render(<StyledInputRadio items={ITEMS} name="cycle" />);
    const group = screen.getByRole("radiogroup");
    expect(group).toBeInTheDocument();
    expect(group).not.toHaveAttribute("aria-label");
  });

  it("takes aria-labelledby when a visible heading already says it", () => {
    render(
      <>
        <h2 id="h">Billing cycle</h2>
        <StyledInputRadio items={ITEMS} name="cycle" aria-labelledby="h" />
      </>,
    );
    expect(screen.getByRole("radiogroup", { name: "Billing cycle" })).toBeInTheDocument();
  });

  it("labels each radio from its item", () => {
    // `renderItem` used to be required and every call site passed the identity
    // function. The item already carries a label.
    render(<StyledInputRadio items={ITEMS} name="cycle" label="Billing cycle" />);
    expect(screen.getByRole("radio", { name: "Monthly" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Yearly" })).toBeInTheDocument();
  });

  it("uses renderItem when an option needs more than its text", () => {
    render(
      <StyledInputRadio
        items={ITEMS}
        name="cycle"
        label="Billing cycle"
        renderItem={(i) => (
          <>
            {i.label} <small>save 20%</small>
          </>
        )}
      />,
    );
    expect(screen.getByRole("radio", { name: /Monthly save 20%/ })).toBeInTheDocument();
  });

  it("reflects the selected value", () => {
    render(<StyledInputRadio items={ITEMS} name="cycle" value="yearly" label="C" />);
    expect(screen.getByRole("radio", { name: "Yearly" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Monthly" })).not.toBeChecked();
  });

  it("reports a change with the chosen value", () => {
    const onChange = jest.fn();
    render(
      <StyledInputRadio items={ITEMS} name="cycle" value="monthly" onChange={onChange} label="C" />,
    );
    fireEvent.click(screen.getByRole("radio", { name: "Yearly" }));
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[0][0].target.value).toBe("yearly");
  });

  it("is operable by clicking the label text", () => {
    const onChange = jest.fn();
    render(
      <StyledInputRadio items={ITEMS} name="cycle" value="monthly" onChange={onChange} label="C" />,
    );
    fireEvent.click(screen.getByText("Yearly"));
    expect(onChange).toHaveBeenCalled();
  });

  it("disables an individual option", () => {
    render(
      <StyledInputRadio
        items={[ITEMS[0]!, { ...ITEMS[1]!, disabled: true }]}
        name="cycle"
        label="C"
      />,
    );
    expect(screen.getByRole("radio", { name: "Yearly" })).toBeDisabled();
    expect(screen.getByRole("radio", { name: "Monthly" })).toBeEnabled();
  });

  it("gives every input a distinct id, even for duplicate values", () => {
    // Ids are built from value + index. A value can be anything, including
    // whitespace or a repeat, and two inputs sharing an id would silently
    // break every label association after the first.
    const { container } = render(
      <StyledInputRadio
        items={[
          { value: "a b", label: "One" },
          { value: "a b", label: "Two" },
        ]}
        name="dupe"
        label="C"
      />,
    );
    const ids = Array.from(container.querySelectorAll("input")).map((i) => i.id);
    expect(new Set(ids).size).toBe(2);
    expect(ids.some((i) => /\s/.test(i))).toBe(false);
  });

  it("forwards a ref to the group, not to one of the radios", () => {
    // It used to be assigned inside the item loop, so each item overwrote the
    // last and a caller got the FINAL radio — reliably the wrong element.
    const ref = React.createRef<HTMLDivElement>();
    render(<StyledInputRadio items={ITEMS} name="cycle" label="C" ref={ref} />);
    expect(ref.current?.getAttribute("role")).toBe("radiogroup");
  });

  it("puts no wrapper between the group and its radios", () => {
    // A radiogroup whose children are not its radios is the shape assistive
    // tech mis-reports. StyledBox would have added one.
    const { container } = render(
      <StyledInputRadio items={ITEMS} name="cycle" label="C" />,
    );
    const group = container.querySelector("[role=radiogroup]")!;
    expect(Array.from(group.children).every((c) => c.tagName === "LABEL")).toBe(true);
  });

  describe("variant resolution", () => {
    const classOf = (ui: React.ReactElement) =>
      (render(ui).container.querySelector("[role=radiogroup]") as HTMLElement).className;

    it("keeps ghost, which the recipe defines but no user selects app-wide", () => {
      expect(classOf(<StyledInputRadio items={ITEMS} variant="ghost" />)).not.toBe(
        classOf(<StyledInputRadio items={ITEMS} variant="solid" />),
      );
    });
  });
});
