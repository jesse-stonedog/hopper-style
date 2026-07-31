import { defineSlotRecipe } from "@pandacss/dev";

export const listRecipe = defineSlotRecipe({
  className: "list",
  slots: ["root", "item"],
  description: "A recipe for lists with various styles",
  base: {
    root: {
      display: "flex",
      flexDirection: "column",
    },
    item: {
      width: "full",
      padding: "4", // Default padding for list items
    },
  },
  variants: {
    variant: {
      solid: {
        root: {
          bg: "boxBgPrimary",
          borderWidth: "1px",
          borderColor: "borderBgPrimary",
          borderRadius: "lg",
        },
        item: {
          borderBottomWidth: "1px",
          borderColor: "borderBgSecondary",
          _last: {
            borderBottom: "none",
          },
        },
      },
      outline: {
        root: {
          borderWidth: "1px",
          borderColor: "borderBgPrimary",
          borderRadius: "lg",
        },
        item: {
          borderBottomWidth: "1px",
          borderColor: "borderBgSecondary",
          _last: {
            borderBottom: "none",
          },
        },
      },
      lines: {
        item: {
          borderBottomWidth: "1px",
          borderColor: "borderBgSecondary",
          _last: {
            borderBottom: "none",
          },
        },
      },
      aurora: {
        root: {
          position: "relative",
          overflow: "hidden",
          px: { base: 6, md: 8 },
          py: { base: 2, md: 4 },
          border: "1px solid",
          backgroundImage: "linear-gradient(to right, #ff7e5f, #feb47b)",
          color: "textPrimary",
          borderColor: "borderBgSecondary",
          _before: {
            content: '""',
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "250%",
            height: "250%",
            zIndex: -1,
            background:
              "conic-gradient(from 180deg at 50% 50%, #ff006e, #8338ec, #3a86ff, #ff006e)",
            filter: "blur(80px)",
            animation: "rotateGradient 8s linear infinite",
          },
        },
        item: {
          borderBottom: "1px solid",
          borderColor: "whiteAlpha.300",
          _last: {
            borderBottom: "none",
          },
        },
      },
      glass: {
        root: {
          backdropFilter: "blur(10px)",
          bg: "rgba(255, 255, 255, 0.05)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "lg",
        },
        item: {
          borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
          _last: {
            borderBottom: "none",
          },
        },
      },
      matte: {
        root: {
          bgGradient: "linear(to-b, gray.800, gray.900)",
          borderColor: "gray.700",
          borderWidth: "1px",
          borderRadius: "lg",
        },
        item: {
          borderBottom: "1px solid",
          borderColor: "gray.700",
          _last: {
            borderBottom: "none",
          },
        },
      },
      ghost: {
        item: {
          color: "textSecondary",
          bg: "buttonBgSecondary",
          borderRadius: "md",
          cursor: "pointer",
          _hover: {
            bg: "boxBgAccent",
          },
        },
      },
      none: {
        // Keeps base padding but removes borders and backgrounds
        item: {
          border: "none",
        },
      },
      unstyled: {
        root: {
          p: "0",
          m: "0",
          listStyle: "none",
        },
        item: {
          p: "0",
          m: "0",
          border: "none",
        },
      },
    },
  },
});
