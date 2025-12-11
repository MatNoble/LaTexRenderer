% ==========================================================
% MatNoble 的专属数学笔记模板
% 文件名: matnoble.cls
% ==========================================================
\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{matnoble}[2025/12/08 v1.0 MatNoble Custom Math Note Class]

% 基于 article 类
\LoadClass[12pt, a4paper]{article}

% ================= 宏包加载 =================
\RequirePackage{amsmath, amssymb, amsfonts}
\RequirePackage[top=2cm, bottom=2.5cm, left=2cm, right=2cm]{geometry} % 底部留宽一点给页脚
\RequirePackage{xeCJK}
\RequirePackage{fancyhdr}
\RequirePackage{lastpage}
\RequirePackage{graphicx}
\RequirePackage{enumitem}
\RequirePackage{tcolorbox}
\RequirePackage{tikz}
\RequirePackage{array}
\RequirePackage{booktabs}
\RequirePackage{multicol}
\RequirePackage{hyperref} % 让链接可以点击
\RequirePackage{listings} % 代码块支持
\RequirePackage[normalem]{ulem} % 删除线支持

% ================= 字体设置 =================
% 自动检测字体，保证编译不报错
\newcommand\fontnamesong{Source Han Serif SC}
\newcommand\fontnamehei{Source Han Sans SC}

\IfFontExistsTF{Noto Serif CJK SC}{\setCJKmainfont[AutoFakeBold]{Noto Serif CJK SC}}{%
  \IfFontExistsTF{\fontnamesong}{\setCJKmainfont[AutoFakeBold]{\fontnamesong}}{%
    \IfFontExistsTF{SimSun}{\setCJKmainfont[AutoFakeBold]{SimSun}}{\setCJKmainfont[AutoFakeBold]{STSong}}}}

\IfFontExistsTF{Noto Sans CJK SC}{\setCJKsansfont{Noto Sans CJK SC}}{%
  \IfFontExistsTF{\fontnamehei}{\setCJKsansfont{\fontnamehei}}{%
    \IfFontExistsTF{Microsoft YaHei}{\setCJKsansfont{Microsoft YaHei}}{\setCJKsansfont{STHeiti}}}}

% ================= 样式与汉化 =================
\punctstyle{kaiming}
\RequirePackage{setspace}
\setstretch{1.4} 
\RequirePackage[dvipsnames]{xcolor}
\RequirePackage{mathpazo}       
\RequirePackage[euler-digits,small]{eulervm} 
\newcommand*{\dif}{\mathop{}\!\mathrm{d}}

% 汉化目录标题
\renewcommand{\contentsname}{目\quad 录}

% ================= 个人品牌页眉页脚 =================
\pagestyle{fancy}
\fancyhf{}

% 页眉
% \lhead{\bfseries 高等数学（A）I 核心知识点速查}
% \rhead{\bfseries 期末复习宝典}

% 页脚 (个人信息展示区)
\lfoot{
    \footnotesize 
    \textbf{主理人：马诺布尔} \\ 
    \includegraphics[height=0.8em]{wechat-logo.png} % 这里可以换成微信图标
    公众号：数学思维探究社
}
\cfoot{\small 第 \thepage \ 页 / 共 \pageref{LastPage} 页}
\rfoot{
    \footnotesize 
    \href{https://blog.matnoble.top}{blog.matnoble.top} \\
    \href{https://memorize.matnoble.top}{memorize.matnoble.top}
}

% 页眉页脚分割线
\renewcommand{\headrulewidth}{0.4pt}
\renewcommand{\footrulewidth}{0.4pt}

% ================= 盒子环境定义 =================
% 1. 核心公式
\newtcolorbox{formulabox}[1][]{
  colback=blue!5!white,
  colframe=RoyalBlue,
  fonttitle=\bfseries\sffamily,
  sharp corners,
  title=\textbf{【核心公式】} #1
}

% 2. 解题技巧
\newtcolorbox{methodbox}[1][]{
  colback=orange!10!white,
  colframe=BrickRed,
  fonttitle=\bfseries\sffamily,
  sharp corners,
  title=\textbf{【解题方法与技巧】} #1
}

% 3. 易错警示
\newtcolorbox{warnbox}[1][]{
  colback=red!5!white,
  colframe=Red,
  fonttitle=\bfseries\sffamily,
  sharp corners,
  title=\textbf{【易错警示】} #1
}

% 4. 深度理解
\newtcolorbox{knowbox}[1][]{
  colback=ForestGreen!5!white,
  colframe=ForestGreen,
  fonttitle=\bfseries\sffamily,
  sharp corners,
  title=\textbf{【深度理解】} #1
}

% 5. 解析环境
\newenvironment{solution}{%
    \par\noindent\textbf{\textsf{【解析】}}\;%
}{%
    \par\vspace{0.5em}%
}

\endinput