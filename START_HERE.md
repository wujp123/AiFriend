# ⚡ 3 步开始

## 第 1 步：创建 Bot

Telegram 搜索 `@BotFather` → 发送 `/newbot` → 获得 Token

## 第 2 步：部署到 GitHub Pages

```bash
# 1. Fork 这个仓库到你的 GitHub

# 2. 在 GitHub 仓库设置中
Settings → Pages → Source: main → Folder: /public → Save

# 3. 等待几分钟，获得 URL：
https://你的用户名.github.io/AiFriend/
```

## 第 3 步：设置 Web App

回到 `@BotFather`：
```
/newapp
选择你的 Bot
输入标题：AiFriend
输入描述：AI 智能助手
粘贴 GitHub Pages URL
```

## 完成！🎉

在 Telegram 搜索你的 Bot → 发送 `/start` → 点击 "打开 AiFriend"

---

## 📝 配置 AI (重要)

首次使用时，需要配置 AI API：

### 方式 1：让用户自己填写（推荐）
- 打开应用
- 点击设置 ⚙️
- 输入你的 OpenAI 或 DeepSeek API Key
- 保存

### 方式 2：设置默认 API Key
编辑 `public/config.js`：
```javascript
export const config = {
  ai: {
    apiKey: '你的默认APIKey',
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-3.5-turbo'
  }
};
```

提交代码，GitHub Pages 会自动更新。

---

## 🆓 部署成本

**¥0/月**

- GitHub Pages: 免费
- Vercel: 免费
- Cloudflare Pages: 免费

---

## 📚 详细文档

- [完整 README](./README.md)
- [部署指南](./DEPLOY.md)
- [Telegram 设置](./TELEGRAM_SETUP.md)

---

有问题？查看 [常见问题](./README.md#-常见问题)
