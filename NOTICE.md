# NOTICE

This project is a Cloudflare Workers / Pages port of
[nekohaxx/plistserver](https://github.com/nekohaxx/plistserver),
which credits the original QuickSign team implementation at
<https://github.com/QuickSign-Team/plistserver>.

The upstream project is licensed under the GNU General Public License v3.0.
A copy of that license is included as `LICENSE`. This port is distributed under
the same license.

Changes in this port:
- Rewritten from Rust/Actix Web to a Cloudflare Worker ES module (`src/index.js`).
- Added a built-in Web UI for generating `itms-services` install links.
- Added XML escaping, parameter validation, `HEAD` support, `/health`, and a root page.
- Added `scripts/build.mjs` to generate a Cloudflare Pages upload directory (`dist/`).
- Added Wrangler configuration, unit tests, and Git-based deployment documentation.