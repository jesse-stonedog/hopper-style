import { styled } from "styled-system/jsx";
import type { HTMLStyledProps } from "styled-system/types";

const PandaGridItem = styled("div", {
  base: {
    gridColumn: "auto",
    gridRow: "auto",
    minWidth: 0,
    minHeight: 0,
  },
});

export type StyledGridItemProps = HTMLStyledProps<"div">;

const StyledGridItem = PandaGridItem;

StyledGridItem.displayName = "StyledGridItem";

export default StyledGridItem;
