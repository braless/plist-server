# plist-server Worker

基于 [nekohaxx/plistserver](https://github.com/nekohaxx/plistserver) 的 iOS OTA plist 清单生成器，支持 **Cloudflare Workers** 与 **Cloudflare Pages** 一键部署。

核心接口保持不变：`GET /genPlist?bundleid=...&name=...&version=...&fetchurl=...`，返回 `application/octet-stream` 的 plist XML。新增了内置 Web UI（表单生成 `itms-services` 链接）、XML 转义、参数校验、健康检查。

> IPA 文件本身不托管在此项目里，`fetchurl` 必须指向可通过 HTTPS 访问的 IPA。

## 仓库结构

```
plist-server/
├── src/index.js          # 唯一源码：Workers 入口 + UI + plist 逻辑
├── test/index.test.js    # Node 内置测试
├── scripts/build.mjs     # 生成 Pages 上传目录 dist/
├── wrangler.toml         # Workers 部署配置
├── pages-upload/         # 手动拖拽上传用的静态目录（旧的备用）
├── dist/                 # npm run build 生成，Git 忽略
└── package.json
```

## 本地开发

```powershell
cd E:\Github\work-dir\Software\plist-server
npm install
npm test
npm run build       # 生成 dist/ 供 Pages 上传
```

## 部署方式一：Cloudflare Workers（Git 一键部署）

### A. Dashboard 创建 Worker + 连接 Git

1. 把本仓库 push 到 GitHub / GitLab
2. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Workers** → **Connect to Git**
3. 选择仓库，分支选 `main`
4. 构建配置：
   - **Build command**：留空（Worker 不需要构建）
   - **Deploy command**：`npx wrangler deploy`
   - **Root directory**：留空（仓库根目录）
5. 环境变量：不需要
6. 点击 **Save and Deploy**

每次 push 到 `main` 就会自动部署。首次部署后 Cloudflare 会要求安装 Wrangler（自动完成）。

### B. 本地 CLI 部署（备选）

```powershell
npm install
npx wrangler login
npm run deploy
```

`wrangler.toml` 中 `name = "plist-server"`，如被占用请改成唯一名称。

## 部署方式二：Cloudflare Pages（Git 一键部署）

1. 把本仓库 push 到 Git 远端
2. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
3. 选择仓库，分支 `main`
4. 构建配置：
   - **Framework preset**：None
   - **Build command**：`npm install && npm run build`
   - **Build output directory**：`dist`
   - **Root directory**：留空
5. 点击 **Save and Deploy**

Pages 会检测到 `dist/_worker.js` 并自动启用高级模式：API 走 Worker，其他路径走静态 UI。

## 部署方式三：手动拖拽上传（Pages）

```powershell
npm run build
```

然后把 `dist` 文件夹里的内容拖到 Cloudflare Pages 的 **Upload assets** 上传框。

## API 调用示例

所有参数都是必填，需 URL 编码。把 `YOUR_DOMAIN` 换成你的 `pages.dev` 或 `workers.dev` 域名。

### cURL

```bash
curl -G 'https://YOUR_DOMAIN/genPlist' \
  --data-urlencode 'bundleid=com.example.app' \
  --data-urlencode 'name=Demo App' \
  --data-urlencode 'version=1.0' \
  --data-urlencode 'fetchurl=https://example.com/signed.ipa'
```

### JavaScript

```js
const u = new URL('https://YOUR_DOMAIN/genPlist');
u.searchParams.set('bundleid', 'com.example.app');
u.searchParams.set('name', 'Demo App');
u.searchParams.set('version', '1.0');
u.searchParams.set('fetchurl', 'https://example.com/signed.ipa');

const plist = await (await fetch(u)).text();
const itms = 'itms-services://?action=download-manifest&url=' + encodeURIComponent(u.href);
```

### Python

```python
import urllib.parse, urllib.request
params = urllib.parse.urlencode({
    'bundleid': 'com.example.app',
    'name': 'Demo App',
    'version': '1.0',
    'fetchurl': 'https://example.com/signed.ipa',
})
url = 'https://YOUR_DOMAIN/genPlist?' + params
plist = urllib.request.urlopen(url).read().decode()
```

### PowerShell

```powershell
$q = @{
  bundleid = 'com.example.app'
  name     = 'Demo App'
  version  = '1.0'
  fetchurl = 'https://example.com/signed.ipa'
}
$u = 'https://YOUR_DOMAIN/genPlist?' + (($q.GetEnumerator() | ForEach-Object {
  "$($_.Key)=$([uri]::EscapeDataString($_.Value))" }) -join '&')
$plist = Invoke-RestMethod $u
```

### 生成 iOS 安装链接

```js
const itms = 'itms-services://?action=download-manifest&url=' + encodeURIComponent(u.href);
// 在 iPhone Safari 中打开 itms 链接即可触发安装
```

## 参数说明

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `bundleid` | 是 | 已签名 IPA 的真实 bundle identifier |
| `name` | 是 | 安装时显示的应用名 |
| `version` | 是 | `bundle-version` |
| `fetchurl` | 是 | HTTPS 可访问的 IPA 下载 URL |

## 其他路由

- `GET /health` → 返回 `ok`
- `GET /` → 内置 Web UI（Workers 模式由 Worker 返回，Pages 模式由静态 `index.html` 提供）
- 其他路径 → Workers 模式返回 404；Pages 模式交给静态资源处理

## 许可证

GPL-3.0-only，详见 [LICENSE](LICENSE) 和 [NOTICE.md](NOTICE.md)。