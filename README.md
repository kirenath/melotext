# 🎵 Melotext

> _Mögest du inmitten des wortüberfluteten Weltenlärms einen klaren, dir ganz eigenen Flecken sprachlicher Heimat entdecken._

**Melotext** — AI 驱动的音频转录、翻译与 SRT 字幕生成工具。

上传音频，获取转录文本，一键翻译，导出 SRT 字幕。

## ✨ 功能特性

- 🎙️ **音频转录** — 基于 AssemblyAI，支持多语言语音转文字
- 🌐 **AI 翻译** — 接入任意 OpenAI 兼容 API，自由选择翻译模型
- 📝 **SRT 字幕生成** — 从转录结果直接导出 SRT 字幕文件
- ☁️ **云端存储** — Cloudflare R2 对象存储，管理音频文件
- 🔑 **访问控制** — Access Key 中间件，保护你的实例
- 👀 **演示模式** — Preview Key 一键体验完整界面，API 返回模拟数据，不消耗真实资源
- 🐳 **Docker 部署** — 一行命令启动，开箱即用

## 🛠️ 技术栈

| 层级    | 技术                    |
| ------- | ----------------------- |
| 框架    | Next.js 15 + React 19   |
| 语言    | TypeScript              |
| 样式    | Tailwind CSS            |
| UI 组件 | Radix UI + shadcn/ui    |
| 转录    | AssemblyAI API          |
| 翻译    | OpenAI 兼容 API         |
| 存储    | Cloudflare R2 (S3 兼容) |
| 部署    | Docker                  |
| 包管理  | pnpm                    |

## 🚀 快速开始

### 环境要求

- Node.js 20+
- pnpm

### 1. 克隆仓库

```bash
git clone https://github.com/kirenath/melotext.git
cd melotext
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置环境变量

复制模板并填写你的 API Key：

```bash
cp MUST_READ_ME.env.template .env.local
```

必须配置的变量：

| 变量                  | 说明                                                    |
| --------------------- | ------------------------------------------------------- |
| `ASSEMBLYAI_API_KEY`  | AssemblyAI API Key ([获取](https://www.assemblyai.com)) |
| `TRANSLATION_API_URL` | 翻译 API 端点 (OpenAI 兼容格式)                         |
| `TRANSLATION_API_KEY` | 翻译 API Key                                            |
| `TRANSLATION_MODEL`   | 翻译模型名称                                            |
| `R2_ACCESS_KEY`       | Cloudflare R2 Access Key                                |
| `R2_SECRET_KEY`       | Cloudflare R2 Secret Key                                |
| `R2_BUCKET`           | R2 存储桶名称                                           |
| `R2_ENDPOINT`         | R2 S3 兼容端点                                          |
| `R2_PUBLIC_DOMAIN`    | R2 公共访问域名                                         |
| `ACCESS_KEY`          | 应用访问密钥 (自定义)                                   |
| `PREVIEW_KEY`         | 演示模式密钥 (可选，默认 `preview`)                     |

### 4. 启动开发服务器

```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000)，首次访问需输入你设置的 `ACCESS_KEY`。

### 演示模式

在登录页点击 **「演示模式」** 按钮或输入 `PREVIEW_KEY` 即可进入演示模式：

- ✅ 浏览完整 UI 界面
- ✅ 体验转录 / 翻译流程（返回模拟数据）
- ❌ 不消耗 API 额度，不调用真实模型
- ❌ 文件上传 / 删除不可用

页面顶部会显示「演示模式」横幅，点击「退出演示」即可返回登录页。

## 🐳 Docker 部署

```bash
# 构建镜像
docker build -t melotext .

# 运行容器
docker run -d \
  --name melotext \
  --restart unless-stopped \
  -p 127.0.0.1:3000:3000 \
  --env-file .env.local \
  melotext
```

搭配 Cloudflare Tunnel 使用，无需开放公网端口。

## 📁 项目结构

```
melotext/
├── app/
│   ├── api/
│   │   ├── auth/          # Access Key 认证
│   │   ├── transcribe/    # 音频转录
│   │   ├── translate/     # 文本翻译
│   │   ├── r2-upload/     # R2 上传
│   │   └── r2-delete/     # R2 删除
│   ├── gate/              # 访问密钥输入页 + 演示模式入口
│   └── page.tsx           # 主页面
├── components/            # UI 组件
├── middleware.ts           # 认证中间件（访问控制 + 演示模式拦截）
├── Dockerfile
└── MUST_READ_ME.env.template
```

## 📄 许可证

[AGPL-3.0](LICENSE)

## 👤 作者

**Kirenath with Elias** — [Contact Me](mailto:kirenath@tuta.io)
