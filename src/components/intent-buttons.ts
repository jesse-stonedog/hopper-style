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
  tooltip: "Add item",
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
  tooltip: "Delete the item",
});

export const StyledEditButton = createIntentButton({
  displayName: "StyledEditButton",
  intent: "edit",
  defaultLabel: "Edit",
  tooltip: "Modify this item.",
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
  tooltip: "Create a copy of the item.",
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
  tooltip: "Proceed to next step.",
});

export const StyledNewButton = createIntentButton({
  displayName: "StyledNewButton",
  intent: "new",
  defaultLabel: "New",
  tooltip: "Create a new item.",
});

export const StyledRenameButton = createIntentButton({
  displayName: "StyledRenameButton",
  intent: "rename",
  defaultLabel: "Rename",
  tooltip: "Rename the item",
});

export const StyledLoadButton = createIntentButton({
  displayName: "StyledLoadButton",
  intent: "load",
  defaultLabel: "Load",
  loadText: "Loading",
  tooltip: "Load the item",
});

export const StyledResumeButton = createIntentButton({
  displayName: "StyledResumeButton",
  intent: "resume",
  defaultLabel: "Resume",
  tooltip: "Resume activity",
});

export const StyledPlayButton = createIntentButton({
  displayName: "StyledPlayButton",
  intent: "play",
  defaultLabel: "Play",
});

// StyledFavoriteButton is deliberately absent. It is a stateful TOGGLE — its
// icon colour and its tooltip both flip on `isFavorite` ("Mark as favorite" /
// "Remove from favorites") — and the on-state colour is an app constant. That
// is a different component from "a button with a star on it", so it stays in
// the app rather than being bent into this factory.

export const StyledSettingsButton = createIntentButton({
  displayName: "StyledSettingsButton",
  intent: "settings",
  defaultLabel: "Settings",
  tooltip: "Changes settings",
});

export const StyledHomeButton = createIntentButton({
  displayName: "StyledHomeButton",
  intent: "home",
  defaultLabel: "Home",
  tooltip: "Go to main page",
});

export const StyledMenuButton = createIntentButton({
  displayName: "StyledMenuButton",
  intent: "menu",
  defaultLabel: "Menu",
  tooltip: "Open menu with additional options",
});

export const StyledAnalyticsButton = createIntentButton({
  displayName: "StyledAnalyticsButton",
  intent: "analytics",
  defaultLabel: "Analytics",
  tooltip: "View data summary",
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
  tooltip: "Retrieve colors from external location.",
});
