// Writes docs/api/index.html linking the API reference of each package that has one.
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";

const root = new URL("../", import.meta.url);
const packages = readdirSync(new URL("packages/", root)).filter((name) =>
  existsSync(new URL(`docs/api/${name}/index.html`, root)),
);
const items = packages.map((name) => {
  const { name: npmName, description } = JSON.parse(
    readFileSync(new URL(`packages/${name}/package.json`, root), "utf8"),
  );
  return `    <li><a href="${name}/">${npmName}</a><p>${description.replace(/</g, "&lt;")}</p></li>`;
});
// Colors follow the awalsh128.com site theme: Blowfish "ocean" blue for links, amber for highlights, dark by default.
const css = `
  :root { color-scheme: dark light; --bg: #0f172a; --card: #1e293b; --text: #e2e8f0; --muted: #94a3b8;
    --link: #93c5fd; --accent: #fbbf24; --border: #334155; }
  @media (prefers-color-scheme: light) {
    :root { --bg: #f8fafc; --card: #fff; --text: #1e293b; --muted: #475569;
      --link: #1d4ed8; --accent: #b45309; --border: #cbd5e1; }
  }
  body { margin: 0; background: var(--bg); color: var(--text);
    font: 1rem/1.6 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
  main { max-width: 48rem; margin: 0 auto; padding: 3rem 1rem; }
  h1 { color: var(--accent); margin: 0 0 .5rem; }
  .lead { color: var(--muted); margin: 0 0 2rem; }
  ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 1rem; }
  li { background: var(--card); border: 1px solid var(--border); border-radius: .5rem; padding: 1rem 1.25rem; }
  li a { color: var(--link); font-weight: 600; text-underline-offset: 3px; }
  li a:hover { color: var(--accent); }
  li p { margin: .25rem 0 0; color: var(--muted); }
  footer { margin-top: 2rem; }
  footer a { color: var(--link); }
  a:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
`;
const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Winston host adapters API</title>
  <style>${css}</style>
</head>
<body>
  <main>
    <h1>Winston host adapters API</h1>
    <p class="lead">Unofficial extensions of Winston, not affiliated with the Winston project.</p>
    <ul>
${items.join("\n")}
    </ul>
    <footer><a href="https://www.awalsh128.com/">awalsh128.com</a></footer>
  </main>
</body>
</html>
`;
writeFileSync(new URL("docs/api/index.html", root), html);
