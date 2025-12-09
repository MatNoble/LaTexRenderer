import unittest
import os
from latexrender.main import convert_md_to_tex
from latexrender.renderer import get_markdown_parser # To access the regex patterns for comparison if needed

# Define a temporary directory for test files
TEST_DIR = "temp_test_dir"

class TestMathRendering(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        """Set up a temporary directory for test files before any tests run."""
        os.makedirs(TEST_DIR, exist_ok=True)

    @classmethod
    def tearDownClass(cls):
        """Remove the temporary directory after all tests have run."""
        if os.path.exists(TEST_DIR):
            for filename in os.listdir(TEST_DIR):
                os.remove(os.path.join(TEST_DIR, filename))
            os.rmdir(TEST_DIR)

    def _run_conversion_and_read_output(self, md_content, test_name):
        """Helper to run the conversion and return the LaTeX output."""
        input_md_path = os.path.join(TEST_DIR, f"{test_name}.md")
        output_tex_path = os.path.join(TEST_DIR, f"{test_name}.tex")

        with open(input_md_path, 'w', encoding='utf-8') as f:
            f.write(md_content)
        
        # Call the conversion function directly
        convert_md_to_tex(input_md_path, output_tex_path)

        with open(output_tex_path, 'r', encoding='utf-8') as f:
            tex_output = f.read()
        # Normalize whitespace: replace newlines with spaces, replace multiple spaces with one, strip leading/trailing spaces
        normalized_output = ' '.join(tex_output.replace('\n', ' ').split()).strip()
        return normalized_output

    def test_inline_math_rendering(self):
        md_content = "This is an inline formula: $a^2 + b^2 = c^2$."
        expected_tex_part = r"This is an inline formula: \( a^2 + b^2 = c^2 \)."
        tex_output = self._run_conversion_and_read_output(md_content, "inline_math")
        self.assertIn(expected_tex_part, tex_output)

    def test_block_math_rendering(self):
        md_content = r"This is a block formula: $$e^x + \sin(y)$$"
        expected_tex_part = r"This is a block formula: \[e^x + \sin(y)\]"
        tex_output = self._run_conversion_and_read_output(md_content, "block_math")
        self.assertIn(expected_tex_part, tex_output)

    def test_mixed_math_and_text(self):
        md_content = (
            "# My Document\n\n"
            "Here is some text with an inline math $x^2$. "
            "And here is a block math equation:\n"
            r"$$ \int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2} $$" + "\n"
            "More text after the math."
        )
        expected_inline_tex = r"Here is some text with an inline math \( x^2 \)."
        expected_block_tex = r"And here is a block math equation: \[ \int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2} \]"
        tex_output = self._run_conversion_and_read_output(md_content, "mixed_math")
        self.assertIn(expected_inline_tex, tex_output)
        self.assertIn(expected_block_tex, tex_output)
    
    def test_math_with_chinese_characters(self):
        # Assuming LaTeX setup supports Chinese characters, though escaping is often needed.
        # For simplicity, just check if the formula itself is rendered correctly.
        md_content = "数学公式：$y = ax + b$。"
        expected_tex_part = r"数学公式：\( y = ax + b \)。"
        tex_output = self._run_conversion_and_read_output(md_content, "chinese_math")
        self.assertIn(expected_tex_part, tex_output)

    def test_math_with_leading_trailing_spaces(self):
        md_content = "Inline with spaces: $ x^2 $ and block with spaces: $$ y^3 $$"
        expected_inline = r"Inline with spaces: \( x^2 \) and block with spaces: \[ y^3 \]"
        tex_output = self._run_conversion_and_read_output(md_content, "spaced_math")
        self.assertIn(expected_inline, tex_output)


if __name__ == '__main__':
    unittest.main()