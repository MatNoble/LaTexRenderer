---
title: Markdown Syntax Example
subtitle: Showcase of Supported Features by LaTeXRender
author: MatNoble
---

# Heading 1: Project Overview

This document serves as an example of the Markdown syntax supported by the `LaTeXRender` project. It demonstrates how various Markdown elements are converted into a beautifully typeset PDF document using LaTeX.

## Heading 2: Text Formatting

This paragraph shows different text styles. You can have **bold text**, *italic text*, and even ***bold and italic*** combinations.

We now also support ~~strikethrough text~~, which is useful for indicating deletions or corrections.

For highlighting code snippets within a line, you can use `inline code`.

## Heading 2: Lists

### Unordered List
*   Item one
*   Item two
    *   Nested item A
    *   Nested item B
*   Item three

### Ordered List
1.  First item
2.  Second item
    1.  Nested ordered item 1
    2.  Nested ordered item 2
3.  Third item

## Heading 2: Links and Images

You can include [hyperlinks to external websites](https://www.google.com).

Here's an example of an image from your project's `doc` folder:
![WeChat Logo](doc/wechat-logo.png)

## Heading 2: Blockquotes

> This is a blockquote. It's used for citing sources or emphasizing certain text.
>
> > Nested blockquotes are also supported, indicating multiple levels of citation or emphasis.

## Heading 2: Code Blocks

Code blocks are rendered with syntax highlighting (if supported by LaTeX listings package).

```python
def factorial(n):
    if n == 0:
        return 1
    else:
        return n * factorial(n-1)

print(factorial(5))
```

```java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, Java!");
    }
}
```

## Heading 2: Tables

Tables are now correctly converted to LaTeX `tabular` environments with `booktabs` styling.

| Feature         | Status    | Notes                  |
| :-------------- | :-------- | :--------------------- |
| Headings        | Supported | H1-H4 map to sections  |
| Text Formatting | Supported | Bold, Italic, Strikethrough |
| Lists           | Supported | Ordered, Unordered, Nested |
| Tables          | Supported | Auto-detect columns    |
| Math            | Supported | Inline and Block       |

## Heading 2: Mathematics

Inline math expressions like $E=mc^2$ or $\alpha + \beta = \gamma$ are rendered beautifully.

Block-level mathematical equations are also supported, perfect for academic papers:

$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

Another example of a block equation:
$$
\sum_{k=1}^{n} k = \frac{n(n+1)}{2}
$$

## Heading 2: Horizontal Rule

A horizontal rule is displayed as a solid line:

---

This concludes the example of supported Markdown syntax.
