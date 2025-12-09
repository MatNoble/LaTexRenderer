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

This project requires Python 3.8+ and `Mistune` (v3).

1.  **Clone the repository (if applicable):**
    ```bash
    git clone <repository-url>
    cd <project-directory>
    ```

2.  **Install dependencies:**
    ```bash
    pip install mistune
    ```

## Usage

To convert a Markdown file to LaTeX, use the `main.py` script within the `latexrender` package.

### Basic Conversion

By default, the output `.tex` file will be placed in the `doc/` directory with the same base name as the input Markdown file.

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