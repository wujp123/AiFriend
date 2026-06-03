# 🚀 SEO 自动优化系统

这是一个自动化的 SEO 优化工具集，可以帮助你自动维护和更新网站的 SEO 配置。

## 📦 包含的工具

### 1. `seo-auto-update.js` - SEO 自动更新工具

**功能：**
- ✅ 自动扫描项目中的所有 HTML 文件
- ✅ 自动生成和更新 sitemap.xml
- ✅ 自动更新文件的 lastmod 日期
- ✅ 自动更新 robots.txt
- ✅ 检查所有页面的 SEO 配置
- ✅ 生成 SEO 健康报告

**使用方法：**
```bash
node seo-auto-update.js
```

### 2. `seo-monitor.js` - SEO 监控工具

**功能：**
- ✅ 检查 sitemap.xml 是否可访问
- ✅ 检查 robots.txt 是否可访问
- ✅ 检查所有页面是否正常访问
- ✅ 计算 SEO 健康得分
- ✅ 提供优化建议

**使用方法：**
```bash
node seo-monitor.js
```

### 3. `seo-optimize.sh` - 一键优化脚本

**功能：**
- ✅ 运行所有 SEO 工具
- ✅ 自动提交更改到 Git
- ✅ 可选择是否推送到远程仓库

**使用方法：**
```bash
./seo-optimize.sh
```

### 4. GitHub Actions 自动化

**自动触发时机：**
- ⏰ 每天 UTC 00:00 自动运行
- 📝 当 HTML 文件被推送到 main 分支时
- 🖱️ 可以手动触发

**位置：** `.github/workflows/seo-auto-update.yml`

## 🎯 使用场景

### 场景 1：每次更新内容后

```bash
# 编辑完 HTML 文件后
./seo-optimize.sh
```

这会：
1. 自动更新 sitemap
2. 检查 SEO 配置
3. 提交并推送更改

### 场景 2：定期检查 SEO 健康状况

```bash
node seo-monitor.js
```

这会显示：
- Sitemap 是否可访问
- robots.txt 是否正常
- 所有页面的可用性
- SEO 健康得分 (0-100)

### 场景 3：手动更新 SEO 文件

```bash
node seo-auto-update.js
```

这会：
1. 扫描所有 HTML 文件
2. 生成最新的 sitemap.xml
3. 更新 robots.txt
4. 生成 SEO 报告

## 📊 SEO 检查项

工具会自动检查每个页面是否包含：

- ✅ `<title>` 标签
- ✅ `<meta name="description">` 标签
- ✅ `<link rel="canonical">` 标签
- ✅ `<meta name="robots">` 标签
- ✅ Open Graph 标签 (og:*)
- ✅ 结构化数据 (Schema.org)

## 🔧 配置

### 修改基础 URL

编辑 `seo-auto-update.js` 和 `seo-monitor.js` 中的配置：

```javascript
const CONFIG = {
  baseUrl: 'https://wujp123.github.io/AiFriend/', // 修改为你的 URL
  // ...
};
```

### 添加或排除页面

编辑 `seo-auto-update.js` 中的配置：

```javascript
excludeFiles: [
  'admin.html',
  'test.html',
  'debug.html',
  // 添加更多要排除的文件
]
```

### 修改页面优先级

编辑 `seo-auto-update.js` 中的配置：

```javascript
defaultPriority: {
  '/': 1.0,
  'landing.html': 1.0,
  'blog.html': 0.9,
  // 添加更多页面
}
```

## 🤖 GitHub Actions 配置

### 启用自动化

工作流已经配置好，会在以下情况自动运行：
- 每天 UTC 00:00
- 推送 HTML 文件到 main 分支

### 手动触发

1. 访问你的 GitHub 仓库
2. 点击 "Actions" 标签
3. 选择 "SEO Auto Update"
4. 点击 "Run workflow"

### 查看运行结果

在 "Actions" 标签页可以看到：
- ✅ 运行成功或失败
- 📝 SEO 报告
- 🔄 更新了哪些文件

## 📈 SEO 得分说明

- **90-100分**: 🎉 优秀！SEO 配置完美
- **70-89分**: 👍 良好，但还有改进空间
- **50-69分**: ⚠️ 需要改进
- **0-49分**: ❌ 需要立即修复 SEO 问题

得分计算方式：
- Sitemap 可访问: 20 分
- robots.txt 可访问: 10 分
- 页面可用性: 70 分

## 🎓 最佳实践

### 1. 定期运行

建议每次更新内容后运行：
```bash
./seo-optimize.sh
```

### 2. 监控健康状况

每周检查一次 SEO 健康得分：
```bash
node seo-monitor.js
```

### 3. 保持 sitemap 更新

每次添加新页面后：
```bash
node seo-auto-update.js
git add sitemap.xml robots.txt
git commit -m "chore: Update SEO files"
git push
```

### 4. 检查 Google Search Console

1. 访问 [Google Search Console](https://search.google.com/search-console)
2. 检查 sitemap 状态
3. 查看索引覆盖率
4. 修复任何错误

## 🔍 故障排除

### sitemap.xml 无法访问

1. 确保文件在根目录和 public 目录都有
2. 运行 `./seo-optimize.sh` 重新生成
3. 等待 2-3 分钟让 GitHub Pages 部署
4. 清除浏览器缓存重试

### GitHub Actions 失败

1. 检查工作流文件语法
2. 确保有推送权限
3. 查看 Actions 日志找出错误

### SEO 得分低

1. 运行 `node seo-auto-update.js` 查看报告
2. 修复报告中提到的问题
3. 添加缺失的 meta 标签
4. 确保所有页面可访问

## 📚 相关资源

- [Google Search Console](https://search.google.com/search-console)
- [Sitemap 协议](https://www.sitemaps.org/)
- [robots.txt 规范](https://developers.google.com/search/docs/crawling-indexing/robots/intro)
- [Schema.org](https://schema.org/)
- [Open Graph Protocol](https://ogp.me/)

## 💡 提示

- ✅ 每次修改 HTML 文件后运行 SEO 更新
- ✅ 定期检查 Google Search Console
- ✅ 保持 sitemap 和内容同步
- ✅ 监控 SEO 健康得分
- ✅ 及时修复 SEO 问题

## 📝 版本历史

- **v1.0.0** (2026-06-03)
  - 初始版本
  - 自动 sitemap 生成
  - SEO 健康监控
  - GitHub Actions 集成

---

🎉 现在你拥有了一个完全自动化的 SEO 优化系统！
