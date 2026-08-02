/**
 * The dictation seam.
 *
 * `StyledInputText` and `StyledInputTextArea` can render a microphone, but this
 * package contains no speech code and never will. Recognition is a product
 * decision with product consequences — which engine, whether audio may leave
 * the device, what a regulated deployment is allowed to send where — and none
 * of that belongs in a component library.
 *
 * So the host builds the behaviour and hands it over as one object. The input
 * owns the *presentation*: where the button sits, how much padding the text
 * needs so it does not run underneath, what it is called, what it announces
 * while recording. The host owns everything else.
 *
 * HopperGuard's `useDictation()` already returns this shape, so its call sites
 * pass the hook's result straight through. That is the intended fit: an adapter
 * that needs a translation layer is usually a sign the seam is in the wrong
 * place.
 *
 * ## Why an object rather than a set of props
 *
 * These fields are meaningless apart — `showRedo` with no `redo`, `isListening`
 * on an input with no `onMicClick` — and passing one bundle makes the
 * all-or-nothing nature obvious at the call site. It also means adding a
 * capability later does not widen the component's prop surface.
 *
 * ## What the input does NOT do
 *
 * It does not decide whether dictation is *appropriate*. A password field, a
 * PIN, a card number — the host omits the adapter, and no mic renders. Putting
 * that judgement here would mean guessing from `type`, which is exactly the
 * kind of guess that puts a microphone on a field that should never have one.
 *
 * Errors are the host's too. They arrive asynchronously and belong wherever
 * that product shows problems — a toast, an inline message, a live region —
 * which the input cannot know.
 */
export interface Dictation {
  /**
   * Whether this browser/engine can dictate at all. `false` renders no mic —
   * a control that cannot work is worse than an absent one, because the user
   * has to press it to find out.
   */
  isSupported: boolean;
  /** Recording now. Drives `aria-pressed` and the recording colour. */
  isListening: boolean;
  /** Offer "record again" — typically after a result the user may reject. */
  showRedo?: boolean;
  /** Start or stop recording. */
  onMicClick: () => void;
  /** Discard the last result and record again. Required when `showRedo`. */
  redo?: () => void;

  /**
   * Ask what a new recording should do to text that is already there.
   *
   * Only meaningful for multi-entry fields, where prose is written in passes.
   * Overwriting someone's paragraph because they pressed the mic a second time
   * is a data-loss bug, not a UX preference — so when the host raises this, the
   * field stops and asks instead of guessing.
   *
   * Requires `chooseContinue` and `chooseStartOver`. While it is raised the
   * redo button is suppressed: three competing choices about the same text is
   * not a decision anyone can make quickly.
   */
  continuePrompt?: boolean;
  /** Append the new recording to what is already there. */
  chooseContinue?: () => void;
  /** Replace what is already there. */
  chooseStartOver?: () => void;
}
