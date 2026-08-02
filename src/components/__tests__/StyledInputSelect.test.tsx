import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import StyledInputSelect from "../StyledInputSelect";
import StyledSearch from "../StyledSearch";
import { HopperStyleProvider } from "../../config/style-config";

const OPTIONS = [
  { value: "wa", label: "Washington" },
  { value: "or", label: "Oregon" },
  { value: "de", label: "Delaware" },
];

describe("StyledInputSelect", () => {
  it("renders a real select, not a div pretending to be one", () => {
    // The whole design decision in one assertion. A native control brings
    // type-ahead, Home/End, "3 of 12" announcements and the OS picker on a
    // phone — none of which a custom listbox gets for free.
    render(<StyledInputSelect options={OPTIONS} data-testid="s" />);
    expect(screen.getByTestId("s").tagName).toBe("SELECT");
  });

  it("renders an option per entry", () => {
    render(<StyledInputSelect options={OPTIONS} />);
    expect(screen.getAllByRole("option")).toHaveLength(3);
    expect(screen.getByRole("option", { name: "Oregon" })).toBeInTheDocument();
  });

  it("marks a disabled option disabled", () => {
    render(
      <StyledInputSelect options={[{ value: "x", label: "Gone", disabled: true }]} />,
    );
    expect(screen.getByRole("option", { name: "Gone" })).toBeDisabled();
  });

  it("accepts option children, for optgroup", () => {
    // Deliberately not modelled as a prop — nesting is what optgroup is.
    render(
      <StyledInputSelect data-testid="s">
        <optgroup label="West">
          <option value="wa">Washington</option>
        </optgroup>
      </StyledInputSelect>,
    );
    expect(screen.getByRole("group", { name: "West" })).toBeInTheDocument();
  });

  it("renders both the list and any children", () => {
    render(
      <StyledInputSelect options={OPTIONS}>
        <option value="other">Somewhere else</option>
      </StyledInputSelect>,
    );
    expect(screen.getAllByRole("option")).toHaveLength(4);
  });

  describe("placeholder", () => {
    it("is absent unless asked for", () => {
      render(<StyledInputSelect options={OPTIONS} />);
      expect(screen.getAllByRole("option")).toHaveLength(3);
    });

    it("leads the list when given", () => {
      render(<StyledInputSelect options={OPTIONS} placeholder="Pick a state" />);
      expect(screen.getAllByRole("option")[0]).toHaveTextContent("Pick a state");
    });

    it("carries an empty value, so `required` rejects it", () => {
      // The point of naming the empty state rather than letting the first real
      // option be silently pre-selected — a user who never touched the control
      // must not appear to have chosen Washington.
      render(<StyledInputSelect options={OPTIONS} placeholder="Pick a state" required />);
      expect(screen.getAllByRole("option")[0]).toHaveValue("");
    });
  });

  it("reports changes", () => {
    const onChange = jest.fn();
    render(
      <StyledInputSelect options={OPTIONS} onChange={onChange} data-testid="s" />,
    );
    fireEvent.change(screen.getByTestId("s"), { target: { value: "or" } });
    expect(onChange).toHaveBeenCalled();
  });

  it("submits by name, with no JavaScript involved", () => {
    // Why native matters for maximus: its forms are server actions. A custom
    // dropdown would need a hidden mirror input whose only job is to undo the
    // decision to be custom.
    render(
      <StyledInputSelect
        options={OPTIONS}
        name="jurisdiction"
        defaultValue="de"
        data-testid="s"
      />,
    );
    const el = screen.getByTestId("s") as HTMLSelectElement;
    expect(el.name).toBe("jurisdiction");
    expect(el.value).toBe("de");
  });

  it("forwards a ref to the select", () => {
    const ref = React.createRef<HTMLSelectElement>();
    render(<StyledInputSelect options={OPTIONS} ref={ref} />);
    expect(ref.current?.tagName).toBe("SELECT");
  });

  it("passes disabled through", () => {
    render(<StyledInputSelect options={OPTIONS} disabled data-testid="s" />);
    expect(screen.getByTestId("s")).toBeDisabled();
  });

  describe("variant resolution", () => {
    const classOf = (ui: React.ReactElement) =>
      (render(ui).container.querySelector("select") as HTMLElement).className;

    it("keeps ghost, which the recipe defines but no user selects app-wide", () => {
      expect(classOf(<StyledInputSelect variant="ghost" />)).not.toBe(
        classOf(<StyledInputSelect variant="solid" />),
      );
    });

    it("inherits the app-wide variant", () => {
      const { container } = render(
        <HopperStyleProvider variant="matte">
          <StyledInputSelect />
        </HopperStyleProvider>,
      );
      expect((container.querySelector("select") as HTMLElement).className).toBe(
        classOf(<StyledInputSelect variant="matte" />),
      );
    });
  });
});

describe("StyledSearch", () => {
  it("is type=search, which is not cosmetic", () => {
    // Brings the browser's clear button, the keyboard's search action key, and
    // the right role for assistive tech.
    render(<StyledSearch search="" onSearchChange={() => {}} />);
    expect(screen.getByRole("searchbox")).toBeInTheDocument();
  });

  it("shows the current query", () => {
    render(<StyledSearch search="annual report" onSearchChange={() => {}} />);
    expect(screen.getByRole("searchbox")).toHaveValue("annual report");
  });

  it("reports the new query as a string", () => {
    const onSearchChange = jest.fn();
    render(<StyledSearch search="" onSearchChange={onSearchChange} />);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "wa" } });
    expect(onSearchChange).toHaveBeenCalledWith("wa");
  });

  it("falls back to the placeholder for its accessible name", () => {
    render(<StyledSearch search="" onSearchChange={() => {}} />);
    expect(screen.getByRole("searchbox", { name: "Search..." })).toBeInTheDocument();
  });

  it("takes a real label, which survives the user typing", () => {
    // A field named only by its placeholder has no name once there is a value
    // in it — the placeholder is gone and so is the name.
    render(
      <StyledSearch search="wa" onSearchChange={() => {}} label="Search obligations" />,
    );
    expect(
      screen.getByRole("searchbox", { name: "Search obligations" }),
    ).toBeInTheDocument();
  });

  it("forwards keydown, for submit-on-enter", () => {
    const onKeyDown = jest.fn();
    render(<StyledSearch search="" onSearchChange={() => {}} onKeyDown={onKeyDown} />);
    fireEvent.keyDown(screen.getByRole("searchbox"), { key: "Enter" });
    expect(onKeyDown).toHaveBeenCalled();
  });

  it("renders no microphone without an adapter", () => {
    render(<StyledSearch search="" onSearchChange={() => {}} />);
    expect(screen.queryByTestId("dictation-mic")).toBeNull();
  });

  it("renders one when given", () => {
    render(
      <HopperStyleProvider icons={{ dictate: <svg /> }}>
        <StyledSearch
          search=""
          onSearchChange={() => {}}
          dictation={{ isSupported: true, isListening: false, onMicClick: jest.fn() }}
        />
      </HopperStyleProvider>,
    );
    expect(screen.getByTestId("dictation-mic")).toBeInTheDocument();
  });
});
