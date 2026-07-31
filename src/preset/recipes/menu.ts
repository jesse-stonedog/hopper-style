import { defineSlotRecipe } from "@pandacss/dev";

export const menuRecipe = defineSlotRecipe({
  className: "menu",
  description: "Styles for the Menu component",
  slots: ["item"],
  base: {
    item: {
      w: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
      gap: 3,
      px: 4,
      py: 2,
      borderRadius: "md",
      cursor: "pointer",
      _hover: {
        backgroundColor: "boxBgAccent",
      },
      _dark: {
        _hover: {
          backgroundColor: "gray.800",
        },
      },
    },
  },
});
