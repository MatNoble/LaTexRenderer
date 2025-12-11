# Markdown to LaTeX Converter

[English](README.md) | [简体中文](README_ZH.md)

This project provides a utility to convert Markdown files, especially those containing mathematical expressions, into LaTeX documents. It's designed for academic or technical writing where LaTeX is preferred for its typesetting quality.

## Project Structure

The project follows a standardized structure:

```
.
├── latexrender/          # Core source code package
│   ├── __init__.py       # Package initialization
│   ├── main.py           # Main conversion script
│   ├── renderer.py       # Custom Mistune LaTeX renderer
│   ├── templates.py      # LaTeX templates for document generation
│   └── utils.py          # Utility functions (e.g., LaTeX escaping)
├── tests/                # Unit tests for the converter
│   ├── __init__.py
│   └── test_math_rendering.py
├── doc/                  # Documentation, assets, and default output directory
│   ├── matnoble.cls      # LaTeX class file (example)
│   └── ...               # Other LaTeX assets or generated output
├── .gitignore            # Git ignore file
└── README.md             # Project README
```

## Installation

Before you begin, ensure you have the following prerequisites installed:

### Prerequisites

*   **LaTeX Distribution:** This project relies on `latexmk` for compiling `.tex` files to PDF. You will need a full LaTeX distribution (such as [TeX Live](https://www.tug.org/texlive/) or [MiKTeX](https://miktex.org/)) installed and configured in your system's PATH.
*   **Python:** Python 3.8 or higher is required.
*   **Python Packages:** `Mistune` (v3) and `python-frontmatter`.

### Installation Steps

1.  **Clone the repository (if applicable):**
    ```bash
    git clone <repository-url>
    cd <project-directory>
    ```

2.  **Install dependencies and the package:**
    This will install the required dependencies and register the `lxrender` command.
    ```bash
    pip install -e .
    ```

## Usage

### Using the CLI Command (`lxrender`)

After installation, you can use the `lxrender` command from anywhere in your terminal.

```bash
# Basic conversion
lxrender input.md

# Convert and compile to PDF
lxrender input.md --compile

# Convert, compile, and clean auxiliary files
lxrender input.md --compile --clean

# Specify output file
lxrender input.md -o output.tex
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
*   `title`: The main title of your document (defaults to "Untitled Document" if not provided).
*   `subtitle`: An optional subtitle (will not be displayed if not provided).
*   `author`: The author(s) of the document (defaults to "Unknown Author" if not provided).

### LaTeX Compilation and Cleanup

After converting Markdown to a `.tex` file, you can optionally compile it to PDF and clean up auxiliary files using `latexmk`. Ensure `latexmk` (part of a full LaTeX distribution like TeX Live or MiKTeX) is installed and available in your system's PATH.

*   **Compile to PDF**: Use the `--compile` flag.
    ```bash
    lxrender <input.md> --compile
    # This will convert <input.md> to doc/<input>.tex and then compile doc/<input>.tex to PDF.
    ```

*   **Clean auxiliary files**: Use the `--clean` flag.
    If used alone, it cleans auxiliary files for the `.tex` file generated from `<input.md>`.
    If used with `--compile`, it cleans auxiliary files *after* successful compilation.
    ```bash
    lxrender <input.md> --clean
    lxrender <input.md> --compile --clean
    ```

### Basic Conversion

If no output path is specified, the generated `.tex` file will be placed in the `doc/` directory with the same base name as the input Markdown file.

```bash
lxrender <input_markdown_file.md>
# Example:
lxrender my_document.md
# This will generate doc/my_document.tex
```

### Specifying Output Path

You can specify a custom output path using the `-o` or `--output` flag.

```bash
lxrender <input_markdown_file.md> -o <output_file.tex>
# Example:
lxrender my_document.md -o output/final_doc.tex
```

## Feature Support

The converter currently supports the following Markdown features:

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