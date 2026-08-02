import React from "react";
import StyledInputSelect from "./StyledInputSelect";
import StyledInputText from "./StyledInputText";
import StyledSearch from "./StyledSearch";

/** Mount targets for StyledInputSelect.ct.tsx — see the note in the spec. */

const OPTIONS = [
  { value: "wa", label: "Washington" },
  { value: "or", label: "Oregon" },
  { value: "de", label: "Delaware" },
];

/** A select directly above a text input, both at default variant. */
export function SelectBesideInput() {
  return (
    <div style={{ width: "100%" }}>
      <StyledInputSelect options={OPTIONS} placeholder="Pick a state" data-testid="select" />
      <StyledInputText data-testid="text" placeholder="Or type one" />
    </div>
  );
}

/** A select with an option long enough to test overflow. */
export function LongOptionSelect() {
  return (
    <div style={{ width: "100%" }}>
      <StyledInputSelect
        data-testid="select"
        options={[
          {
            value: "long",
            label:
              "Washington Secretary of State Nonprofit Corporation Annual Report",
          },
        ]}
      />
    </div>
  );
}

/** A controlled search box. */
export function SearchHarness() {
  const [search, setSearch] = React.useState("");
  return <StyledSearch search={search} onSearchChange={setSearch} label="Search obligations" />;
}
