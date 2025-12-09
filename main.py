# main.py
import argparse
import os
from renderer import get_markdown_parser
from templates import ARTICLE_TEMPLATE

def convert_md_to_tex(input_path, output_path):
    # 1. 读取 Markdown 文件
    try:
        with open(input_path, 'r', encoding='utf-8') as f:
            md_content = f.read()
    except FileNotFoundError:
        print(f"Error: File '{input_path}' not found.")
        return

    # 2. 解析并转换内容 (AST -> LaTeX Body)
    parser = get_markdown_parser()
    tex_body = parser(md_content)

    # 3. 填充到完整模版中
    # 这里可以扩展：从元数据中提取 title 和 author
    full_tex = ARTICLE_TEMPLATE % {
        "title": "矩阵的特征值与特征向量",
        "subtitle": "计算方法与性质",
        "author": "马诺布尔",
        "content": tex_body
    }

    # 4. 写入结果
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(full_tex)
    
    print(f"Successfully converted '{input_path}' to '{output_path}'")

def main():
    # 设置命令行参数
    parser = argparse.ArgumentParser(description="Convert Markdown to LaTeX.")
    parser.add_argument("input", help="Path to input Markdown file")
    parser.add_argument("-o", "--output", help="Path to output TeX file")

    args = parser.parse_args()

    input_file = args.input
    # 如果没指定输出文件名，默认将 input.md 改为 input.tex
    output_file = args.output if args.output else os.path.splitext(input_file)[0] + ".tex"

    convert_md_to_tex(input_file, output_file)

if __name__ == "__main__":
    main()