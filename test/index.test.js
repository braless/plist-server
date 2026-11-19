import test from "node:test";
import assert from "node:assert/strict";
import worker, { UI_HTML } from "../src/index.js";

const base = "https://plist.example.workers.dev";

test("generates plist identical in structure to upstream", async () => {
  const url = new URL("/genPlist", base);
  url.searchParams.set("bundleid", "com.example.app");
  url.searchParams.set("name", "Demo App");
  url.searchParams.set("version", "1.2.3");
  url.searchParams.set("fetchurl", "https://example.com/signed.ipa");

  const res = await worker.fetch(new Request(url), {}, {});
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("content-type"), "application/octet-stream");
  const xml = await res.text();
  assert.match(xml, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
  assert.match(xml, /<key>bundle-identifier<\/key>\s*<string>com\.example\.app<\/string>/);
  assert.match(xml, /<key>bundle-version<\/key>\s*<string>1\.2\.3<\/string>/);
  assert.match(xml, /<key>title<\/key>\s*<string>Demo App<\/string>/);
});

test("escapes XML metacharacters", async () => {
  const url = new URL("/genPlist", base);
  url.searchParams.set("bundleid", "com.example.app");
  url.searchParams.set("name", 'A & B <"test">');
  url.searchParams.set("version", "1.0");
  url.searchParams.set("fetchurl", "https://example.com/a.ipa?x=1&y=2");
  const xml = await (await worker.fetch(new Request(url), {}, {})).text();
  assert.match(xml, /<string>A &amp; B &lt;&quot;test&quot;&gt;<\/string>/);
  assert.match(xml, /<string>https:\/\/example\.com\/a\.ipa\?x=1&amp;y=2<\/string>/);
});

test("missing parameters return 400", async () => {
  const res = await worker.fetch(
    new Request(`${base}/genPlist?bundleid=com.example.app&name=Demo`), {}, {}
  );
  assert.equal(res.status, 400);
  assert.match(await res.text(), /version, fetchurl/);
});

test("non-GET methods return 405", async () => {
  const res = await worker.fetch(new Request(`${base}/genPlist`, { method: "POST" }), {}, {});
  assert.equal(res.status, 405);
  assert.equal(res.headers.get("allow"), "GET, HEAD");
});

test("health returns ok", async () => {
  assert.equal(await (await worker.fetch(new Request(`${base}/health`), {}, {})).text(), "ok");
});

test("pure Workers serves embedded UI at root", async () => {
  const res = await worker.fetch(new Request(base), {}, {});
  assert.equal(res.status, 200);
  assert.match(res.headers.get("content-type"), /text\/html/);
  const body = await res.text();
  assert.match(body, /plist-server/);
  assert.equal(body, UI_HTML);
  assert.match(body, /itms-services/);
});

test("Pages mode delegates static assets to env.ASSETS", async () => {
  const env = { ASSETS: { fetch: async (req) => new Response("static:" + new URL(req.url).pathname) } };
  const res = await worker.fetch(new Request(`${base}/some.css`), env, {});
  assert.equal(await res.text(), "static:/some.css");
});

test("unknown path returns 404 in Workers mode", async () => {
  const res = await worker.fetch(new Request(`${base}/unknown`), {}, {});
  assert.equal(res.status, 404);
});