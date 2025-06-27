# 公司图标一键生成器

这是一个专为公司内部应用图标设计定制的工具，旨在简化和自动化图标生成过程，特别是针对需要统一风格但内容多变的场景。它提供了一个直观的网页界面，让用户可以轻松自定义图标的文字内容、样式和背景，并实时预览效果。

## ✨ 功能特性 (Features)

*   **文字内容定制**:
    *   支持多行文字输入，可自由换行。
    *   文字颜色、大小可调。
    *   多种字体选择（包括系统默认、思源黑体、站酷快乐体、马善政毛笔）。
*   **灵活的文字排版**:
    *   支持整体文字块拖拽移动。
    *   支持开启“单字拖动”模式，实现每个字符的独立位置调整，提供精细化控制。
    *   文字阴影效果，增强视觉立体感。
*   **可定制的背景渐变**:
    *   支持选择渐变起始色和结束色。
    *   提供多种预设渐变方向（如左下到右上、左上到右下、左到右等）。
    *   “渐变平滑度”滑块控制，调整渐变过渡的柔和或锐利程度。
    *   固定高光效果，营造玻璃质感。
*   **背景方案预设与管理**:
    *   支持保存当前背景设置为自定义预设方案。
    *   可加载、删除用户自定义的预设方案，并提供默认预设。
    *   预设方案数据持久化存储在浏览器本地（localStorage），刷新页面不会丢失。
*   **实时预览**: 所有调整即时反映在预览区域，所见即所得。
*   **PNG 下载**: 一键生成并下载当前预览的图标为PNG格式图片。

## 🚀 部署指南 (Deployment Guide)

本项目是一个纯前端静态应用，可以轻松部署到任何支持静态网站托管的服务上，例如 Vercel, Netlify, GitHub Pages 等。

### 使用 Vercel 部署 (推荐)

1.  **准备 Vercel 配置**: 项目根目录下已包含 `vercel.json` 文件，Vercel 将自动识别并使用此配置。
    ```json
    {
      "build": {
        "env": {
          "NODE_VERSION": "18"
        }
      },
      "installCommand": "echo 'No install command needed for static site'",
      "buildCommand": "echo 'No build command needed for static site'",
      "outputDirectory": "."
    }
    ```
2.  **Git 仓库**: 确保您的项目已推送到 GitHub, GitLab 或 Bitbucket 等 Git 托管平台。
3.  **连接 Vercel**:
    *   访问 [Vercel Dashboard](https://vercel.com/dashboard)。
    *   点击 "Add New..." -> "Project"。
    *   选择您托管本项目的 Git 仓库。
    *   Vercel 将自动检测 `vercel.json` 并配置项目。
4.  **自动部署**: 每次向连接的 Git 分支（例如 `main`）推送新提交时，Vercel 都会自动触发新的部署，更新您的在线应用。

## 🛠️ 技术栈 (Tech Stack)

*   **前端**:
    *   HTML5
    *   CSS3 (使用 [Bootstrap 5.3](https://getbootstrap.com/) 进行布局和组件样式)
    *   JavaScript (原生 JavaScript，利用 Canvas API 进行图像绘制)
*   **字体**:
    *   Google Fonts (思源黑体 Noto Sans SC, 站酷快乐体 ZCOOL KuaiLe, 马善政毛笔 Ma Shan Zheng)
    *   系统默认字体 (如 PingFang SC, Microsoft YaHei)
*   **图标**: [Bootstrap Icons](https://icons.getbootstrap.com/)

## 📂 项目结构 (Project Structure)

```
.
├── css/
│   └── style.css       # 项目自定义样式
├── js/
│   ├── main.js         # 核心 JavaScript 逻辑
│   └── presets.js      # 默认预设方案配置
├── index.html          # 应用程序主页面
└── vercel.json         # Vercel 部署配置
└── README.md           # 项目说明文档
```

## 💡 使用方法 (Usage)

1.  在浏览器中打开 `index.html` 文件。
2.  在左侧的控制面板中：
    *   输入您想要的图标文字内容。
    *   切换“编辑模式”以选择整体拖动或单字拖动。
    *   调整文字的颜色、大小和字体。
    *   选择背景渐变的起始色、结束色、方向和平滑度。
    *   在“背景方案”区域，您可以选择现有预设，或保存/删除自定义方案。
3.  在右侧的预览区域实时查看效果。
4.  调整满意后，点击“生成并下载PNG”按钮即可保存图标。

## 🤝 贡献 (Contributing)

欢迎任何形式的贡献！如果您有任何改进建议或发现 Bug，请随时提交 Issue 或 Pull Request。

## 📄 许可证 (License)

本项目采用 MIT 许可证。