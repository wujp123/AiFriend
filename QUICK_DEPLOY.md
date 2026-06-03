# ⚡ 快速部署 - 5分钟上线

## 当前状态 ✅
- [x] 项目代码已完成
- [x] Git 仓库已初始化
- [x] 代码已提交到本地
- [ ] **下一步：推送到 GitHub**

---

## 立即执行（复制粘贴）

### 1. 创建 GitHub 仓库
👉 打开浏览器访问：https://github.com/new

填写信息：
```
Repository name: AiFriend
Description: AI Role-play Assistant with Image Generation
Public ✓
不要勾选 Initialize with README
```

### 2. 推送代码到 GitHub

**替换 `你的用户名` 为你的 GitHub 用户名，然后执行：**

```bash
cd /Users/wujianpeng/Documents/webapp/AiFriend

git remote add origin https://github.com/你的用户名/AiFriend.git
git push -u origin main
```

### 3. 启用 GitHub Pages

在 GitHub 仓库页面：
```
Settings → Pages 
→ Source: Deploy from a branch
→ Branch: main
→ Folder: /public
→ Save
```

等待 1-3 分钟，你会看到：
```
✓ Your site is live at https://你的用户名.github.io/AiFriend/
```

### 4. 创建 Telegram Bot

在 Telegram 搜索 `@BotFather`：
```
发送: /newbot
名称: AiFriend
用户名: your_aifriend_bot (必须以bot结尾)
保存 Token: 123456789:ABCdef...
```

### 5. 配置 Web App

继续在 BotFather：
```
发送: /newapp
选择你的 Bot
Title: AiFriend
Description: AI智能助手
URL: https://你的用户名.github.io/AiFriend/
```

### 6. 测试

在 Telegram：
```
搜索: @your_aifriend_bot
发送: /start
点击: 打开 AiFriend
测试: 发送"早安"看看能否生成图片
```

---

## 🎉 完成！

你的 AiFriend 现在在线了：
- 🌐 网址：https://你的用户名.github.io/AiFriend/
- 🤖 Bot：@your_aifriend_bot

---

## ⚙️ 配置 AI（必需）

### 方式 1：用户自己配置（推荐）
- 用户打开应用 → 设置 → 输入 API Key

### 方式 2：设置默认 Key
编辑 `public/config.js`：
```javascript
ai: {
  apiKey: 'sk-你的Key',
  apiUrl: 'https://api.openai.com/v1/chat/completions',
  model: 'gpt-3.5-turbo'
}
```

提交并推送：
```bash
git add public/config.js
git commit -m "Update API config"
git push
```

---

## 🔄 后续更新

修改代码后：
```bash
git add .
git commit -m "描述修改内容"
git push
```

GitHub Pages 会自动更新（1-3分钟）

---

## 💡 重要提示

✅ **图片生成**：使用 Pollinations.ai，完全免费，无需配置
✅ **托管成本**：¥0（GitHub Pages免费）
✅ **AI 成本**：用户自带Key或你承担
✅ **域名**：可以绑定自定义域名（可选）

---

## 📞 遇到问题？

查看详细文档：
- `DEPLOYMENT_STEPS.md` - 完整部署步骤
- `README.md` - 项目说明
- `IMAGE_FEATURE.md` - 图片功能说明

---

**现在就去 https://github.com/new 创建仓库吧！** 🚀
