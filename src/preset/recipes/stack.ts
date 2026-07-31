import { defineRecipe } from '@pandacss/dev'

export const stackRecipe = defineRecipe({
  className: 'stack',
  base: {
    display: 'flex',
    alignItems: 'center',
  },
  variants: {
    direction: {
      row: {
        flexDirection: 'row',
      },
      column: {
        flexDirection: 'column',
      },
    },
    justify: {
      start: {
        justifyContent: 'flex-start',
      },
      center: {
        justifyContent: 'center',
      },
      end: {
        justifyContent: 'flex-end',
      },
      between: {
        justifyContent: 'space-between',
      },
    },
    gap: {
      '0': { gap: '0' },
      '1': { gap: '1' },
      '2': { gap: '2' },
      '3': { gap: '3' },
      '4': { gap: '4' },
      '5': { gap: '5' },
      '6': { gap: '6' },
    },
    variant: {
        solid: {
            bg: "textPrimary",
            color: "textPrimary",
            borderColor: "borderBgPrimary",
        },
        outline: {
            borderColor: "borderBgSecondary",
            color: "textPrimary",
            _hover: {
            bg: "textPrimary",
            },
        },
        aurora: {
            backgroundImage: `linear-gradient(to right, "textPrimary", "secondary")`,
            color: "textPrimary",
            borderColor: "transparent",
        },
        glass: {
            backdropFilter: "blur(10px)",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            color: "textPrimary",
        },
        matte: {
            bg: "secondary",
            color: "textPrimary",
            borderColor: "borderBgPrimary",
        },
        ghost: {
            bg: "secondary",
            border: "none",
        },
        none: {
            border: "none",
            backgroundColor: "inherit",
        },
        unstyled: {
            border: "none",
            p: "0",
            m: "0",
            backgroundColor: "inherit",
        },
    }
  },
})
