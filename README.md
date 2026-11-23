<p align="center">
  <img src="images/logo.png" alt="Winston host adapters logo" width="128" height="128">
</p>

<h1 align="center">Winston Host Adapters</h1>

<p align="center">
  Winston loggers for VS Code extensions, GitHub Actions workflows, or any host you give a small adapter to.
</p>

<p align="center">
  <a href="https://github.com/awalsh128/winston-host-adapters/actions/workflows/ci.yml?query=branch%3Amain"><img src="https://img.shields.io/github/actions/workflow/status/awalsh128/winston-host-adapters/ci.yml?branch=main&label=main" alt="CI on main"></a>
  <a href="https://github.com/awalsh128/winston-host-adapters/actions/workflows/ci.yml?query=branch%3Astaging"><img src="https://img.shields.io/github/actions/workflow/status/awalsh128/winston-host-adapters/ci.yml?branch=staging&label=staging" alt="CI on staging"></a>
  <a href="https://www.npmjs.com/package/@awalsh128/winston-host"><img src="https://img.shields.io/npm/v/@awalsh128/winston-host?label=winston-host" alt="winston-host"></a>
  <a href="https://www.npmjs.com/package/@awalsh128/winston-vscode"><img src="https://img.shields.io/npm/v/@awalsh128/winston-vscode?label=winston-vscode" alt="winston-vscode"></a>
  <a href="https://www.npmjs.com/package/@awalsh128/winston-github-actions"><img src="https://img.shields.io/npm/v/@awalsh128/winston-github-actions?label=winston-github-actions" alt="winston-github-actions"></a>
  <a href="https://github.com/awalsh128/winston-host-adapters/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-Apache%202.0-blue.svg" alt="License"></a>
</p>

[Winston](https://github.com/winstonjs/winston) loggers for the places your code runs: VS Code
extensions, GitHub Actions workflows, or any host you give a small adapter to.

> [!NOTE]
> This is an unofficial extension of Winston and is not affiliated with the Winston project.

- 💤 **Lazy logging**: `logger.debug(() => message)` builds a message only when its level is enabled.
- 🔌 **One small host interface**: a transport factory, the host's level, and a dispose hook. An adapter is about
  a page of code.
- 🎚️ **Follows the host's level**: a VS Code output channel's level, or the runner's debug setting.
- 🚚 **Standalone transports**: `ActionsTransport`, `CheckRunTransport` and `OutputChannelTransport`
  work in any `winston.createLogger`, with no `HostLogger` needed.
- 🧩 **Plain Winston**: Winston stays the only engine, so other transports and `child()` metadata
  work as usual.

<!-- prettier-ignore -->
<p align="center">
  <a href="https://github.com/sponsors/awalsh128"><img src="https://img.shields.io/badge/Sponsor-%E2%9D%A4-db61a2?style=for-the-badge&logo=githubsponsors&logoColor=white" alt="Sponsor awalsh128"></a>
</p>

<p align="center">
  Free and open source, and kept up by one person.<br />
  If it saves you time, <a href="https://github.com/sponsors/awalsh128">sponsor it monthly</a> or
  <a href="https://github.com/sponsors/awalsh128?frequency=one-time">leave a small one-time tip</a>. Every bit
  helps.
</p>

## Quick Start

In a GitHub Actions step, such as a JavaScript action:

```sh
npm install @awalsh128/winston-github-actions @actions/core
```

```ts
import { ActionsLogger } from "@awalsh128/winston-github-actions";

const logger = new ActionsLogger();
logger.info("Scanning");
logger.forLocation({ path: "src/app.ts", line: 3 }).warn("Block is not sorted"); // an annotation

logger.debug(() => `Config: ${JSON.stringify(config)}`); // built only when debug logging is on

const group = logger.group("Build"); // a collapsible group in the workflow log
build();
group.dispose(); // ends the group and logs "Build (42ms)"
```

In a VS Code extension, see the [`winston-vscode` README](packages/winston-vscode#readme).

## Packages

| Package                                                                       | For                                                                             | Install                                         |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------- |
| [`@awalsh128/winston-host`](packages/winston-host#readme)                     | The shared base. Depends only on Winston and never imports `vscode`.            | `npm install @awalsh128/winston-host`           |
| [`@awalsh128/winston-vscode`](packages/winston-vscode#readme)                 | VS Code extensions: `ExtensionLogger`, `OutputChannelTransport`, `forDocument`. | `npm install @awalsh128/winston-vscode`         |
| [`@awalsh128/winston-github-actions`](packages/winston-github-actions#readme) | GitHub Actions: annotations (also via the Checks API), groups, secret masking.  | `npm install @awalsh128/winston-github-actions` |

## Do you need these?

Not always. If your host just shows what goes to stdout, plain Winston does the job. A workflow log
shows whatever `Console` writes to stdout:

```ts
import winston from "winston";

const logger = winston.createLogger({
  level: process.env.RUNNER_DEBUG === "1" ? "debug" : "info",
  transports: [new winston.transports.Console()],
});
```

Use these packages when the host has its own log surface that Winston doesn't know about: annotations,
groups and secret masking in a workflow log, or a VS Code output channel whose level users can change.

## Writing an adapter

An adapter implements `Host` from `@awalsh128/winston-host` and passes it to `HostLogger`:

```ts
import { HostLogger, type Host } from "@awalsh128/winston-host";

const host: Host = {
  createTransport: (format) => new MyHostTransport({ format }), // a winston-transport subclass
  getLevel: () => "info",
  onLevelChange: (listener) => myHost.onLevel(listener), // optional
  dispose: () => myHost.close(), // optional
};
const logger = new HostLogger(host);
```

Levels, `Location`, and the lazy methods are the same everywhere. Winston is Node-only, so browsers
are not supported.

## API

The API reference for each package is at
[awalsh128.com/winston-host-adapters](https://awalsh128.com/winston-host-adapters/). See all of my
published APIs at [awalsh128.com/api](https://awalsh128.com/api/). Release notes are on the
[Releases](https://github.com/awalsh128/winston-host-adapters/releases) page, and bugs go in
[Issues](https://github.com/awalsh128/winston-host-adapters/issues).

## Testing

```sh
npm install
npm run check   # build, typecheck and test every package
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the workflow.
