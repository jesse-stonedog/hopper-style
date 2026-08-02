"use client";

import React from "react";
import StyledBox from "./StyledBox";
import StyledInputText from "./StyledInputText";
import type { Dictation } from "./dictation";

/**
 * A search box.
 *
 * Thin on purpose: a `StyledInputText` of `type="search"` at a width that steps
 * up with the viewport. The width is the only thing here worth sharing — a
 * search field that spans a wide screen is harder to use, not easier, because
 * the eye has to travel from the field to results that start back at the left.
 *
 * `type="search"` is not cosmetic. It gives the browser's own clear button, the
 * right on-screen keyboard with a "search" action key, and the correct role for
 * assistive tech.
 *
 * **It does not filter anything.** It owns a string and reports changes; what
 * that string means belongs to the screen. The originating component took a
 * `data` prop it never read, marked "for future filtering" — that is the shape
 * this deliberately does not have.
 */

export interface StyledSearchProps {
  /** Current query. Controlled. */
  search: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  /**
   * Accessible name. Defaults to the placeholder — but a field whose only name
   * is placeholder text has no name once the user types, so pass one.
   */
  label?: string;
  /** Host-supplied dictation. Omit for no microphone. */
  dictation?: Dictation;
  ["data-testid"]?: string;
}

const StyledSearch = React.forwardRef<HTMLInputElement, StyledSearchProps>(
  function StyledSearch(
    {
      search,
      onSearchChange,
      placeholder = "Search...",
      onKeyDown,
      label,
      dictation,
      ...props
    },
    ref,
  ) {
    return (
      <StyledBox
        w={{ base: "300px", md: "400px", lg: "500px" }}
        data-testid="search-container"
      >
        <StyledInputText
          ref={ref}
          type="search"
          data-testid={props["data-testid"] ?? "search-input"}
          aria-label={label ?? placeholder}
          placeholder={placeholder}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={onKeyDown}
          {...(dictation ? { dictation } : {})}
        />
      </StyledBox>
    );
  },
);

StyledSearch.displayName = "StyledSearch";

export default StyledSearch;
