# Telegram Web App 配置指南

## 🎯 目标

让 AiFriend 在 Telegram 中作为 Web App 运行。

## 📋 前置要求

- ✅ 一个 Telegram 账号
- ✅ Node.js 已安装
- ✅ 项目已下载到本地

## 🚀 详细步骤

### 第一步：创建 Telegram Bot

1. **打开 Telegram**，搜索 `@BotFather`
   
2. **创建新 Bot**
   ```
   发送: /newbot
   ```

3. **设置 Bot 名称**
   ```
   输入: AiFriend
   （这是显示给用户的名称）
   ```

4. **设置 Bot 用户名**
   ```
   输入: my_aifriend_bot
   （必须以 bot 结尾，且全局唯一）
   ```

5. **获取 Token**
   - BotFather 会返回一个 Token
   - 格式类似：`123456789:ABCdefGHIjklMNOpqrsTUVwxyz`
   - **保存好这个 Token！**

### 第二步：配置项目

1. **进入项目目录**
   ```bash
   cd /Users/wujianpeng/Documents/webapp/AiFriend
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置环境变量**
   ```bash
   cp .env.example .env
   ```

4. **编辑 .env 文件**
   ```env
   BOT_TOKEN=你的Token（粘贴BotFather给的）
   PORT=3000
   ```

### 第三步：启动服务

1. **启动开发服务器**
   ```bash
   npm run dev
   ```

2. **确认服务正常**
   - 看到 "Web App 服务器运行在 http://localhost:3000"
   - 看到 "Bot 已启动"
   - **保持这个终端窗口运行**

### 第四步：配置 HTTPS（重要！）

Telegram Web App **必须使用 HTTPS**，开发时推荐用 ngrok：

1. **安装 ngrok**
   ```bash
   brew install ngrok
   ```

2. **启动 ngrok（新开一个终端）**
   ```bash
   ngrok http 3000
   ```

3. **获取 HTTPS URL**
   - ngrok 会显示类似这样的 URL：
   ```
   Forwarding    https://abc123.ngrok.io -> http://localhost:3000
   ```
   - **复制这个 HTTPS URL**（例如：`https://abc123.ngrok.io`）

### 第五步：在 BotFather 中设置 Web App

1. **回到 BotFather**
   ```
   发送: /newapp
   ```

2. **选择你的 Bot**
   - 点击你刚创建的 Bot（例如：my_aifriend_bot）

3. **设置 App 信息**
   - **标题**: `AiFriend`
   - **描述**: `AI智能助手，随时为你解答`
   - **上传图标**: 点击 "Skip" 或上传一个图片
   - **上传 GIF**: 点击 "Skip"

4. **输入 Web App URL**
   ```
   粘贴 ngrok 的 HTTPS URL：
   https://abc123.ngrok.io
   ```

5. **完成配置**
   - BotFather 会确认设置成功

### 第六步：测试 Bot

1. **在 Telegram 搜索你的 Bot**
   - 搜索：`@my_aifriend_bot`（你设置的用户名）

2. **开始对话**
   ```
   发送: /start
   ```

3. **打开 Web App**
   - 点击 "🚀 打开 AiFriend" 按钮
   - 应该会打开一个聊天界面

4. **开始聊天**
   - 在界面中输入消息
   - 点击发送
   - AI 会回复你！🎉

## 💡 使用方式

### 方式 1：Web App 界面（推荐）
- 在 Bot 中点击 "打开 AiFriend"
- 完整的聊天界面体验
- 支持 Telegram 主题

### 方式 2：直接发消息给 Bot
- 直接在 Telegram 聊天框输入
- Bot 会直接回复
- 适合快速提问

## 🔧 集成真实 AI

编辑 `bot.js` 文件，找到 `generateAIResponse` 函数：

```javascript
async function generateAIResponse(message) {
  // 示例：集成 OpenAI
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.AI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: message }]
    })
  });
  
  const data = await response.json();
  return data.choices[0].message.content;
}
```

## 📱 生产部署

开发测试通过后，部署到生产环境：

### 选项 1：Vercel
```bash
npm install -g vercel
vercel
```

### 选项 2：Heroku
```bash
git init
git add .
git commit -m "Initial commit"
heroku create
git push heroku main
```

### 选项 3：自己的 VPS
- 配置 Nginx + SSL
- 使用 Let's Encrypt 获取证书
- PM2 管理 Node.js 进程

**部署后记得更新 BotFather 中的 Web App URL！**

## ❓ 常见问题

**Q: ngrok 的 URL 每次都变怎么办？**
A: 免费版会变。解决方案：
- 购买 ngrok 付费版（$8/月）获得固定域名
- 直接部署到生产环境

**Q: Web App 打不开？**
A: 检查：
- 是否使用 HTTPS URL
- 服务器是否在运行
- ngrok 是否正常

**Q: Bot 不回复消息？**
A: 检查：
- .env 中的 Token 是否正确
- 终端是否有错误信息
- 网络连接是否正常

**Q: 如何更换 AI 服务？**
A: 修改 `bot.js` 中的 `generateAIResponse` 函数即可

## 🎉 完成！

现在你的 AiFriend 已经在 Telegram 中运行了！

试试以下命令：
- `/start` - 打开 Web App
- `/help` - 查看帮助
- `/about` - 关于信息

享受你的 AI 助手吧！ 🚀
