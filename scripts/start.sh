#!/bin/bash

set -e

echo "========================================"
echo "  毛主席纪念网站 - 启动脚本"
echo "========================================"

if [ ! -f ".env.local" ]; then
    echo "⚠️  未找到 .env.local 文件，复制模板..."
    cp .env.example .env.local
    echo "请编辑 .env.local 文件配置数据库连接"
    exit 1
fi

echo "1. 检查 Docker 服务..."
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker 服务未运行，请先启动 Docker"
    exit 1
fi

echo "2. 启动数据库服务..."
docker compose up -d mysql redis

echo "3. 等待数据库就绪..."
sleep 10

echo "4. 运行数据库迁移..."
npm run db:migrate

echo "5. 启动开发服务器..."
npm run dev

echo "✅ 服务启动完成"
echo "访问地址: http://localhost:3000"