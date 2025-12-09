import mistune
from mistune import HTMLRenderer
from .utils import escape_latex


class LaTeXRenderer(HTMLRenderer):
    """
    自定义渲染器：将 Markdown AST 转换为 LaTeX 代码
    Mistune v3.x 稳定兼容版
    """

    # --- 文本处理 ---
    def text(self, text):
        return escape_latex(text)

    def paragraph(self, text):
        return f"{text}\n\n"

    def emphasis(self, text):
        return f"\\textit{{{text}}}"

    def strong(self, text):
        return f"\\textbf{{{text}}}"

    def codespan(self, text):
        return f"\\texttt{{{escape_latex(text)}}}"

    def link(self, link, text=None, title=None):
        return f"\\href{{{link}}}{{{text or link}}}"

    # --- 结构处理 ---
    def heading(self, text, level, **kwargs):
        cmds = {1: "section", 2: "subsection", 3: "subsubsection", 4: "paragraph"}
        cmd = cmds.get(level, "textbf")
        return f"\\{cmd}{{{text}}}\n"

    def thematic_break(self):
        return "\\noindent\\rule{\\textwidth}{0.4pt}\n"

    # --- 列表处理 ---
    def list(self, text, ordered, **kwargs):
        env = "enumerate" if ordered else "itemize"
        return f"\\begin{{{env}}}\n{text}\\end{{{env}}}\n"

    def list_item(self, text, **kwargs):
        return f"  \\item {text}\n"

    # --- 复杂块处理 ---
    def block_code(self, code, info=None):
        language = info if info else ""
        return (
            f"\\begin{{lstlisting}}[language={language}]\n{code}\\end{{lstlisting}}\n"
        )

    def block_quote(self, text):
        return f"\\begin{{quote}}\n{text}\\end{{quote}}\n"

    def image(self, src, alt="", title=None):
        return (
            f"\\begin{{figure}}[htbp]\n"
            f"  \\centering\n"
            f"  \\includegraphics[width=0.8\\textwidth]{{{src}}}\n"
            f"  \\caption{{{alt}}}\n"
            f"\\end{{figure}}\n"
        )

    # --- 数学公式核心逻辑 ---

    # 1. 原生 block_math (Markdown 里的块级公式)
    def block_math(self, text, **kwargs):
        # 这里的 text 是 Mistune 默认传的位置参数
        return f"\\[\n{text}\n\\]\n"

    # 2. 自定义 display_math (我们插件捕获的 $$...$$)
    # 【重点修改】不再依赖位置参数 text，而是直接从 kwargs 里取 'content'
    def display_math(self, content=None, **kwargs):
        # 优先取 content，如果没取到(理论上不可能)，尝试取 raw，再不行取 text
        final_text = content or kwargs.get("raw") or kwargs.get("text") or ""
        return f"\\[{final_text}\\]\n"

    # 3. 原生 inline_math (单个 $)
    def inline_math(self, content=None, **kwargs):
        final_text = content or kwargs.get("raw") or kwargs.get("text") or ""
        return f"\\( {final_text} \\)"


# --- 自定义插件逻辑 ---


def parse_inline_display_math(inline, m, state):
    """
    解析行内的 $$ ... $$
    """
    # 提取公式内容
    formula_content = m.group(0)[2:-2]  # Manual extraction

    # 我们不使用 'raw'，因为 Mistune 的 render_token 对 'raw' 的处理可能不包含传递位置参数。
    # 我们将内容放入 'attrs' 字典中，Key 叫 'content'。
    # Mistune 渲染时会调用：renderer.display_math(**attrs) -> display_math(content=...)
    state.append_token({"type": "display_math", "attrs": {"content": formula_content}})
    return m.end()


def plugin_display_math(md):
    # 正则：匹配 $...$，[\s\S] 允许跨行
    PATTERN = r"\$\$([\s\S]+?)\$\$"

    # 注册插件

    md.inline.register(
        "display_math", PATTERN, parse_inline_display_math, before="inline_math"
    )


def parse_inline_math(inline, m, state):
    """

    解析行内的 $ ... $

    """

    formula_content = m.group(0)[1:-1]  # Manual extraction

    state.append_token({"type": "inline_math", "attrs": {"content": formula_content}})

    return m.end()


def plugin_inline_math(md):

    # 正则：匹配 $...$

    PATTERN = r"\$(?!\$)([^$]+?)(?<!\$)\$"

    md.inline.register("inline_math", PATTERN, parse_inline_math, before="codespan")


def get_markdown_parser():

    markdown = mistune.create_markdown(renderer=LaTeXRenderer(), plugins=["table"])

    plugin_display_math(markdown)

    plugin_inline_math(markdown)

    return markdown
