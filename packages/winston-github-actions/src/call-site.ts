import { LEVEL } from "triple-beam";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as winston from "winston";
import type { Location } from "@awalsh128/winston-host";

/** Frames from these files are the logging machinery, not the code that logged. */
const INTERNAL_FRAME = /[\\/]node_modules[\\/]|[\\/]winston-(host|github-actions)[\\/](src|dist)[\\/]|^node:/;

/** `at fn (file:line:col)` and `at file:line:col`; the file may be a path or a `file://` URL. */
const FRAME = /^\s*at (?:.*? \()?(.+?):(\d+):(\d+)\)?$/;

/** Options for `findCallSite`. */
export interface CallSiteOptions {
  /** The workspace root that paths are made relative to. Defaults to `GITHUB_WORKSPACE`. */
  workspace?: string;
  /** The stack to read. Defaults to the current one. */
  stack?: string;
}

/**
 * Finds the file and line of the code that is logging: the first stack frame that is not Winston, a
 * dependency or these packages, as a path relative to the workspace. Returns `undefined` when no
 * such frame lies inside the workspace, or when there is no workspace to be relative to.
 */
export function findCallSite(options: CallSiteOptions = {}): Location | undefined {
  const workspace = options.workspace ?? process.env.GITHUB_WORKSPACE;
  if (!workspace) {
    return undefined;
  }

  let stack = options.stack;
  if (stack === undefined) {
    // Winston and the lazy shim add many frames; the default limit of 10 can end before the caller.
    const limit = Error.stackTraceLimit;
    Error.stackTraceLimit = 50;
    stack = new Error().stack ?? "";
    Error.stackTraceLimit = limit;
  }

  for (const text of stack.split("\n")) {
    const match = FRAME.exec(text);
    if (!match) {
      continue;
    }

    const [, file, line, column] = match;
    const absolute = file.startsWith("file://") ? fileURLToPath(file) : file;
    if (INTERNAL_FRAME.test(absolute)) {
      continue;
    }

    const relative = path.relative(workspace, absolute);
    if (relative === "" || relative.startsWith("..") || path.isAbsolute(relative)) {
      return undefined;
    }

    return { path: relative.split(path.sep).join("/"), line: Number(line), column: Number(column) };
  }

  return undefined;
}

/**
 * Winston format that gives `error` and `warn` lines without a `location` the file and line of the
 * code that logged them, so their annotations point at the source. Other levels, and lines that
 * already have a location, are left alone. Runs in the logging call, so the stack still holds the
 * caller.
 */
export const callSiteLocation = winston.format((info, opts: unknown) => {
  const options = (opts ?? {}) as CallSiteOptions;
  const level = String(info[LEVEL] ?? info.level);
  if (info.location === undefined && (level === "error" || level === "warn")) {
    const location = findCallSite(options);
    if (location) {
      info.location = location;
    }
  }

  return info;
});
