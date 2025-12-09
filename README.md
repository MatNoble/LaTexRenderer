# Markdown to LaTeX Converter

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

This project requires Python 3.8+, `Mistune` (v3), and `python-frontmatter`.

1.  **Clone the repository (if applicable):**
    ```bash
    git clone <repository-url>
    cd <project-directory>
    ```

2.  **Install dependencies:**
    ```bash
    pip install mistune python-frontmatter
    ```

## Usage

To convert a Markdown file to LaTeX, use the `main.py` script within the `latexrender` package. This converter supports **YAML Front Matter** for defining document metadata like title, subtitle, and author.

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
    python -m latexrender.main <input.md> --compile
    # This will convert <input.md> to doc/<input>.tex and then compile doc/<input>.tex to PDF.
    ```

*   **Clean auxiliary files**: Use the `--clean` flag.
    If used alone, it cleans auxiliary files for the `.tex` file generated from `<input.md>`.
    If used with `--compile`, it cleans auxiliary files *after* successful compilation.
    ```bash
    python -m latexrender.main <input.md> --clean
    python -m latexrender.main <input.md> --compile --clean
    ```

### Basic Conversion

If no output path is specified, the generated `.tex` file will be placed in the `doc/` directory with the same base name as the input Markdown file.

```bash
python -m latexrender.main <input_markdown_file.md>
# Example:
python -m latexrender.main my_document.md
# This will generate doc/my_document.tex
```

### Specifying Output Path

You can specify a custom output path using the `-o` or `--output` flag.

```bash
python -m latexrender.main <input_markdown_file.md> -o <output_file.tex>
# Example:
python -m latexrender.main my_document.md -o output/final_doc.tex
```

## Testing

Unit tests are located in the `tests/` directory. To run all tests, execute the following command from the project root:

```bash
python -m unittest discover tests
```

Or, to run a specific test file:

```bash
python -m unittest tests.test_math_rendering
```