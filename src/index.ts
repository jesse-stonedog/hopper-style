/**
 * hopper-style — public API.
 *
 * Components are exported both as named exports and, individually, as default
 * exports from their own module. Prefer the named export; the default exports
 * exist because the originating codebase used them at ~1,400 call sites and
 * changing that was not worth bundling into the extraction.
 *
 * The Panda preset is NOT re-exported here. It is imported by the consumer's
 * `panda.config.ts`, which runs in Node at build time, and pulling the whole
 * component tree (and React with it) into that context is a needless cost —
 * hence the separate `hopper-style/preset` entry point.
 */

// ---------------------------------------------------------------------------
// Configuration seam — what a host application must wire up.
// ---------------------------------------------------------------------------
export {
  HopperStyleProvider,
  useStyleConfig,
  useFontSizeProfile,
  useIconSize,
  useResolvedVariant,
  DEFAULT_STYLE_CONFIG,
} from "./config/style-config";
export type {
  StyleConfig,
  HopperStyleProviderProps,
} from "./config/style-config";

export { setStyleLogger } from "./config/logger";
export type { StyleLogger } from "./config/logger";

export {
  fontSizeMap,
  getFontSizeLabel,
  getFontSizeValue,
  stepUpFontSize,
  FONT_SIZE_ORDER,
} from "./config/font-size";

export {
  THEME_VARIANTS,
  STYLE_VARIANTS,
  TEXT_VARIANTS,
  ALL_VARIANTS,
  FONT_SIZE_PROFILES,
  FONT_SIZE_KEYS,
  ICON_SIZES,
  isThemeVariant,
  isFontSizeProfile,
  isIconSize,
} from "./config/types";
export type {
  ThemeVariant,
  StyleVariant,
  AllowedVariant,
  AllowedTextVariant,
  FontSizeProfile,
  FontSizeKey,
  IconSize,
} from "./config/types";

// ---------------------------------------------------------------------------
// Layout primitives
// ---------------------------------------------------------------------------
export { default as StyledBox, StyledBox as Box } from "./components/StyledBox";
export type { StyledBoxProps } from "./components/StyledBox";

export { default as StyledFlex } from "./components/StyledFlex";
export type { StyledFlexProps } from "./components/StyledFlex";

export { default as StyledGrid } from "./components/StyledGrid";
export type { StyledGridProps } from "./components/StyledGrid";

export { default as StyledGridItem } from "./components/StyledGridItem";
export type { StyledGridItemProps } from "./components/StyledGridItem";

export { default as StyledSimpleGrid } from "./components/StyledSimpleGrid";

export { default as StyledStack } from "./components/StyledStack";
export type { StyledStackProps } from "./components/StyledStack";

export { default as StyledHStack } from "./components/StyledHStack";
export type { StyledHStackProps } from "./components/StyledHStack";

export { default as StyledVStack } from "./components/StyledVStack";
export type { StyledVStackProps } from "./components/StyledVStack";

export { default as StyledScrollbar } from "./components/StyledScrollbar";
export { default as StyledSidebar, StyledSidebar as Sidebar } from "./components/StyledSidebar";
export type { StyledSidebarProps, SidebarItem } from "./components/StyledSidebar";
export type { StyledScrollbarProps } from "./components/StyledScrollbar";

// ---------------------------------------------------------------------------
// Typography & dividers
// ---------------------------------------------------------------------------
export { default as StyledText } from "./components/StyledText";
export type { StyledTextProps } from "./components/StyledText";

export { default as StyledHeading } from "./components/StyledHeading";

export { default as StyledSeparator } from "./components/StyledSeparator";
export type { StyledSeparatorProps } from "./components/StyledSeparator";

export { default as StyledHrRule } from "./components/StyledHrRule";
export type { StyledHrRuleProps } from "./components/StyledHrRule";

// ---------------------------------------------------------------------------
// Icons — the seam, not the artwork. See the README.
// ---------------------------------------------------------------------------
export { default as StyledIcon } from "./components/StyledIcon";
// `IconSize` is exported above, from `config/types` — it is a config-level
// vocabulary now that `StyleConfig` names it. `StyledIcon` still re-exports it
// so the older import path keeps working for consumers.
export type { StyledIconProps } from "./components/StyledIcon";
export { createIcon, createIconFromComponent } from "./components/create-icon";

// ---------------------------------------------------------------------------
// Overlay
// ---------------------------------------------------------------------------
export * from "./components/intent-buttons";
export { createIntentButton } from "./components/create-intent-button";
export type { IntentButtonProps, IntentButtonSpec } from "./components/create-intent-button";

export {
  IntentIconProvider,
  useIntentIcon,
  useIntentIcons,
  missingIntentIcons,
  ICON_INTENTS,
} from "./config/intent-icons";
export type { IconIntent, IntentIcons } from "./config/intent-icons";

export { useDensity } from "./config/style-config";
export { DENSITY_PROFILES, isDensityProfile } from "./config/types";
export type { DensityProfile } from "./config/types";

export { default as StyledButton } from "./components/StyledButton";
export type { StyledButtonProps } from "./components/StyledButton";

export { default as StyledIconButton } from "./components/StyledIconButton";
export type { StyledIconButtonProps, IconButtonSize } from "./components/StyledIconButton";

export { default as StyledSpinner } from "./components/StyledSpinner";
export type { StyledSpinnerProps } from "./components/StyledSpinner";

export { default as StyledTooltip } from "./components/StyledTooltip";
export type { StyledTooltipProps } from "./components/StyledTooltip";

// ---------------------------------------------------------------------------
// Form controls
// ---------------------------------------------------------------------------
export { default as StyledFormLabel } from "./components/StyledFormLabel";
export type { StyledFormLabelProps } from "./components/StyledFormLabel";

export { default as StyledInputBool } from "./components/StyledInputBool";
export type { StyledInputBoolProps, InputBoolVariant } from "./components/StyledInputBool";
export { INPUT_BOOL_VARIANTS } from "./components/StyledInputBool";

export { default as StyledInputSlider } from "./components/StyledInputSlider";
export type { StyledInputSliderProps } from "./components/StyledInputSlider";

// ---------------------------------------------------------------------------
// Text inputs — dictation is supplied by the host, never implemented here
// ---------------------------------------------------------------------------
export type { Dictation } from "./components/dictation";

export { default as StyledInputText } from "./components/StyledInputText";
export type { StyledInputTextProps, InputTextVariant } from "./components/StyledInputText";
export { INPUT_TEXT_VARIANTS } from "./components/StyledInputText";

export { default as StyledInputTextArea } from "./components/StyledInputTextArea";
export type { StyledInputTextAreaProps } from "./components/StyledInputTextArea";
export { default as DictationPrompt } from "./components/DictationPrompt";
