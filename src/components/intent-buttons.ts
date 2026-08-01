/**
 * The intent buttons.
 *
 * One line each, because that is genuinely all they are: a `StyledButton` that
 * knows its icon, its label and its loading text. The behaviour lives in
 * `createIntentButton`; this file is the vocabulary.
 *
 * `loadText` is set only where the action takes long enough to show a spinner
 * and where naming it helps — "Saving" tells the user more than "Loading".
 *
 * Not every wrapper in the originating app belongs here. Ones that call an API,
 * read a feature flag or drive app state (`StyledColorButton`,
 * `StyledDensityButton`, `StyledThemeButton`, `StyledVariantButton`,
 * `StyledStyleResetButton`, `StyledHelpButton`, `StyledCopyButton`) are
 * application components that happen to be buttons, and they stay in the app.
 */
import { createIntentButton } from "./create-intent-button";

export const StyledAddButton = createIntentButton({
  displayName: "StyledAddButton",
  intent: "add",
  defaultLabel: "Add",
});

export const StyledSaveButton = createIntentButton({
  displayName: "StyledSaveButton",
  intent: "save",
  defaultLabel: "Save",
  loadText: "Saving",
});

export const StyledDeleteButton = createIntentButton({
  displayName: "StyledDeleteButton",
  intent: "delete",
  defaultLabel: "Delete",
  loadText: "Deleting",
});

export const StyledEditButton = createIntentButton({
  displayName: "StyledEditButton",
  intent: "edit",
  defaultLabel: "Edit",
});

export const StyledCancelButton = createIntentButton({
  displayName: "StyledCancelButton",
  intent: "cancel",
  defaultLabel: "Cancel",
});

export const StyledCloneButton = createIntentButton({
  displayName: "StyledCloneButton",
  intent: "clone",
  defaultLabel: "Clone",
});

export const StyledBackButton = createIntentButton({
  displayName: "StyledBackButton",
  intent: "back",
  defaultLabel: "Back",
});

export const StyledNextButton = createIntentButton({
  displayName: "StyledNextButton",
  intent: "next",
  defaultLabel: "Next",
});

export const StyledNewButton = createIntentButton({
  displayName: "StyledNewButton",
  intent: "new",
  defaultLabel: "New",
});

export const StyledRenameButton = createIntentButton({
  displayName: "StyledRenameButton",
  intent: "rename",
  defaultLabel: "Rename",
});

export const StyledLoadButton = createIntentButton({
  displayName: "StyledLoadButton",
  intent: "load",
  defaultLabel: "Load",
  loadText: "Loading",
});

export const StyledResumeButton = createIntentButton({
  displayName: "StyledResumeButton",
  intent: "resume",
  defaultLabel: "Resume",
});

export const StyledPlayButton = createIntentButton({
  displayName: "StyledPlayButton",
  intent: "play",
  defaultLabel: "Play",
});

export const StyledFavoriteButton = createIntentButton({
  displayName: "StyledFavoriteButton",
  intent: "favorite",
  defaultLabel: "Favorite",
});

export const StyledSettingsButton = createIntentButton({
  displayName: "StyledSettingsButton",
  intent: "settings",
  defaultLabel: "Settings",
});

export const StyledHomeButton = createIntentButton({
  displayName: "StyledHomeButton",
  intent: "home",
  defaultLabel: "Home",
});

export const StyledMenuButton = createIntentButton({
  displayName: "StyledMenuButton",
  intent: "menu",
  defaultLabel: "Menu",
});

export const StyledAnalyticsButton = createIntentButton({
  displayName: "StyledAnalyticsButton",
  intent: "analytics",
  defaultLabel: "Analytics",
});

export const StyledEmojiButton = createIntentButton({
  displayName: "StyledEmojiButton",
  intent: "emoji",
  defaultLabel: "Emoji",
});

export const StyledUrlButton = createIntentButton({
  displayName: "StyledUrlButton",
  intent: "url",
  defaultLabel: "From URL",
});
