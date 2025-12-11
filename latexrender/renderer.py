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

    def strikethrough(self, text):
        return f"\\sout{{{text}}}"

    def codespan(self, text):
        return f"\\texttt{{{escape_latex(text)}}}"

    def link(self, text, url, title=None):
        return f"\\href{{{url}}}{{{text or url}}}"

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

    def image(self, alt, url, title=None):
        return (
            f"\\begin{{figure}}[htbp]\n"
            f"  \\centering\n"
            f"  \\includegraphics[width=0.8\\textwidth]{{{url}}}\n"
            f"  \\caption{{{alt}}}\n"
            f"\\end{{figure}}\n"
        )

    # --- Table rendering ---
    def table(self, content: str, **attrs) -> str:
        """
        Render a table. 
        Note: Mistune v3 passes the rendered content of the table (thead + tbody) 
        as a single string 'content'. 'attrs' typically contains 'align'.
        """
        alignments = attrs.get('align', [])
        
        # Determine number of columns
        # 1. Try to get from alignments
        if alignments:
            num_cols = len(alignments)
        else:
            # 2. Fallback: Count columns from the first row of content
            # Content is roughly "Cell & Cell & \\ \n ..."
            first_row_end = content.find(r'\\')
            if first_row_end != -1:
                first_row = content[:first_row_end]
                # Count unescaped & (this is a simple heuristic, assuming & is separator)
                # Since we generate " & " in td/th, we can count that.
                num_cols = first_row.count('&') + 1
            else:
                num_cols = 1 # Default

        # Build column spec
        col_spec_parts = []
        if alignments:
            for a in alignments:
                if a == 'center':
                    col_spec_parts.append('c')
                elif a == 'right':
                    col_spec_parts.append('r')
                else:
                    col_spec_parts.append('l')
        else:
            col_spec_parts = ['l'] * num_cols
            
        col_spec = "".join(col_spec_parts)

        return (
            f"\\begin{{center}}\n" # Center the table
            f"\\begin{{tabular}}{{{col_spec}}}\n"
            f"\\toprule\n"
            f"{content}"
            f"\\bottomrule\n"
            f"\\end{{tabular}}\n"
            f"\\end{{center}}\n"
        )

    def table_head(self, content: str, **kwargs) -> str:
        # Robust handling: Mistune v3 might not call table_row for the header.
        # Check if the content already looks like a finished row (ends with \\)
        stripped = content.strip()
        if stripped.endswith(r"\\"):
            return f"{content}\\midrule\n"
        
        # If not, assume it's a sequence of cells ending with "& "
        content = content.rstrip()
        if content.endswith("&"):
            content = content[:-1]
        return f"{content} \\\\\n\\midrule\n"

    def table_body(self, content: str, **kwargs) -> str:
        return content

    def table_row(self, content: str, **kwargs) -> str:
        # Remove the trailing separator " & " added by table_cell
        content = content.rstrip() # Remove trailing whitespace/newlines from cells
        if content.endswith("&"):
            content = content[:-1] 
        return f"{content} \\\\\n"

    def table_cell(self, content: str, **kwargs) -> str:
        is_header = kwargs.get('header', False)
        # align = kwargs.get('align') # We are handling alignment in table() column spec currently
        if is_header:
            return f"\\textbf{{{content}}} & "
        return f"{content} & "

    # --- 数学公式核心逻辑 ---

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

    markdown = mistune.create_markdown(renderer=LaTeXRenderer(), plugins=["table", "strikethrough"])

    plugin_display_math(markdown)

    plugin_inline_math(markdown)

    return markdown
