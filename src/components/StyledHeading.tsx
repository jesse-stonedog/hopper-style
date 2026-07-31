import React from "react";
import StyledSeparator from "./StyledSeparator";
import StyledText from "./StyledText";
import { useFontSizeProfile } from "../config/style-config";
import { stepUpFontSize } from "../config/font-size";
import type { FontSizeKey } from "../config/types";
import type { HTMLStyledProps } from "styled-system/jsx";

type SizeKey = FontSizeKey;

type StyledHeadingProps = HTMLStyledProps<"h1"> & {
  addSeparator?: boolean;
  size?: SizeKey;
  as?: React.ElementType;
  fixedSize?: boolean;
  color?: string;
  ellipsis?: boolean;
  wrap?: boolean;
};

const StyledHeading = React.forwardRef<HTMLElement, StyledHeadingProps>(
  (
    {
      children,
      addSeparator,
      size,
      as = "h1",
      fixedSize,
      color,
      ellipsis = false,
      wrap = true,
      ...rest
    },
    ref,
  ) => {
    const fontSizeProfile = useFontSizeProfile();
    let baseSize: SizeKey;
    if (size) {
      baseSize = size;
    } else if (fixedSize) {
      baseSize = "md";
    } else {
      baseSize = fontSizeProfile;
    }

    // A heading reads one tier above whatever body text is currently set to,
    // so the hierarchy survives every font-size profile rather than only the
    // default one. Clamped at the top of the scale by stepUpFontSize.
    const headingSize = stepUpFontSize(baseSize);

    return (
      <>
        <StyledText
          as={as}
          ref={ref}
          size={headingSize}
          fontWeight="bold"
          fixedSize={fixedSize}
          color={color}
          ellipsis={ellipsis}
          wrap={wrap}
          {...rest}
        >
          {children}
        </StyledText>
        {addSeparator && <StyledSeparator />}
      </>
    );
  },
);

StyledHeading.displayName = "StyledHeading";
export default StyledHeading;
