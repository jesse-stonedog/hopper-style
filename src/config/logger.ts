/**
 * The logging seam.
 *
 * The components this package was extracted from called `hopper-logger`
 * directly — a private package, and the single biggest reason the library could
 * not be shared. Rather than swap one hard dependency for another, the library
 * logs through an interface that **does nothing by default**.
 *
 * Silence is the right default for a UI library: a component rendering a few
 * hundred times a second must not decide on the host's behalf that its console
 * should fill up. A host that wants the traces calls `setStyleLogger` once at
 * startup — HopperGuard passes `hopper-logger`'s `log` straight in, since the
 * shape matches.
 */

export interface StyleLogger {
  trace(message: string, meta?: unknown): void;
  debug(message: string, meta?: unknown): void;
  info(message: string, meta?: unknown): void;
  warn(message: string, meta?: unknown): void;
  error(message: string, meta?: unknown): void;
}

const noop = () => {};

const NOOP_LOGGER: StyleLogger = {
  trace: noop,
  debug: noop,
  info: noop,
  warn: noop,
  error: noop,
};

let current: StyleLogger = NOOP_LOGGER;

/**
 * Route this library's logging into the host's logger.
 *
 * Call once, before rendering. Passing `null` restores silence, which is what
 * test teardown wants.
 */
export function setStyleLogger(logger: StyleLogger | null): void {
  current = logger ?? NOOP_LOGGER;
}

/**
 * The library's logger.
 *
 * Deliberately a getter-backed object rather than the bare `current` reference:
 * modules capture `log` at import time, so handing out the value directly would
 * freeze whichever logger happened to be installed first — and in practice that
 * is always the no-op, making `setStyleLogger` appear to do nothing.
 */
export const log: StyleLogger = {
  trace: (message, meta) => current.trace(message, meta),
  debug: (message, meta) => current.debug(message, meta),
  info: (message, meta) => current.info(message, meta),
  warn: (message, meta) => current.warn(message, meta),
  error: (message, meta) => current.error(message, meta),
};
