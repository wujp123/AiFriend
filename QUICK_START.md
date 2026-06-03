# ⚡ 5 分钟快速启动

## 第 1 步：创建 Bot（2 分钟）

1. Telegram 搜索 `@BotFather`
2. 发送 `/newbot`
3. 按提示操作，获得 Token

## 第 2 步：配置（1 分钟）

```bash
cd /Users/wujianpeng/Documents/webapp/AiFriend
npm install
cp .env.example .env
```

编辑 `.env`，粘贴你的 Token：
```
BOT_TOKEN=你的Token
```

## 第 3 步：启动（1 分钟）

**终端 1：启动服务**
```bash
npm run dev
```

**终端 2：启动 ngrok**
```bash
ngrok http 3000
```

复制 ngrok 的 HTTPS URL（类似 `https://abc123.ngrok.io`）

## 第 4 步：设置 Web App（1 分钟）

回到 BotFather：
1. 发送 `/newapp`
2. 选择你的 Bot
3. 填写信息
4. 粘贴 ngrok 的 HTTPS URL

## 第 5 步：开始使用！

1. Telegram 搜索你的 Bot
2. 发送 `/start`
3. 点击 "打开 AiFriend"
4. 开始聊天！🎉

---

详细说明请看：
- [完整配置指南](./TELEGRAM_SETUP.md)
- [启动说明](./START.md)
- [项目文档](./README.md)
