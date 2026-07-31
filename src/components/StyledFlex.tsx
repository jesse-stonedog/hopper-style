import { styled, type HTMLStyledProps } from "styled-system/jsx";

export const StyledFlex = styled("div", {
  base: {
    display: "flex",
  },
});

export type StyledFlexProps = HTMLStyledProps<typeof StyledFlex>;

StyledFlex.displayName = "StyledFlex";

export default StyledFlex;
