# Markdown to LaTeX Converter

[English](README.md) | [简体中文](README_ZH.md)

This project provides a utility to convert Markdown files, especially those containing mathematical expressions, into LaTeX documents. It's designed for academic or technical writing where LaTeX is preferred for its typesetting quality.

## Project Structure

The project follows a standardized structure:

```
.
├── latexrender/          # Core source code package
│   ├── main.py           # CLI entry point & core logic
│   ├── renderer.py       # Custom Mistune LaTeX renderer
│   └── templates.py      # LaTeX templates
├── server/               # FastAPI backend for GUI
│   └── main.py           # API endpoints & static file hosting
├── web/                  # React frontend source code
│   ├── src/              # React components
│   ├── dist/             # Compiled static assets (generated after build)
│   └── package.json      # Frontend dependencies
├── doc/                  # Documentation, assets, and templates
│   ├── matnoble.cls      # Standard student note template
│   ├── matnoble-teaching.cls # Teaching plan template
│   └── ...               # Assets (logos) & generated output
├── tests/                # Unit tests
├── start_app.py          # All-in-one GUI launcher script
├── setup.py              # Package installation config
├── .gitignore            # Git ignore file
└── README.md             # Project documentation
```

## Prerequisites

*   **LaTeX Distribution:** A full distribution like [TeX Live](https://www.tug.org/texlive/) or [MiKTeX](https://miktex.org/) is required for PDF compilation.
*   **Python:** Python 3.8 or higher is required.
*   **Node.js (Optional):** Required only if you want to modify and rebuild the frontend web interface.

## Installation

### 1. Quick Start (Conda / One-click)

We recommend using a Conda environment to manage dependencies.

```bash
# 1. Create and activate a new environment
conda create -n lxrender python=3.9 -y
conda activate lxrender

# 2. Install the project in editable mode (Install all dependencies)
pip install -e .
```
> **Note:** The command `pip install -e .` is **essential**. It installs all required Python packages (including FastAPI for the GUI) and registers the `lxrender` command globally in your environment.

### 2. Manual Installation

If you prefer `pip` without Conda, simply run:

```bash
# Install dependencies and register 'lxrender' in one go
pip install -e .
```

## Usage

### 1. GUI Mode (Recommended)

**Step 1: Build the Frontend (First time only)**
Before launching the app, you need to compile the React interface. This requires Node.js.

```bash
cd web
npm install
npm run build
cd ..
```

**Step 2: Launch the App**
Run the all-in-one script:

```bash
python start_app.py
```
This will start the FastAPI backend and serve the React frontend at `http://localhost:8000`.

> **Note:** If you modify the source code in `web/`, you must run `npm run build` again to apply changes.

### 2. CLI Command (`lxrender`)

```bash
# Basic conversion
lxrender input.md

# Use a specific template (e.g., teaching plan)
lxrender input.md --template matnoble-teaching

# Convert and compile to PDF
lxrender input.md --compile --clean
```

### Using Python directly

Alternatively, you can still run the script directly via Python:

### Document Metadata (YAML Front Matter)

You can specify document-specific metadata at the beginning of your Markdown file using a YAML block. This block must start and end with `---`.

Example:

```markdown
---
title: My Awesome Article
subtitle: An Introduction to LaTeX Conversion
author: John Doe
---

# Your Article Content

This is the main content of your Markdown document.
```

Supported metadata keys:
*   `title`: Main title.
*   `subtitle`: Optional subtitle (standard template).
*   `author`: Author name.
*   `course`: Course name (teaching template).
*   `teaching_class`: Target class (teaching template).
*   `lesson_type`: Type of lesson (teaching template).
*   `teaching_time`: Date/Time (teaching template).

## Feature Support

*   **Templates:** 
    *   `matnoble`: Standard math notes with author card.
    *   `matnoble-teaching`: Official teaching plan with info table and **grid background**.
*   **Structure:** Headings (H1-H4 map to LaTeX sections, H5-H6 fallback), Paragraphs, Horizontal Rules.
*   **Formatting:** Bold (`**text**`), Italic (`*text*`), Inline Code (`code`), Blockquotes (`> text`).
*   **Lists:** Unordered (`*`, `-`) and Ordered (`1.`) lists, including nested lists.
*   **Code Blocks:** Fenced code blocks with language support (using LaTeX `listings` package).
*   **Mathematics:** 
    *   Inline math: `$E=mc^2$`
    *   Block math: `$$...$$`
*   **Links:** Standard Markdown links `[text](url)`.
*   **Images:** Standard Markdown images `![alt](url)`.
*   **Strikethrough:** `~~text~~` syntax.
*   **Metadata:** YAML Front Matter for Title, Subtitle, and Author.

**Currently Unsupported / Limitations:**

*   **Task Lists:** `[ ]` / `[x]` syntax is not supported.
*   **Footnotes:** `[^1]` syntax is not supported.

## Testing

Unit tests are located in the `tests/` directory. To run all tests, execute the following command from the project root:

```bash
python -m unittest discover tests
```

Or, to run a specific test file:

```bash
python -m unittest tests.test_math_rendering
```
