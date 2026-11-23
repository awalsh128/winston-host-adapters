---
name: scope-check
description: >-
  Decide whether a proposed adapter, transport, format, helper or export belongs in this repo or
  plain Winston already covers it. Use before adding one, when reviewing or extending existing ones,
  and when asked whether something should be a package here or just use Winston's own features.
---

# Scope check

These packages exist for what Winston cannot do alone: bridging to a host's own log output and
levels, such as a VS Code output channel, workflow annotations or a runner's debug setting. When
Winston's own features do the job, the better answer is to use Winston directly.

## Steps

1. **Name what it adds.** State the capability in one sentence, and which host surface it needs
   (`vscode`, `@actions/core`, the Checks API, a host's level). If it needs none, it probably isn't
   an adapter.
2. **Check what Winston already provides.** Look at the installed Winston and `winston-transport`
   under `node_modules`, not memory:
   - transports (`Console`, `File`, `Http`, `Stream`) and custom ones by extending `winston-transport`
   - formats from `logform` (`printf`, `combine`, `timestamp`, `colorize`, `json`)
   - levels and custom levels, `level` and `silent` per logger and per transport
   - child loggers and `defaultMeta`, exception and rejection handlers
3. **Decide.**
   - Winston covers it: decline. Show the few lines of Winston configuration that do it, and write
     `.out-of-scope/<idea>.md` in the shape its README gives, so it isn't proposed again.
   - Winston covers part of it: keep only the host-specific part.
   - It needs the host's own API, level or output: it belongs, in the package for that host. If
     it needs a new host, that is a new package implementing `Host`. `winston-host` stays free of
     host SDKs and Node 24-only APIs.
4. **For existing code,** treat a wrapper that only repeats a Winston feature as a removal candidate
   and say so. Removing an export is a breaking change: it needs a `!` commit and a major release,
   and the owned dependency chain in `AGENTS.md` applies (follow-up PRs downstream).
5. **Answer plainly.** Give the verdict first, then the reason, then the Winston configuration or the
   host surface that justifies the decision. When keeping something, say what it adds beyond Winston.
