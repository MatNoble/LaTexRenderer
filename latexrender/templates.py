# templates.py

# 基础文章模版
ARTICLE_TEMPLATE = r"""
\documentclass{matnoble}
\usepackage{listings} %% Required for code blocks

\begin{document}

%% ----------------- 封面/标题区 -----------------
\begin{center}
    \vspace*{1cm}
    \huge \bfseries %(title)s
    \vspace{0.5em} \\
    %(subtitle_formatted)s
    \vspace{1.5cm}
    
    %% 个人信息卡片 (封面特有)
    \begin{tcolorbox}[colback=gray!5!white, colframe=black, width=0.8\textwidth, sharp corners]
        \centering
        \textbf{整理：%(author)s} \\[0.5em]
        \small
        微信公众号：\textbf{数学思维探究社} \quad | \quad 博客：\url{blog.matnoble.top}
    \end{tcolorbox}
\end{center}

\vspace{1cm}

\tableofcontents

\vfill
{\centering
    \includegraphics[width=0.5\textwidth]{wechat_converted}
    \par
}

\newpage

%% ----------------- 正文内容开始 -----------------
%(content)s
%% ----------------- 正文内容开始 -----------------

\end{document}
"""