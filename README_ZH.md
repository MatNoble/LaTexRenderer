# Markdown 转 LaTeX 转换器

[English](README.md) | [简体中文](README_ZH.md)

![预览图](doc/preview.png)

本项目提供了一个将 Markdown 文件（特别是包含数学公式的文件）转换为 LaTeX 文档的工具。它专为倾向于使用 LaTeX 进行排版以获得高质量文档的学术或技术写作场景而设计。

## 🔒 隐私与安全至上

**您的数据永远不会离开您的电脑。**

我们有意识地将本项目设计为**本地优先/私有化部署**工具，而非公共 Web 服务。我们深知学术论文、技术报告和个人笔记的隐私性至关重要。通过在本地（Docker 或 Python）运行此工具，您可以确保：
*   **绝对的数据隐私**：没有任何文档内容会被上传到第三方服务器。
*   **零追踪**：我们不收集任何关于您写作内容的统计信息。
*   **离线使用**：无需互联网连接，随时随地在本地环境下进行创作。

## 项目结构

本项目遵循标准化的结构：

```
.
├── latexrender/          # 核心源代码包
│   ├── main.py           # CLI 入口与核心转换逻辑
│   ├── renderer.py       # 自定义 Mistune LaTeX 渲染器
│   └── templates.py      # LaTeX 模板文件
├── server/               # FastAPI 后端代码 (用于 GUI)
│   └── main.py           # API 接口与静态文件托管
├── web/                  # React 前端源代码
│   ├── src/              # React 组件
│   ├── dist/             # 编译后的静态资源 (构建后生成)
│   └── package.json      # 前端依赖配置
├── doc/                  # 文档、资源及模板
│   ├── matnoble.cls      # 标准学生笔记模板
│   ├── matnoble-teaching.cls # 教师教案模板
│   └── ...               # 资源 (logo) 及生成的输出文件
├── tests/                # 单元测试
├── start_app.py          # GUI 一键启动脚本
├── setup.py              # Python 包安装配置
├── Dockerfile            # Docker 镜像配置文件
├── docker-compose.yml    # Docker 容器编排文件
├── .dockerignore         # Docker 构建忽略文件
├── .gitignore            # Git 忽略文件
└── README.md             # 项目文档
```

## 前置条件

*   **Docker (强烈推荐):** 安装 Docker Desktop (Windows/Mac) 或 Docker Engine (Linux)。这是解决 LaTeX 环境配置最简单的方法。
*   **LaTeX 发行版 (本地):** 需要安装完整的发行版（如 [TeX Live](https://www.tug.org/texlive/) 或 [MiKTeX](https://miktex.org/)）。如果使用 Docker 则无需安装。
*   **Python:** 需要 Python 3.8 或更高版本。
*   **Node.js (可选):** 仅当你需要修改并重新构建前端网页界面时需要。

## 安装与部署指南

### 1. Docker 部署模式 (最简便、环境一致)

使用 Docker 运行应用，无需在本地安装 LaTeX 或 Python 包。

```bash
# 使用 Docker Compose 启动应用
docker-compose up -d --build
```
- **重新构建并清理:** 频繁构建会产生大量悬空镜像 (`<none>:<none>`)。你可以使用提供的脚本进行一键构建并自动清理：
  ```bash
  chmod +x redeploy.sh
  ./redeploy.sh
  ```
- **访问:** 浏览器打开 `http://localhost:8000` 即可使用。
- **字体:** 内置支持 **思源宋体/黑体 (Noto CJK)**。如有其他自定义字体，请将其放入 `fonts/` 目录并取消 `docker-compose.yml` 中的卷挂载注释。
- **产物:** 生成的 PDF 将实时同步到本地项目的 `build/` 文件夹。

### 2. 本地开发模式 (手动安装)

#### 第一步：配置 Python 环境
```bash
conda create -n lxrender python=3.9 -y
conda activate lxrender
pip install -e .
```

#### 第二步：构建前端界面 (仅首次需要)
```bash
cd web
npm install
npm run build
cd ..
```

## 使用方法

### 1. GUI 可视化模式 (网页界面)

如果本地运行：
```bash
python start_app.py
```
如果使用 Docker 运行：
直接访问 `http://localhost:8000`。

### 2. 命令行工具 (`lxrender`)

```bash
# 基本转换
lxrender input.md

# 使用教案模板
lxrender input.md --template matnoble-teaching

# 转换、编译并清理辅助文件
lxrender input.md --compile --clean
```

## 功能支持

*   **多模板支持:** 
    *   `matnoble`: 经典的数学笔记样式，带个人信息卡片。
    *   `matnoble-teaching`: 专业的教师教案样式，带信息表格和**淡淡的横线网格背景**。
*   **Docker 优化:** 基于多阶段构建，内置完整的 XeTeX 编译环境。
*   **数学公式:** 完美支持行内公式 `$E=mc^2$` 和块级公式 `$$...$$`。
*   **自动清理:** 编译成功后自动运行 `latexmk -c` 清除辅助文件。

## 测试

```bash
python -m unittest discover tests
```
