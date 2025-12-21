# Markdown 转 LaTeX 转换器

[English](README.md) | [简体中文](README_ZH.md)

本项目提供了一个将 Markdown 文件（特别是包含数学公式的文件）转换为 LaTeX 文档的工具。它专为倾向于使用 LaTeX 进行排版以获得高质量文档的学术或技术写作场景而设计。

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
├── .gitignore            # Git 忽略文件
└── README.md             # 项目文档
```

## 前置条件

*   **LaTeX 发行版:** 需要安装完整的发行版（如 [TeX Live](https://www.tug.org/texlive/) 或 [MiKTeX](https://miktex.org/)）以支持 PDF 编译。
*   **Python:** 需要 Python 3.8 或更高版本。
*   **Node.js (可选):** 仅当你需要修改并重新构建前端网页界面时需要。

## 安装指南

### 1. 快速开始 (Conda / 一键安装)

我们推荐使用 Conda 环境来管理依赖。

```bash
# 1. 创建并激活新环境
conda create -n lxrender python=3.9 -y
conda activate lxrender

# 2. 以编辑模式安装项目（自动安装所有依赖）
pip install -e .
```
> **注意：** `pip install -e .` 命令是 **必须** 的。它不仅会自动安装所有 Python 依赖包（包括 GUI 模式所需的 FastAPI），还会将 `lxrender` 命令注册到你的环境中。

### 2. 手动安装

如果你更喜欢直接使用 `pip`：

```bash
# 一键安装依赖并注册 'lxrender' 命令
pip install -e .
```

## 使用方法

### 1. GUI 可视化模式 (推荐)

**第一步：构建前端界面 (仅首次需要)**
在启动应用之前，你需要编译 React 界面。这需要安装 Node.js。

```bash
cd web
npm install
npm run build
cd ..
```

**第二步：启动应用**
运行一键启动脚本：

```bash
python start_app.py
```
这将启动 FastAPI 后端并自动在浏览器打开 `http://localhost:8000`。你可以直接在网页中编辑 Markdown、选择模板并实时预览 PDF。

> **注意：** 如果你修改了 `web/` 目录下的源代码，必须重新运行 `npm run build` 才能看到更改。

### 2. 命令行工具 (`lxrender`)

```bash
# 基本转换
lxrender input.md

# 使用特定模板（例如：教师教案）
lxrender input.md --template matnoble-teaching

# 转换、编译并清理辅助文件
lxrender input.md --compile --clean
```

### 直接使用 Python 运行

此外，你仍然可以直接通过 Python 运行脚本：

### 文档元数据 (YAML Front Matter)

你可以在 Markdown 文件开头使用 YAML 块指定文档特定的元数据。该块必须以 `---` 开始和结束。

示例：

```markdown
---
title: 我的精彩文章
subtitle: LaTeX 转换入门
author: 张三
---

# 你的文章内容

这是你的 Markdown 文档的主要内容。
```

支持的元数据键：
*   `title`: 文档主标题。
*   `subtitle`: 可选副标题（标准模板）。
*   `author`: 作者姓名。
*   `course`: 课程名称（教案模板）。
*   `teaching_class`: 授课班级（教案模板）。
*   `lesson_type`: 课题类型（教案模板）。
*   `teaching_time`: 授课时间（教案模板）。

## 功能支持

*   **多模板支持:** 
    *   `matnoble`: 经典的数学笔记样式，带个人信息卡片。
    *   `matnoble-teaching`: 专业的教师教案样式，带信息表格和**淡淡的横线网格背景**。
*   **结构:** 标题 (H1-H4 映射到 LaTeX 章节, H5-H6 回退处理), 段落, 水平分割线。
*   **格式:** 加粗 (`**text**`), 斜体 (`*text*`), 行内代码 (`code`), 引用块 (`> text`)。
*   **列表:** 无序列表 (`*`, `-`) 和有序列表 (`1.`)，包括嵌套列表。
*   **代码块:** 带语言支持的围栏代码块 (使用 LaTeX `listings` 包)。
*   **数学公式:**
    *   行内公式: `$E=mc^2$`
    *   块级公式: `$$...$$`
*   **链接:** 标准 Markdown links `[text](url)`。
*   **图片:** 标准 Markdown 图片 `![alt](url)`。
*   **删除线:** `~~text~~` 语法。
*   **元数据:** 用于标题、副标题和作者的 YAML Front Matter。

**当前不支持 / 局限性:**

*   **任务列表:** `[ ]` / `[x]` 语法不支持。
*   **脚注:** `[^1]` 语法不支持。

## 测试

单元测试位于 `tests/` 目录下。要运行所有测试，请从项目根目录执行以下命令：

```bash
python -m unittest discover tests
```

或者，运行特定的测试文件：

```bash
python -m unittest tests.test_math_rendering
```