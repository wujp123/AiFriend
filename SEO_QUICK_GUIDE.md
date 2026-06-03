# 🚀 SEO 自动优化 - 快速指南

## ⚡ 快速开始

### 一键优化（推荐）

```bash
./seo-optimize.sh
```

这个脚本会：
1. ✅ 自动更新 sitemap.xml
2. ✅ 更新 robots.txt
3. ✅ 检查所有页面的 SEO
4. ✅ 生成 SEO 健康报告
5. ✅ 可选择提交和推送到 Git

### 单独运行工具

```bash
# 只更新 SEO 文件
node seo-auto-update.js

# 只监控 SEO 健康
node seo-monitor.js
```

## 📋 使用流程

### 每次更新内容后

```bash
# 1. 编辑你的 HTML 文件
# 2. 运行 SEO 优化
./seo-optimize.sh

# 3. 按提示选择是否提交和推送
```

### 检查网站 SEO 健康

```bash
node seo-monitor.js
```

输出示例：
```
🔍 开始 SEO 监控...
🌐 网站: https://wujp123.github.io/AiFriend/

✅ Sitemap 可访问 (状态码: 200)
✅ robots.txt 可访问 (状态码: 200)

📄 检查所有页面...
✅ 首页 - OK
✅ landing.html - OK
✅ blog.html - OK

🎯 SEO 健康得分: 95/100
🎉 优秀！SEO 配置完美！
```

## 🤖 自动化（已配置）

### GitHub Actions 自动运行

系统已配置为：
- ⏰ **每天自动运行** - UTC 00:00
- 📝 **推送 HTML 时运行** - 当你更新 HTML 文件时
- 🖱️ **手动触发** - 在 GitHub Actions 页面

### 查看自动化状态

1. 访问: https://github.com/wujp123/AiFriend/actions
2. 查看 "SEO Auto Update" 工作流
3. 查看运行历史和结果

## 📊 SEO 报告解读

### 健康得分

- **90-100分** 🎉 - 优秀，保持当前配置
- **70-89分** 👍 - 良好，有小问题需要修复
- **50-69分** ⚠️ - 需要改进
- **0-49分** ❌ - 紧急，需要立即修复

### 常见问题

#### "缺少 canonical 链接"
在 `<head>` 中添加：
```html
<link rel="canonical" href="https://wujp123.github.io/AiFriend/your-page.html">
```

#### "缺少 meta description"
在 `<head>` 中添加：
```html
<meta name="description" content="页面描述，80-160个字符">
```

#### "缺少结构化数据"
在页面底部添加：
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "页面标题",
  "description": "页面描述"
}
</script>
```

## 🎯 最佳实践

### DO ✅

- ✅ 每次更新内容后运行 SEO 优化
- ✅ 定期检查 SEO 健康得分
- ✅ 修复报告中的问题
- ✅ 在 Google Search Console 监控
- ✅ 保持 sitemap 与内容同步

### DON'T ❌

- ❌ 不要忽略 SEO 报告中的警告
- ❌ 不要手动编辑 sitemap.xml（使用脚本）
- ❌ 不要在管理页面添加 SEO 标签
- ❌ 不要忘记推送更新到 GitHub

## 🔧 故障排除

### Sitemap 无法访问

```bash
# 1. 重新生成
node seo-auto-update.js

# 2. 提交并推送
git add sitemap.xml public/sitemap.xml
git commit -m "fix: Update sitemap"
git push

# 3. 等待 2-3 分钟部署
# 4. 重新检查
node seo-monitor.js
```

### SEO 得分低

```bash
# 1. 查看详细报告
node seo-auto-update.js

# 2. 根据报告修复问题
# 3. 重新运行
./seo-optimize.sh
```

### GitHub Actions 失败

1. 访问 Actions 页面查看错误日志
2. 确保有正确的权限
3. 手动运行工具测试
4. 检查 .github/workflows/seo-auto-update.yml

## 📞 需要帮助？

查看完整文档：`SEO_AUTO_OPTIMIZATION.md`

---

**记住**：SEO 是一个持续的过程，定期运行这些工具保持网站优化！ 🚀
