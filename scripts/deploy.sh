#!/bin/bash

set -e

echo "========================================"
echo "  毛主席纪念网站 - 部署脚本"
echo "========================================"

APP_NAME="mao-memorial"
REGISTRY=""

usage() {
    echo "Usage: $0 [options]"
    echo "Options:"
    echo "  -b, --build          构建项目"
    echo "  -d, --deploy         部署到服务器"
    echo "  -r, --restart        重启服务"
    echo "  -c, --clean          清理构建缓存"
    echo "  -h, --help           显示帮助"
}

build() {
    echo "1. 清理旧构建..."
    rm -rf .next

    echo "2. 安装依赖..."
    npm ci --only=production

    echo "3. 构建项目..."
    npm run build

    echo "4. 构建 Docker 镜像..."
    docker build -t ${APP_NAME} .

    echo "✅ 构建完成"
}

deploy() {
    echo "1. 停止旧容器..."
    docker compose down

    echo "2. 启动新容器..."
    docker compose up -d

    echo "3. 查看容器状态..."
    docker compose ps

    echo "✅ 部署完成"
}

restart() {
    echo "重启服务..."
    docker compose restart

    echo "查看容器状态..."
    docker compose ps

    echo "✅ 重启完成"
}

clean() {
    echo "清理构建缓存..."
    rm -rf .next node_modules

    echo "清理 Docker 缓存..."
    docker system prune -f

    echo "✅ 清理完成"
}

case "$1" in
    -b|--build)
        build
        ;;
    -d|--deploy)
        deploy
        ;;
    -r|--restart)
        restart
        ;;
    -c|--clean)
        clean
        ;;
    -h|--help)
        usage
        exit 0
        ;;
    *)
        echo "运行完整部署流程..."
        build
        deploy
        ;;
esac