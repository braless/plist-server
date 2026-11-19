// plist-server Worker
// Based on https://github.com/nekohaxx/plistserver (GPLv3).
// Single source of truth: used as-is by Cloudflare Workers and copied to
// dist/_worker.js by `npm run build` for Cloudflare Pages advanced mode.

export const UI_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>plist-server - iOS OTA 清单生成器</title>
<style>
:root{--bg:#080d1c;--card:#111a30;--card2:#0d1528;--line:#243154;--txt:#e8eeff;--muted:#94a3c8;--a1:#7c9cff;--a2:#22d3ee;--ok:#34d399;--bad:#fb7185}
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,"Microsoft YaHei",sans-serif;color:var(--txt);background:radial-gradient(1100px 600px at 12% -10%,#1c2d68 0%,transparent 62%),radial-gradient(900px 520px at 100% 0%,#0b3d4c 0%,transparent 58%),var(--bg);min-height:100vh;line-height:1.6}
a{color:var(--a2);text-decoration:none}
a:hover{text-decoration:underline}
.wrap{max-width:1180px;margin:0 auto;padding:48px 22px 80px}
.hero{text-align:center;margin-bottom:44px}
.badge{display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border:1px solid var(--line);border-radius:999px;background:rgba(124,156,255,.08);color:var(--a1);font-size:13px;letter-spacing:.4px}
.dot{width:7px;height:7px;border-radius:50%;background:var(--ok);box-shadow:0 0 12px var(--ok)}
h1{font-size:clamp(32px,5vw,54px);line-height:1.15;margin:20px 0 12px;letter-spacing:-1px;background:linear-gradient(100deg,#fff 10%,var(--a1) 55%,var(--a2) 95%);-webkit-background-clip:text;background-clip:text;color:transparent}
.sub{color:var(--muted);max-width:660px;margin:0 auto;font-size:16px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:22px}
@media(max-width:860px){.grid{grid-template-columns:1fr}}
.card{background:linear-gradient(180deg,rgba(255,255,255,.035),transparent 60%),var(--card);border:1px solid var(--line);border-radius:18px;padding:26px;box-shadow:0 18px 60px rgba(0,0,0,.35)}
.card h2{font-size:18px;margin:0 0 6px;display:flex;align-items:center;gap:10px}
.card h2 .n{display:inline-grid;place-items:center;width:26px;height:26px;border-radius:8px;background:linear-gradient(135deg,var(--a1),var(--a2));color:#051022;font-size:13px;font-weight:800}
.hint{color:var(--muted);font-size:13px;margin:0 0 20px}
label{display:block;font-size:13px;color:var(--muted);margin:14px 0 6px}
input{width:100%;padding:11px 13px;border-radius:10px;border:1px solid var(--line);background:var(--card2);color:var(--txt);font-size:14px;outline:none;transition:.18s}
input:focus{border-color:var(--a1);box-shadow:0 0 0 3px rgba(124,156,255,.16)}
.row{display:flex;align-items:center;justify-content:space-between;margin-top:22px;gap:12px}
button{cursor:pointer;border:0;border-radius:10px;padding:11px 18px;font-size:14px;font-weight:650;color:#051022;background:linear-gradient(100deg,var(--a1),var(--a2));transition:.18s;white-space:nowrap}
button:hover{filter:brightness(1.08);transform:translateY(-1px)}
button.ghost{background:transparent;color:var(--muted);border:1px solid var(--line)}
button.ghost:hover{color:var(--txt);border-color:var(--a1);transform:none}
.out{background:var(--card2);border:1px solid var(--line);border-radius:12px;padding:14px;margin-top:10px;word-break:break-all;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:12.5px;color:#b9c8ff;min-height:46px}
.out-label{font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:.8px;margin-top:18px}
.ok{color:var(--ok)}
.bad{color:var(--bad)}
.docs{margin-top:26px}
.tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}
.tab{padding:7px 14px;border-radius:8px;border:1px solid var(--line);background:var(--card2);color:var(--muted);font-size:13px;cursor:pointer}
.tab.on{background:rgba(124,156,255,.14);border-color:var(--a1);color:var(--txt)}
pre{margin:0;background:#070c18;border:1px solid var(--line);border-radius:12px;padding:16px;overflow:auto;font-size:12.5px;line-height:1.65;color:#c7d4ff}
code{font-family:ui-monospace,SFMono-Regular,Consolas,monospace}
.pane{display:none}.pane.on{display:block}
.foot{text-align:center;color:var(--muted);font-size:12.5px;margin-top:42px}
.pill{display:inline-block;padding:2px 8px;border:1px solid var(--line);border-radius:6px;color:var(--a1);font-size:12px}
</style>
</head>
<body>
<div class="wrap">
  <div class="hero">
    <span class="badge"><span class="dot"></span> Cloudflare Workers / Pages</span>
    <h1>plist-server</h1>
    <p class="sub">基于 <a href="https://github.com/nekohaxx/plistserver" target="_blank" rel="noopener">nekohaxx/plistserver</a> 的 iOS OTA 安装清单生成器。填写参数，一键生成 <code>itms-services</code> 安装链接。</p>
  </div>

  <div class="grid">
    <section class="card">
      <h2><span class="n">1</span> 生成安装链接</h2>
      <p class="hint">manifest 与 IPA 均需通过 HTTPS 访问，否则 iOS 会拒绝安装。</p>
      <form id="f">
        <label for="bundleid">Bundle ID（已签名 IPA 的真实值）</label>
        <input id="bundleid" name="bundleid" placeholder="com.example.app" required>
        <label for="name">应用名称</label>
        <input id="name" name="name" placeholder="Demo App" required>
        <label for="version">版本号 bundle-version</label>
        <input id="version" name="version" value="1.0" required>
        <label for="fetchurl">IPA 下载地址（HTTPS）</label>
        <input id="fetchurl" name="fetchurl" placeholder="https://example.com/signed.ipa" type="url" required>
        <div class="row">
          <button type="button" class="ghost" id="fill">填入示例</button>
          <button type="submit">生成 itms-services 链接</button>
        </div>
      </form>
    </section>

    <section class="card">
      <h2><span class="n">2</span> 结果</h2>
      <p class="hint">复制 second 个链接，在 iPhone Safari 中打开即可触发安装。</p>
      <div class="out-label">Manifest URL</div>
      <div class="out" id="murl">-</div>
      <div class="row" style="margin-top:8px"><span></span><button type="button" class="ghost" data-copy="murl">复制</button></div>
      <div class="out-label">itms-services URL</div>
      <div class="out" id="iurl">-</div>
      <div class="row" style="margin-top:8px"><span></span><button type="button" class="ghost" data-copy="iurl">复制</button></div>
      <div class="out-label">状态</div>
      <div class="out" id="status">等待生成</div>
    </section>
  </div>

  <section class="card docs">
    <h2><span class="n">3</span> API 调用示例</h2>
    <p class="hint">接口：<code>GET /genPlist?bundleid=&amp;name=&amp;version=&amp;fetchurl=</code>，返回 <code>application/octet-stream</code> 的 plist XML。</p>
    <div class="tabs">
      <button class="tab on" data-tab="curl">cURL</button>
      <button class="tab" data-tab="js">JavaScript</button>
      <button class="tab" data-tab="python">Python</button>
      <button class="tab" data-tab="pwsh">PowerShell</button>
    </div>
    <div class="pane on" id="curl"><pre><code>curl -G 'https://YOUR_DOMAIN/genPlist' \
  --data-urlencode 'bundleid=com.example.app' \
  --data-urlencode 'name=Demo App' \
  --data-urlencode 'version=1.0' \
  --data-urlencode 'fetchurl=https://example.com/signed.ipa'</code></pre></div>
    <div class="pane" id="js"><pre><code>const u = new URL('https://YOUR_DOMAIN/genPlist');
u.searchParams.set('bundleid', 'com.example.app');
u.searchParams.set('name', 'Demo App');
u.searchParams.set('version', '1.0');
u.searchParams.set('fetchurl', 'https://example.com/signed.ipa');

const plist = await (await fetch(u)).text();
const itms = 'itms-services://?action=download-manifest&amp;url=' + encodeURIComponent(u.href);</code></pre></div>
    <div class="pane" id="python"><pre><code>import urllib.parse, urllib.request
params = urllib.parse.urlencode({
    'bundleid': 'com.example.app',
    'name': 'Demo App',
    'version': '1.0',
    'fetchurl': 'https://example.com/signed.ipa',
})
url = 'https://YOUR_DOMAIN/genPlist?' + params
plist = urllib.request.urlopen(url).read().decode()</code></pre></div>
    <div class="pane" id="pwsh"><pre><code>$q = @{
  bundleid = 'com.example.app'
  name     = 'Demo App'
  version  = '1.0'
  fetchurl = 'https://example.com/signed.ipa'
}
$u = 'https://YOUR_DOMAIN/genPlist?' + (($q.GetEnumerator() | ForEach-Object {
  "$($_.Key)=$([uri]::EscapeDataString($_.Value))" }) -join '&amp;')
$plist = Invoke-RestMethod $u</code></pre></div>
  </section>

  <div class="foot">
    GPL-3.0 · Source: <a href="https://github.com/nekohaxx/plistserver" target="_blank" rel="noopener">nekohaxx/plistserver</a>
    &nbsp;·&nbsp; <span class="pill">GET /health</span> for health check
  </div>
</div>

<script>
(function () {
  var form = document.getElementById('f');
  var murl = document.getElementById('murl');
  var iurl = document.getElementById('iurl');
  var status = document.getElementById('status');

  function build() {
    var u = new URL(location.origin + '/genPlist');
    var d = new FormData(form);
    ['bundleid','name','version','fetchurl'].forEach(function (k) {
      u.searchParams.set(k, String(d.get(k) || ''));
    });
    return u;
  }

  function show() {
    var u = build();
    murl.textContent = u.href;
    iurl.textContent = 'itms-services://?action=download-manifest&url=' + encodeURIComponent(u.href);
    status.textContent = 'Manifest URL 已生成（' + u.href.length + ' 字符）';
    status.className = 'out ok';
  }

  form.addEventListener('submit', function (e) { e.preventDefault(); show(); });
  document.getElementById('fill').addEventListener('click', function () {
    document.getElementById('bundleid').value = 'com.example.app';
    document.getElementById('name').value = 'Demo App';
    document.getElementById('version').value = '1.0';
    document.getElementById('fetchurl').value = 'https://example.com/signed.ipa';
    show();
  });
  document.querySelectorAll('[data-copy]').forEach(function (b) {
    b.addEventListener('click', async function () {
      var el = document.getElementById(b.getAttribute('data-copy'));
      await navigator.clipboard.writeText(el.textContent);
      var old = b.textContent; b.textContent = '已复制'; setTimeout(function () { b.textContent = old; }, 1400);
    });
  });
  document.querySelectorAll('.tab').forEach(function (t) {
    t.addEventListener('click', function () {
      document.querySelectorAll('.tab').forEach(function (x) { x.classList.remove('on'); });
      document.querySelectorAll('.pane').forEach(function (x) { x.classList.remove('on'); });
      t.classList.add('on');
      document.getElementById(t.getAttribute('data-tab')).classList.add('on');
    });
  });
})();
</script>
</body>
</html>`;

const REQUIRED_FIELDS = ["bundleid", "name", "version", "fetchurl"];

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function buildPlist({ bundleid, name, version, fetchurl }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>items</key>
    <array>
        <dict>
            <key>assets</key>
            <array>
                <dict>
                    <key>kind</key>
                    <string>software-package</string>
                    <key>url</key>
                    <string>${escapeXml(fetchurl)}</string>
                </dict>
            </array>
            <key>metadata</key>
            <dict>
                <key>bundle-identifier</key>
                <string>${escapeXml(bundleid)}</string>
                <key>bundle-version</key>
                <string>${escapeXml(version)}</string>
                <key>kind</key>
                <string>software</string>
                <key>title</key>
                <string>${escapeXml(name)}</string>
            </dict>
        </dict>
    </array>
</dict>
</plist>`;
}

function text(body, status = 200, extraHeaders = {}) {
  return new Response(body, {
    status,
    headers: { "Content-Type": "text/plain; charset=utf-8", ...extraHeaders },
  });
}

function html(body) {
  return new Response(body, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}

function handleGenPlist(url, method) {
  if (method !== "GET" && method !== "HEAD") {
    return text("Method Not Allowed", 405, { Allow: "GET, HEAD" });
  }

  const values = {};
  const missing = [];
  for (const field of REQUIRED_FIELDS) {
    const value = url.searchParams.get(field);
    if (value === null || value === "") {
      missing.push(field);
    } else {
      values[field] = value;
    }
  }
  if (missing.length > 0) {
    return text("Missing required query parameter(s): " + missing.join(", "), 400);
  }

  return new Response(method === "HEAD" ? null : buildPlist(values), {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Cache-Control": "no-store",
    },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/genPlist") {
      return handleGenPlist(url, request.method);
    }
    if (url.pathname === "/health") {
      return text("ok");
    }

    // Cloudflare Pages advanced mode: static assets are bound to env.ASSETS.
    if (env && env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    // Pure Cloudflare Workers: no asset binding, serve the embedded UI.
    if (url.pathname === "/" || url.pathname === "/index.html") {
      return html(UI_HTML);
    }
    return text("Not Found", 404);
  },
};