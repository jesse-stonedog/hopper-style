"use client";

import React from "react";
import { styled } from "styled-system/jsx";
import type { HTMLStyledProps } from "styled-system/types";
import { buttonRecipe } from "styled-system/recipes";
import type { AllowedVariant } from "../config/types";
import { useStyleConfig } from "../config/style-config";
import StyledText from "./StyledText";
import StyledSpinner from "./StyledSpinner";
import StyledTooltip from "./StyledTooltip";

/**
 * The button every other button is built from.
 *
 * ## Why this does NOT use `useResolvedVariant`
 *
 * Everywhere else, `useResolvedVariant` narrows to the five *theme* variants
 * and coerces anything else to `solid`, because most recipes define only those
 * five and passing an unknown one renders an unstyled control.
 *
 * `buttonRecipe` is the exception: it defines **all ten** — the five theme
 * variants plus `ghost`, `none`, `link`, `unstyled` and `selected`. Running the
 * usual narrowing here would silently turn every ghost and link button solid,
 * which is a visible regression at a lot of call sites. So this resolves against
 * the wider `AllowedVariant` set on purpose.
 *
 * If you add a component whose recipe covers all ten, do the same and say why.
 * If it covers only five, use `useResolvedVariant`.
 */

const PandaButton = styled("button", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
});

export interface StyledButtonProps extends HTMLStyledProps<"button"> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  /** Any of the ten the button recipe defines, not just the five theme ones. */
  variant?: AllowedVariant;
  children?: React.ReactNode;
  /** Disables the button and swaps the label for a spinner. */
  loading?: boolean;
  disabled?: boolean;
  tooltip?: React.ReactNode;
  /** What the spinner says while `loading`. Prefer naming the action. */
  loadText?: React.ReactNode;
  /** Keep the label on one line even when the button is narrow. */
  noWrap?: boolean;
}

const StyledButton = React.forwardRef<HTMLButtonElement, StyledButtonProps>(
  function StyledButton(
    {
      leftIcon,
      rightIcon,
      children,
      variant,
      loading,
      disabled,
      tooltip,
      noWrap,
      loadText = "Loading",
      ...rest
    },
    ref,
  ) {
    const { variant: appVariant } = useStyleConfig();
    const effectiveVariant = variant ?? appVariant;

    // Positioning props are pulled out of the Panda prop bag and applied as
    // inline style. Panda would otherwise emit them as atomic classes, which
    // lose to the recipe's own class in the cascade — so a caller positioning a
    // button absolutely would find it ignored.
    const { top, right, position, zIndex, ...restWithoutPosition } = rest;
    const style = {
      top,
      right,
      position,
      zIndex,
      ...(noWrap ? { whiteSpace: "nowrap" as const } : {}),
      ...(rest.style || {}),
    };

    return (
      <StyledTooltip tooltip={tooltip}>
        <PandaButton
          ref={ref}
          className={buttonRecipe({ variant: effectiveVariant })}
          // A loading button must not be clickable — a second submit is the
          // classic double-charge bug — and `aria-busy` is what tells a screen
          // reader why it went inert.
          disabled={loading || disabled}
          aria-busy={loading}
          data-panda-variant={effectiveVariant}
          style={style as React.CSSProperties}
          {...restWithoutPosition}
        >
          {leftIcon && <IconSlot side="left">{leftIcon}</IconSlot>}
          {loading ? (
            <StyledSpinner loadText={loadText} />
          ) : (
            <StyledText>{children}</StyledText>
          )}
          {rightIcon && <IconSlot side="right">{rightIcon}</IconSlot>}
        </PandaButton>
      </StyledTooltip>
    );
  },
);

/**
 * Spacing for an icon beside the label.
 *
 * `em`, not `px`, so the gap tracks the button's own font size — which this
 * system changes app-wide via the font-size profile. A fixed gap looks correct
 * at `md` and wrong at both ends of the scale.
 */
const IconSlot = ({
  side,
  children,
}: {
  side: "left" | "right";
  children: React.ReactNode;
}) => (
  <span
    style={{
      [side === "left" ? "marginRight" : "marginLeft"]: "0.5em",
      display: "inline-flex",
      alignItems: "center",
    }}
  >
    {children}
  </span>
);

StyledButton.displayName = "StyledButton";

export default StyledButton;
export { StyledButton };
