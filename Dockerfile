# --- 第一阶段：编译前端 ---
FROM node:22-slim AS frontend-builder
WORKDIR /app/web
COPY web/package*.json ./
RUN npm install
COPY web/ ./
RUN npm run build

# --- 第二阶段：运行环境 ---
FROM python:3.9-slim-bookworm

# 设置非交互式安装，防止编译卡死
ENV DEBIAN_FRONTEND=noninteractive

# 安装 LaTeX 核心组件、中文支持和 Noto CJK 字体 (即思源系列)
RUN apt-get update && apt-get install -y --no-install-recommends \
    texlive-xetex \
    texlive-fonts-recommended \
    texlive-plain-generic \
    texlive-lang-chinese \
    latexmk \
    fonts-noto-cjk \
    fontconfig \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 安装 Python 项目依赖
COPY setup.py .
COPY latexrender/ ./latexrender/
RUN pip install --no-cache-dir -e .

# 拷贝后端与配置文件
COPY server/ ./server/
COPY start_app.py .
COPY doc/ ./doc/

# 拷贝第一阶段编译好的前端文件
COPY --from=frontend-builder /app/web/dist ./web/dist

# 确保 build 目录存在
RUN mkdir -p build

# 暴露 FastAPI 端口
EXPOSE 8000

# 启动应用
# 注意：在容器中运行，我们关闭自动打开浏览器功能，由用户手动访问
CMD ["python", "start_app.py"]
