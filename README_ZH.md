# Markdown 转 LaTeX 转换器

[English](README.md) | [简体中文](README_ZH.md)

本项目提供了一个将 Markdown 文件（特别是包含数学公式的文件）转换为 LaTeX 文档的工具。它专为倾向于使用 LaTeX 进行排版以获得高质量文档的学术或技术写作场景而设计。

## 项目结构

本项目遵循标准化的结构：

```
.
├── latexrender/          # 核心源代码包
│   ├── __init__.py       # 包初始化文件
│   ├── main.py           # 主转换脚本
│   ├── renderer.py       # 自定义 Mistune LaTeX 渲染器
│   ├── templates.py      # 用于生成文档的 LaTeX 模板
│   └── utils.py          # 工具函数（例如：LaTeX 转义）
├── tests/                # 转换器的单元测试
│   ├── __init__.py
│   └── test_math_rendering.py
├── doc/                  # 文档、资源及默认输出目录
│   ├── matnoble.cls      # LaTeX 类文件（示例）
│   └── ...               # 其他 LaTeX 资源或生成的输出文件
├── .gitignore            # Git 忽略文件
└── README.md             # 项目 README (英文)
```

## 安装

在开始之前，请确保你已经安装了以下前置条件：

### 前置条件

*   **LaTeX 发行版:** 本项目依赖 `latexmk` 将 `.tex` 文件编译为 PDF。你需要安装完整的 LaTeX 发行版（如 [TeX Live](https://www.tug.org/texlive/) 或 [MiKTeX](https://miktex.org/)）并将其配置到系统的 PATH 环境变量中。
*   **Python:** 需要 Python 3.8 或更高版本。
*   **Python 包:** `Mistune` (v3) 和 `python-frontmatter`。

### 安装步骤

1.  **克隆仓库（如果适用）:**
    ```bash
    git clone <repository-url>
    cd <project-directory>
    ```

2.  **安装依赖和项目包:**
    这将安装所需的依赖项并注册 `lxrender` 命令。
    ```bash
    pip install -e .
    ```

## 使用方法

### 使用命令行工具 (`lxrender`)

安装后，你可以在终端的任何位置使用 `lxrender` 命令。

```bash
# 基本转换
lxrender input.md

# 转换并编译为 PDF
lxrender input.md --compile

# 转换、编译并清理辅助文件
lxrender input.md --compile --clean

# 指定输出文件
lxrender input.md -o output.tex
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
*   `title`: 文档的主标题（如果未提供，默认为 "Untitled Document"）。
*   `subtitle`: 可选副标题（如果未提供，将不显示）。
*   `author`: 文档的作者（如果未提供，默认为 "Unknown Author"）。

### LaTeX 编译与清理

将 Markdown 转换为 `.tex` 文件后，你可以选择使用 `latexmk` 将其编译为 PDF 并清理辅助文件。请确保你的系统 PATH 中已安装并可用 `latexmk`（通常包含在 TeX Live 或 MiKTeX 等完整 LaTeX 发行版中）。

*   **编译为 PDF**: 使用 `--compile` 标志。
    ```bash
    lxrender <input.md> --compile
    # 这将把 <input.md> 转换为 doc/<input>.tex，然后将 doc/<input>.tex 编译为 PDF。
    ```

*   **清理辅助文件**: 使用 `--clean` 标志。
    如果单独使用，它将清理从 `<input.md>` 生成的 `.tex` 文件的辅助文件。
    如果与 `--compile` 一起使用，它将在编译成功后清理辅助文件。
    ```bash
    lxrender <input.md> --clean
    lxrender <input.md> --compile --clean
    ```

### 基本转换

如果未指定输出路径，生成的 `.tex` 文件将放置在 `doc/` 目录下，文件名与输入 Markdown 文件相同。

```bash
lxrender <input_markdown_file.md>
# 示例:
lxrender my_document.md
# 这将生成 doc/my_document.tex
```

### 指定输出路径

你可以使用 `-o` 或 `--output` 标志指定自定义输出路径。

```bash
lxrender <input_markdown_file.md> -o <output_file.tex>
# 示例:
lxrender my_document.md -o output/final_doc.tex
```

## 功能支持

转换器目前支持以下 Markdown 功能：

*   **结构:** 标题 (H1-H4 映射到 LaTeX 章节, H5-H6 回退处理), 段落, 水平分割线。
*   **格式:** 加粗 (`**text**`), 斜体 (`*text*`), 行内代码 (`code`), 引用块 (`> text`)。
*   **列表:** 无序列表 (`*`, `-`) 和有序列表 (`1.`)，包括嵌套列表。
*   **代码块:** 带语言支持的围栏代码块 (使用 LaTeX `listings` 包)。
*   **数学公式:**
    *   行内公式: `$E=mc^2$`
    *   块级公式: `$$...$$`
*   **链接:** 标准 Markdown 链接 `[text](url)`。
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
