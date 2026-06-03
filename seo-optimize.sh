#!/bin/bash

# SEO 自动优化脚本
# 使用方法: ./seo-optimize.sh

echo "🚀 开始 SEO 自动优化流程..."
echo ""

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

echo "✅ Node.js 已安装"
echo ""

# 运行 SEO 自动更新
echo "📝 步骤 1: 更新 Sitemap 和 robots.txt..."
node seo-auto-update.js

echo ""
echo "🔍 步骤 2: 监控 SEO 健康状况..."
node seo-monitor.js

echo ""
echo "📊 步骤 3: 准备提交到 Git..."

# 检查是否有更改
if [ -n "$(git status --porcelain)" ]; then
    echo "发现以下更改:"
    git status --short
    echo ""
    
    read -p "是否提交这些更改？(y/n): " answer
    
    if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
        # 添加更改
        git add sitemap.xml robots.txt public/sitemap.xml public/robots.txt 2>/dev/null
        
        # 提交
        current_date=$(date +"%Y-%m-%d")
        git commit -m "chore: Auto SEO update - $current_date"
        
        echo ""
        read -p "是否推送到远程仓库？(y/n): " push_answer
        
        if [ "$push_answer" = "y" ] || [ "$push_answer" = "Y" ]; then
            git push
            echo "✅ 已推送到远程仓库"
        else
            echo "⏭️  跳过推送"
        fi
    else
        echo "⏭️  跳过提交"
    fi
else
    echo "ℹ️  没有需要提交的更改"
fi

echo ""
echo "✨ SEO 优化流程完成！"
echo ""
echo "📋 下一步:"
echo "   1. 等待 2-3 分钟让 GitHub Pages 部署"
echo "   2. 在 Google Search Console 检查 sitemap 状态"
echo "   3. 定期运行此脚本保持 SEO 更新"
echo ""
