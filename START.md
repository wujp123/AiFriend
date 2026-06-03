# AiFriend 快速启动指南

## 🚀 第一次使用

### 步骤 1：创建 Telegram Bot

1. 打开 Telegram，搜索 [@BotFather](https://t.me/BotFather)
2. 发送命令：`/newbot`
3. 输入 Bot 名称（例如：AiFriend）
4. 输入 Bot 用户名（例如：my_aifriend_bot）
5. **保存** BotFather 给你的 Token

### 步骤 2：配置项目

```bash
cd /Users/wujianpeng/Documents/webapp/AiFriend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
```

编辑 `.env` 文件，填入你的 Bot Token：
```env
BOT_TOKEN=你从BotFather获得的Token
```

### 步骤 3：启动开发服务器

```bash
npm run dev
```

### 步骤 4：配置 Web App（需要 HTTPS）

**使用 ngrok（推荐用于开发测试）：**

```bash
# 安装 ngrok（如未安装）
brew install ngrok

# 在新终端窗口运行
ngrok http 3000
```

ngrok 会给你一个 HTTPS URL，例如：`https://abc123.ngrok.io`

### 步骤 5：在 BotFather 中设置 Web App

1. 回到 Telegram，找到 @BotFather
2. 发送命令：`/newapp`
3. 选择你刚创建的 Bot
4. 输入 App 标题：`AiFriend`
5. 输入描述：`AI智能助手`
6. 上传一个图标（可选）
7. 输入 Web App URL：你的 ngrok HTTPS URL（例如：`https://abc123.ngrok.io`）
8. 完成！

### 步骤 6：测试

1. 在 Telegram 中搜索你的 Bot
2. 点击"开始"或发送 `/start`
3. 点击"🚀 打开 AiFriend"按钮
4. 开始对话！🎉

## 📱 使用方式

### 方式 1：Web App（推荐）
- 在 Bot 中点击"打开 AiFriend"按钮
- 在 Web App 界面中聊天
- 享受完整的 UI 体验

### 方式 2：直接与 Bot 对话
- 直接在 Telegram 聊天框发送消息
- Bot 会直接回复
- 适合快速问答

## 🛠️ 开发配置

### 本地开发（HTTP）
```bash
npm run dev
# 访问：http://localhost:3000
```

### 配合 ngrok（HTTPS）
```bash
# 终端 1
npm run dev

# 终端 2
ngrok http 3000
```

### 生产部署
建议部署到支持 HTTPS 的平台：
- Vercel
- Heroku  
- Railway
- 自己的 VPS（配置 SSL）

## 🎯 下一步

### 集成 AI API

编辑 `bot.js` 文件中的 `generateAIResponse` 函数：

```javascript
async function generateAIResponse(message) {
  // 方案 1：OpenAI
  // const response = await openai.chat.completions.create({...});
  
  // 方案 2：Claude
  // const response = await anthropic.messages.create({...});
  
  // 方案 3：DeepSeek
  // const response = await fetch('https://api.deepseek.com/v1/chat/completions', {...});
  
  // 方案 4：其他 AI 服务
  // ...
}
```

### 添加数据库
- 存储对话历史
- 用户偏好设置
- 推荐使用 MongoDB、PostgreSQL 或 SQLite

### 自定义功能
- 添加快捷指令
- 集成其他 API
- 自定义主题
- 添加插件系统

## 💡 常见问题

**Q: 为什么需要 HTTPS？**
A: Telegram Web App 要求必须使用 HTTPS。开发时用 ngrok，生产环境部署到支持 HTTPS 的服务器。

**Q: ngrok 的 URL 会变吗？**
A: 免费版每次重启会变。可以购买 ngrok 付费版获得固定 URL，或直接部署到生产环境。

**Q: 如何更换 AI 服务？**
A: 修改 `bot.js` 中的 `generateAIResponse` 函数即可。

**Q: 如何自定义界面？**
A: 修改 `public/style.css` 和 `public/index.html`。

## 📚 相关文档

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Telegram Web Apps](https://core.telegram.org/bots/webapps)
- [ngrok 文档](https://ngrok.com/docs)

## 🎉 完成！

现在你的 AiFriend 已经可以在 Telegram 中使用了！

有问题随时查看文档或修改代码。祝开发愉快！ 🚀
