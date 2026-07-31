import { log, setStyleLogger, type StyleLogger } from "../logger";

function makeSpyLogger(): StyleLogger & { calls: string[] } {
  const calls: string[] = [];
  return {
    calls,
    trace: (m) => calls.push(`trace:${m}`),
    debug: (m) => calls.push(`debug:${m}`),
    info: (m) => calls.push(`info:${m}`),
    warn: (m) => calls.push(`warn:${m}`),
    error: (m) => calls.push(`error:${m}`),
  };
}

afterEach(() => setStyleLogger(null));

describe("the logging seam", () => {
  it("is silent by default", () => {
    // A UI library must not decide on the host's behalf that its console
    // should fill up — components here log on every render.
    expect(() => log.trace("nobody is listening")).not.toThrow();
  });

  it("routes to a logger installed AFTER the module was imported", () => {
    // The real risk this guards: modules capture `log` at import time. If the
    // export were the raw current logger rather than a forwarding object, every
    // component would hold the no-op forever and setStyleLogger would appear to
    // do nothing at all.
    const spy = makeSpyLogger();
    setStyleLogger(spy);

    log.trace("t");
    log.debug("d");
    log.info("i");
    log.warn("w");
    log.error("e");

    expect(spy.calls).toEqual(["trace:t", "debug:d", "info:i", "warn:w", "error:e"]);
  });

  it("forwards the metadata argument", () => {
    const seen: unknown[] = [];
    setStyleLogger({
      ...makeSpyLogger(),
      debug: (_m, meta) => seen.push(meta),
    });
    log.debug("msg", { childCount: 3 });
    expect(seen).toEqual([{ childCount: 3 }]);
  });

  it("returns to silence when reset with null", () => {
    const spy = makeSpyLogger();
    setStyleLogger(spy);
    log.info("heard");
    setStyleLogger(null);
    log.info("not heard");
    expect(spy.calls).toEqual(["info:heard"]);
  });
});
