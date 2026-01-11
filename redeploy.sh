#!/bin/bash

# redeploy.sh - 自动重构建并清理悬空镜像

echo "=== 1. 开始构建并启动容器 ==="
# 运行 docker-compose 构建
docker-compose up -d --build

# 检查上一条命令是否执行成功
if [ $? -eq 0 ]; then
    echo ""
    echo "=== 2. 构建成功，正在清理旧镜像 (Dangling Images) ==="
    # 清理悬空镜像
    docker image prune -f
    echo ""
    echo "=== 3. 操作完成！ ==="
else
    echo ""
    echo "!!! 构建失败，已跳过清理步骤 !!!"
    exit 1
fi
