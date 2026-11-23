import { expect } from "chai";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ActionsLogger, findCallSite, type Core } from "../src/index.js";

const flush = () => new Promise((resolve) => setImmediate(resolve));
const here = fileURLToPath(import.meta.url);
const workspace = path.resolve(path.dirname(here), "..");

function fakeCore(): Core & { calls: unknown[][] } {
  const calls: unknown[][] = [];
  const record =
    (method: string) =>
    (...args: unknown[]) =>
      void calls.push([method, ...args]);
  return {
    calls,
    info: record("info"),
    debug: record("debug"),
    warning: record("warning"),
    error: record("error"),
    startGroup: record("startGroup"),
    endGroup: record("endGroup"),
    setSecret: record("setSecret"),
    isDebug: () => false,
  };
}

describe("findCallSite", () => {
  const stack = [
    "Error",
    "    at Object.transform (/w/node_modules/winston/lib/logger.js:1:1)",
    "    at file:///w/packages/winston-host/dist/lazy.js:5:5",
    "    at run (file:///w/src/app/main.ts:12:7)",
  ].join("\n");

  it("skips winston and these packages, and makes the path workspace-relative", () => {
    expect(findCallSite({ workspace: "/w", stack })).to.deep.equal({
      path: "src/app/main.ts",
      line: 12,
      column: 7,
    });
  });

  it("returns nothing for a caller outside the workspace", () => {
    expect(findCallSite({ workspace: "/other", stack })).to.equal(undefined);
  });

  it("returns nothing without a workspace", () => {
    expect(findCallSite({ workspace: "", stack })).to.equal(undefined);
  });
});

describe("ActionsLogger with discoverLocation", () => {
  it("annotates errors and warnings with the logging line", async () => {
    const core = fakeCore();
    const logger = new ActionsLogger({
      core,
      env: { GITHUB_WORKSPACE: workspace },
      discoverLocation: true,
    });
    logger.error("boom");
    logger.warn("hmm");
    logger.info("fine");
    await flush();
    const [error, warning, info] = core.calls as [string, string, any?][];
    expect(error[2]).to.include({ file: "test/call-site.test.ts" });
    expect(error[2].startLine).to.be.a("number");
    expect(warning[2]).to.include({ file: "test/call-site.test.ts" });
    expect(info).to.deep.equal(["info", "fine"]);
  });

  it("keeps an explicit location", async () => {
    const core = fakeCore();
    const logger = new ActionsLogger({
      core,
      env: { GITHUB_WORKSPACE: workspace },
      discoverLocation: true,
    });
    logger.forLocation({ path: "x.ts", line: 1 }).error("boom");
    await flush();
    expect(core.calls[0][2]).to.deep.equal({ file: "x.ts", startLine: 1 });
  });

  it("does nothing unless asked", async () => {
    const core = fakeCore();
    new ActionsLogger({ core, env: { GITHUB_WORKSPACE: workspace } }).error("boom");
    await flush();
    expect(core.calls).to.deep.equal([["error", "boom", undefined]]);
  });
});
