# AiFriend - Telegram Web App AI 角色助手

**纯前端** · **无需服务器** · **免费部署**

一个运行在 Telegram Web App 中的 AI 角色扮演助手，支持多语言、多角色、会员系统。

## ✨ 功能特性

### 🎭 10+ 角色可选
- **女性角色**：御姐、萝莉、女总裁、护士、学姐、女明星
- **男性角色**：温柔男友、霸道总裁
- **奇幻角色**：狼人、吸血鬼

### 🌍 多语言支持
- 简体中文 (zh)
- English (en)
- 日本語 (ja)
- 自动检测 Telegram 语言

### 💎 会员系统
- 免费用户：每天 50 条消息
- 月度会员：100 Stars
- 年度会员：1000 Stars  
- 终身会员：3000 Stars
- 会员特权：无限对话 + 长期记忆 + 全部角色

### 🧠 长期记忆
- 自动保存对话历史
- 多角色独立记忆
- 会员可存储更多历史

## 🚀 快速开始

### 1. 创建 Telegram Bot
```
在 Telegram 搜索 @BotFather
发送 /newbot
按提示创建 Bot
```

### 2. 部署到 GitHub Pages
```bash
# Fork 或克隆本仓库
git clone https://github.com/你的用户名/AiFriend.git
cd AiFriend

# 推送到 GitHub
git add .
git commit -m "Deploy"
git push

# 在 GitHub 设置中启用 Pages
# 选择 main 分支 + /public 目录
```

### 3. 配置 Bot
```
回到 @BotFather
发送 /newapp
选择你的 Bot
输入 GitHub Pages URL
```

### 4. 完成！
在 Telegram 搜索你的 Bot，点击 "打开 AiFriend" 开始使用

## 📁 项目结构

```
AiFriend/
├── public/              # 前端应用（部署这个文件夹）
│   ├── index.html      # 主页面
│   ├── style.css       # 样式
│   ├── app.js          # 应用逻辑
│   ├── config.js       # 配置文件
│   ├── roles.js        # 角色定义（含头像）
│   ├── i18n.js         # 多语言
│   ├── storage.js      # 本地存储
│   ├── ai.js           # AI 服务
│   └── image.js        # 图片生成（新增）
├── bot.js              # Bot 测试脚本（可选）
├── package.json        # 依赖配置
├── DEPLOY.md          # 部署指南
└── IMAGE_FEATURE.md   # 图片功能说明（新增）
```

## 🛠️ 技术栈

- **前端**：纯 HTML + CSS + JavaScript (ES6+)
- **API**：Telegram Web App API
- **AI**：OpenAI / DeepSeek 等兼容接口
- **存储**：LocalStorage（无需数据库）
- **部署**：GitHub Pages / Vercel / Cloudflare Pages

## 🔧 配置 AI API

编辑 `public/config.js`：

```javascript
export const config = {
  ai: {
    apiKey: 'YOUR_API_KEY',  // 或让用户自己填写
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-3.5-turbo'
  }
};
```

**推荐**：让用户在设置中填入自己的 API Key（最安全）

## 💰 收费集成

使用 Telegram Stars 支付：

```javascript
tg.openInvoice(invoiceLink, (status) => {
  if (status === 'paid') {
    // 开通会员
    storage.setPremium(userId, days);
  }
});
```

## 📖 部署指南

详见 [DEPLOY.md](./DEPLOY.md)

支持平台：
- ✅ GitHub Pages（推荐）
- ✅ Vercel
- ✅ Cloudflare Pages
- ✅ Netlify

**部署成本：¥0/月** 🎉

## 🔒 安全提示

1. 不要在代码中硬编码 API Key
2. 使用环境变量或让用户自己填写
3. 对话数据只存储在用户设备
4. 定期提醒用户备份数据

## 📝 开发计划

- [ ] 更多角色
- [ ] 语音输入输出
- [ ] 图片理解
- [ ] 自定义角色
- [ ] 数据导入导出
- [ ] PWA 支持

## 💡 常见问题

**Q: 为什么不需要服务器？**
A: 所有逻辑在前端运行，数据存储在用户设备，AI API 直接调用。

**Q: 数据安全吗？**
A: 对话只存在用户设备，不会上传到任何服务器。

**Q: 如何自定义角色？**
A: 编辑 `public/roles.js`，添加新的角色配置。

**Q: 支持哪些 AI 服务？**
A: 任何兼容 OpenAI 格式的 API（OpenAI、DeepSeek、通义千问等）

## 📄 License

ISC

---

Made with ❤️ for Telegram
