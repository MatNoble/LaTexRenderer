% ========================================================== 
% MatNoble 的专属大学教案模板
% 文件名: matnoble-teaching.cls
% 适用场景: 大学教师备课、教学设计、教案编写
% ========================================================== 
\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{matnoble-teaching}[2025/12/21 v1.0 MatNoble Teaching Plan Class]

% 基于 article 类
\LoadClass[12pt, a4paper]{article}

% ================= 宏包加载 =================
\RequirePackage[dvipsnames]{xcolor}
\RequirePackage{amsmath, amssymb, amsfonts}
\RequirePackage[top=2cm, bottom=2.5cm, left=2cm, right=2cm]{geometry}
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
\RequirePackage{hyperref}
\RequirePackage{listings}
\RequirePackage[normalem]{ulem}
\RequirePackage{tabularx} % 用于制作教案头部表格

% ================= 字体设置 (沿用 matnoble 风格) =================
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
\RequirePackage{mathpazo}       
\RequirePackage[euler-digits,small]{eulervm} 
\newcommand*{\dif}{\mathop{}\!\mathrm{d}}

% ================= 教案专用元数据定义 =================
\newcommand{\@course}{课程名称}
\newcommand{\course}[1]{\renewcommand{\@course}{#1}}

\newcommand{\@teachingclass}{授课班级}
\newcommand{\teachingclass}[1]{\renewcommand{\@teachingclass}{#1}}

\newcommand{\@teachingtime}{\today}
\newcommand{\teachingtime}[1]{\renewcommand{\@teachingtime}{#1}}

\newcommand{\@lessonType}{理论课} % 默认课型
\newcommand{\lessonType}[1]{\renewcommand{\@lessonType}{#1}}

% ================= 重定义标题 (教案头部表格) =================
\renewcommand{\maketitle}{
    \begin{center}
        \LARGE \bfseries \@title
    \end{center}
    \vspace{0.5em}
    \noindent
    \begin{tcolorbox}[colback=white, colframe=black, sharp corners, boxrule=0.8pt]
        \begin{tabularx}{\textwidth}{@{} X X @{}}
            \textbf{课程名称：} \@course & \textbf{授课教师：} \@author \\
            \textbf{授课班级：} \@teachingclass & \textbf{授课时间：} \@teachingtime \\
            \textbf{课题类型：} \@lessonType & 
        \end{tabularx}
    \end{tcolorbox}
    \vspace{0.5em}
}

% ================= 教案专用盒子环境 =================

% 5. 教学过程 (Section 样式微调，保留 Article 的 section，但可以加图标或修饰)
% 暂时保持原生 section，依靠 Markdown 的二级标题转换

% 保留原有的公式盒子，方便教案中插入例题
\newtcolorbox{formulabox}[1][]{
  colback=blue!5!white,
  colframe=RoyalBlue,
  fonttitle=\bfseries\sffamily,
  sharp corners,
  title=\textbf{【核心公式】} #1
}

% 解析环境
\newenvironment{solution}{%
    \par\noindent\textbf{\textsf{【解析】}}\;
}{%
    \par\vspace{0.5em}%
}

% ================= 页眉页脚 (教师版) =================
\pagestyle{fancy}
\fancyhf{}

% 页眉
\lhead{\small \@course \textbullet \@title}
\rhead{\small 教师教案}

% 页脚
\lfoot{
    \footnotesize 
    \textbf{主理人：马诺布尔} \\ 
    % 如果有特定教师用的 logo 可以在这里替换
    公众号：数学思维探究社
}
\cfoot{\small 第 \thepage \ 页 / 共 \pageref{LastPage} 页}
\rfoot{
    \footnotesize 
    \today
}

\renewcommand{\headrulewidth}{0.4pt}
\renewcommand{\footrulewidth}{0.4pt}

% ================= 背景装饰 (横线网格) =================
\RequirePackage{eso-pic}
\AddToShipoutPictureBG{%
  \begin{tikzpicture}[remember picture, overlay]
    % 定义淡蓝色横线
    \foreach \y in {-1.5,-2.5,...,-26.5} {
      \draw[color=gray!20, line width=0.5pt] 
        (current page.north west) ++(1.5cm, \y cm) -- ++(18cm, 0);
    }
    % 定义淡红色竖线 (可选，模拟左侧装订线)
    % \draw[color=red!20, line width=0.8pt] 
    %   (current page.north west) ++(2.5cm, -1.5cm) -- ++(0, -25cm);
  \end{tikzpicture}%
}

\endinput
