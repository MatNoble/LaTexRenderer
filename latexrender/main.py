import argparse
import shutil
import subprocess
from pathlib import Path
from typing import Optional, List

import frontmatter
from .renderer import get_markdown_parser
from .templates import ARTICLE_TEMPLATE

class LaTeXRenderer:
    """
    Core engine to convert Markdown to LaTeX and manage compilation.
    """
    
    IMAGE_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.pdf', '.svg'}

    def __init__(self, input_path: str, output_path: Optional[str] = None, template: str = 'matnoble'):
        self.input_path = Path(input_path)
        self.template = template
        self.output_path = Path(output_path) if output_path else self._get_default_output()
        self.output_dir = self.output_path.parent
        self.parser = get_markdown_parser()

    def _get_default_output(self) -> Path:
        return Path("doc") / f"{self.input_path.stem}.tex"

    def _ensure_output_dir(self):
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def _copy_resources(self, resource_dir: Path):
        """
        Copies resources while maintaining path compatibility for Markdown.
        """
        if not resource_dir.exists():
            return
            
        # 1. Copy .cls file to the root of output_dir (where .tex is)
        cls_file = resource_dir / f"{self.template}.cls"
        if cls_file.exists():
            shutil.copy2(cls_file, self.output_dir / cls_file.name)

        # 2. Recreate 'doc' directory in output_dir to support 'doc/image.png' paths
        # This is a 'First Principles' fix for relative path consistency.
        target_doc_dir = self.output_dir / "doc"
        target_doc_dir.mkdir(exist_ok=True)
        
        for item in resource_dir.iterdir():
            if item.suffix.lower() in self.IMAGE_EXTENSIONS:
                shutil.copy2(item, target_doc_dir / item.name)

    def _get_header(self, metadata: dict) -> str:
        title = metadata.get("title", "Untitled Document")
        subtitle = metadata.get("subtitle", "")
        author = metadata.get("author", "MatNoble")
        
        if self.template == "matnoble-teaching":
            return r"\maketitle"
            
        subtitle_fmt = rf"\large \textsf{{—— {subtitle} ——}}" if subtitle else ""
        return rf"""
\begin{{center}}
    \vspace*{{1cm}}
    \huge \bfseries {title}
    \vspace{{0.5em}} \\
    {subtitle_fmt}
    \vspace{{1.5cm}}
    
    %% 个人信息卡片
    \begin{{tcolorbox}}[colback=gray!5!white, colframe=black, width=0.8\textwidth, sharp corners]
        \centering
        \textbf{{整理：{author}}} \\[0.5em]
        \small
        微信公众号：\textbf{{数学思维探究社}} 	 | 	 博客：\url{{blog.matnoble.top}}
    \end{{tcolorbox}}
\end{{center}}
"""

    def render(self) -> bool:
        try:
            self._ensure_output_dir()
            with open(self.input_path, 'r', encoding='utf-8') as f:
                post = frontmatter.load(f)
            
            metadata = post.metadata
            md_body = post.content
            tex_body = self.parser(md_body)
            
            extra_preamble = []
            if self.template == "matnoble-teaching":
                fields = {
                    "course": "course",
                    "teaching_class": "teachingclass",
                    "teaching_time": "teachingtime",
                    "lesson_type": "lessonType"
                }
                for key, cmd in fields.items():
                    if val := metadata.get(key):
                        extra_preamble.append(rf"\{cmd}{{{val}}}")

            full_tex = ARTICLE_TEMPLATE % {
                "doc_class": self.template,
                "title": metadata.get("title", "Untitled"),
                "author": metadata.get("author", "MatNoble"),
                "date": metadata.get("date", r"\today"),
                "extra_preamble": "\n".join(extra_preamble),
                "header": self._get_header(metadata),
                "content": tex_body
            }

            with open(self.output_path, 'w', encoding='utf-8') as f:
                f.write(full_tex)
            return True
        except Exception as e:
            print(f"Render Error: {e}")
            return False

    def compile(self, clean: bool = True, resource_dir: Optional[Path] = None) -> bool:
        if resource_dir:
            self._copy_resources(resource_dir)
            
        # Use -pdf and -pdflatex to ensure proper xelatex handling
        cmd = ["latexmk", "-pdf", "-pdflatex=xelatex %O %S", "-interaction=nonstopmode", self.output_path.name]
        try:
            # Capture both stdout and stderr for better debugging
            result = subprocess.run(cmd, cwd=self.output_dir, check=True, capture_output=True, text=True)
            if clean:
                self.clean()
            return True
        except subprocess.CalledProcessError as e:
            print(f"Compile Error:\nSTDOUT: {e.stdout}\nSTDERR: {e.stderr}")
            return False
        except Exception as e:
            print(f"System Error: {e}")
            return False

    def clean(self):
        cmd = ["latexmk", "-c", self.output_path.name]
        subprocess.run(cmd, cwd=self.output_dir, capture_output=True)

def main():
    parser = argparse.ArgumentParser(description="LaTeX Renderer Core")
    parser.add_argument("input", help="Input Markdown file")
    parser.add_argument("-o", "--output", help="Output TeX file")
    parser.add_argument("-t", "--template", default="matnoble", help="Template name")
    parser.add_argument("--compile", action="store_true")
    parser.add_argument("--clean", action="store_true")
    args = parser.parse_args()
    renderer = LaTeXRenderer(args.input, args.output, args.template)
    if renderer.render():
        if args.compile:
            renderer.compile(clean=args.clean, resource_dir=Path("doc"))
        elif args.clean:
            renderer.clean()

if __name__ == "__main__":
    main()
