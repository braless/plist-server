import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { UI_HTML } from "../src/index.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = resolve(root, "dist");

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

writeFileSync(resolve(out, "index.html"), UI_HTML, "utf8");
writeFileSync(resolve(out, "_worker.js"), readFileSync(resolve(root, "src/index.js"), "utf8"), "utf8");
writeFileSync(resolve(out, "README.txt"), "Upload the contents of this folder to Cloudflare Pages.\n", "utf8");

console.log("Built Cloudflare Pages assets in dist/");