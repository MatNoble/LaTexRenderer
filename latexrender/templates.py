# templates.py

# 通用文章模版
ARTICLE_TEMPLATE = r"""
\documentclass{%(doc_class)s}

%% --- 核心元数据 ---
\title{%(title)s}
\author{%(author)s}
\date{%(date)s}

%% --- 额外导言区 (根据不同模板动态插入) ---
%(extra_preamble)s

%% Allow graphics to be found in the parent directory (project root)
\graphicspath{{../}}

\begin{document}

%% --- 抬头/封面区 ---
%(header)s

\tableofcontents

\vfill
{\centering
    \includegraphics[width=0.5\textwidth]{wechat_converted}
    \par
}

\newpage

%% ----------------- 正文内容开始 -----------------
%(content)s
%% ----------------- 正文内容结束 -----------------

\end{document}
"""
