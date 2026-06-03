# 🚀 无服务器部署指南

本项目是**纯前端应用**，无需服务器，可以免费部署到：

## 方案 1：GitHub Pages（推荐）

### 步骤 1：创建 GitHub 仓库

```bash
cd /Users/wujianpeng/Documents/webapp/AiFriend
git init
git add .
git commit -m "Initial commit"
```

在 GitHub 创建新仓库，然后：

```bash
git remote add origin https://github.com/你的用户名/AiFriend.git
git branch -M main
git push -u origin main
```

### 步骤 2：启用 GitHub Pages

1. 进入仓库设置 Settings
2. 找到 Pages 选项
3. Source 选择 `main` 分支
4. 文件夹选择 `/public`
5. 点击 Save

几分钟后，你的应用就会发布到：
`https://你的用户名.github.io/AiFriend/`

### 步骤 3：设置 Bot Web App URL

1. 打开 Telegram，找到 @BotFather
2. 发送 `/newapp` 或 `/myapps`
3. 选择你的 Bot
4. 输入 GitHub Pages 的 URL

完成！✅

---

## 方案 2：Vercel

### 部署步骤：

1. 访问 https://vercel.com
2. 登录并点击 "New Project"
3. 导入你的 GitHub 仓库
4. 设置：
   - Framework Preset: Other
   - Root Directory: `public`
5. 点击 Deploy

Vercel 会给你一个域名：`https://aifriend.vercel.app`

---

## 方案 3：Cloudflare Pages

### 部署步骤：

1. 访问 https://pages.cloudflare.com
2. 登录并连接 GitHub
3. 选择仓库
4. 设置：
   - Build output directory: `public`
5. Save and Deploy

---

## 方案 4：Netlify

### 部署步骤：

1. 访问 https://netlify.com
2. 登录并点击 "Add new site"
3. 导入 GitHub 仓库
4. 设置：
   - Publish directory: `public`
5. Deploy

---

## 配置 AI API

部署后，用户首次使用时需要：

### 选项 A：在设置中填入自己的 API Key
- 打开应用
- 进入设置
- 输入 OpenAI/DeepSeek API Key
- 保存

### 选项 B：修改默认配置
编辑 `public/config.js`：

```javascript
export const config = {
  ai: {
    apiKey: 'YOUR_DEFAULT_API_KEY', // 填入默认 Key
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-3.5-turbo'
  }
};
```

提交并重新部署。

---

## 🔒 安全建议

**不要在代码中硬编码 API Key！**

推荐方案：
1. 让用户自己填写 API Key（最安全）
2. 或者使用代理服务隐藏 API Key

---

## 📱 测试部署

部署后：

1. 在 Telegram 搜索你的 Bot
2. 发送 `/start`
3. 点击 "打开 AiFriend"
4. 开始使用！

---

## 💡 常见问题

**Q: 为什么不需要服务器？**
A: 所有数据存储在用户浏览器的 localStorage，AI API 直接从前端调用。

**Q: 数据安全吗？**
A: 对话历史只存在用户设备上，不会上传到任何服务器。

**Q: 如何更新应用？**
A: 修改代码后 git push，托管平台会自动重新部署。

**Q: 如何收费（Stars）？**
A: 使用 Telegram的 `window.Telegram.WebApp.openInvoice()` API创建发票。

---

## 🎉 完成！

现在你的 AiFriend 已经部署成功，完全不需要服务器！

成本：**¥0/月** 🎊
