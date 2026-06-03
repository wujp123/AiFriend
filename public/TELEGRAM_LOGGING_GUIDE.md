# 📊 Telegram 数据日志配置指南

## 🎯 功能说明

通过 Telegram Bot，将所有用户的关键操作（注册、支付、会员激活等）实时发送到你的 Telegram，无需搭建服务器！

## ✅ 优势

- ✅ **无需后端服务器**：纯前端实现
- ✅ **实时通知**：用户操作立即通知
- ✅ **数据集中**：所有用户数据发送到你的 Telegram
- ✅ **免费使用**：Telegram Bot API 完全免费
- ✅ **跨设备同步**：Telegram 自动同步到所有设备
- ✅ **搜索方便**：可以搜索用户ID、交易ID等

---

## 🚀 快速配置（3步）

### 第1步：创建 Telegram Bot

1. 在 Telegram 中搜索 `@BotFather`
2. 发送 `/newbot` 命令
3. 按提示输入 Bot 名称（比如：`iFriendly Logger`）
4. 按提示输入 Bot 用户名（比如：`ifriendly_logger_bot`）
5. 获得 **Bot Token**（格式：`1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`）

**重要**：保存好这个 Token，不要泄露给别人！

### 第2步：获取你的 Chat ID

**方法1：使用 @userinfobot（推荐）**
1. 在 Telegram 搜索 `@userinfobot`
2. 点击 START
3. 机器人会显示你的 User ID（比如：`123456789`）

**方法2：使用 @getidsbot**
1. 在 Telegram 搜索 `@getidsbot`
2. 点击 START
3. 查看你的 Chat ID

**方法3：创建频道接收（适合团队）**
1. 创建一个 Telegram 频道（比如：`iFriendly 数据日志`）
2. 将你的 Bot 添加为频道管理员
3. 使用频道 ID（格式：`-1001234567890`，注意有负号）

### 第3步：配置代码

编辑 `telegram-logger.js` 文件：

```javascript
class TelegramLogger {
  constructor() {
    // 🔑 填入你的 Bot Token（从 BotFather 获取）
    this.botToken = '1234567890:ABCdefGHIjklMNOpqrsTUVwxyz';
    
    // 📱 填入你的 Chat ID（从 userinfobot 获取）
    this.adminChatId = '123456789';
    
    // ... 其他代码保持不变
  }
}
```

---

## 📝 集成到应用

### 1. 在 `app.js` 中引入

```javascript
// 在文件顶部添加
import { telegramLogger } from './telegram-logger.js';
```

### 2. 记录新用户注册

在 `init()` 函数中，添加：

```javascript
// 如果是新用户，记录到 Telegram
if (!currentUser.firstName) {
  storage.updateUser(userId, userInfo);
  currentUser = storage.getUser(userId);
  
  // 📝 发送新用户通知
  await telegramLogger.logNewUser(currentUser);
}
```

### 3. 记录支付成功

在 `verifyPaymentForUser()` 函数中，添加：

```javascript
if (result.success) {
  // 记录支付信息
  const payment = {
    userId: currentUser.id,
    userName: currentUser.firstName || currentUser.username,
    planId: planId,
    amount: amount,
    duration: duration,
    txId: result.txId,
    timestamp: result.timestamp,
    status: 'completed'
  };
  
  // 保存到 localStorage
  const payments = JSON.parse(localStorage.getItem('ifriendly_payments') || '[]');
  payments.push(payment);
  localStorage.setItem('ifriendly_payments', JSON.stringify(payments));
  
  // 📝 发送支付通知
  await telegramLogger.logPayment(payment);
  
  // 激活会员...
}
```

### 4. 记录会员激活

在 `activatePremium()` 函数中，添加：

```javascript
function activatePremium(days) {
  const expireDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  
  currentUser.isPremium = true;
  currentUser.premiumUntil = expireDate.toISOString();
  storage.updateUser(currentUser.id, currentUser);
  
  // 📝 发送会员激活通知
  telegramLogger.logMembershipActivation(
    currentUser.id,
    currentUser.firstName || currentUser.username,
    days,
    expireDate
  );
  
  // 显示成功消息...
}
```

---

## 📊 接收的通知类型

### 1. 新用户注册

```
🆕 新用户注册

👤 用户信息
• ID: 123456789
• 名字: 张三
• 用户名: @zhangsan
• 语言: zh

⏰ 时间
2024-12-10 15:30:00
```

### 2. 用户支付

```
💰 新支付记录

👤 用户
• ID: 123456789
• 名字: 张三

📦 套餐
• 类型: monthly
• 天数: 30 天
• 金额: $5

💳 交易
• TX ID: 0x1234...abcd
• 网络: TRON Mainnet
• 状态: completed

⏰ 时间
2024-12-10 15:35:00
```

### 3. 会员激活

```
✨ 会员已激活

👤 用户
• ID: 123456789
• 名字: 张三

⏱️ 会员信息
• 时长: 30 天
• 到期: 2025-01-09 15:35:00

⏰ 激活时间
2024-12-10 15:35:00
```

### 4. 每日统计（可选）

```
📈 每日统计报告

👥 用户数据
• 总用户: 150
• 新增用户: 5
• 活跃用户: 38
• 会员用户: 42

💰 收入数据
• 今日收入: $25
• 总收入: $680
• 支付笔数: 3

📅 日期
2024-12-10
```

---

## 🔧 高级配置

### 使用频道接收（推荐团队使用）

**优势**：
- 多人可以查看
- 消息不会混在私聊中
- 可以设置为私密频道

**步骤**：
1. 创建一个 Telegram 频道
2. 将你的 Bot 添加为管理员
3. 给频道发一条消息
4. 访问：`https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
5. 查找 `"chat":{"id":-1001234567890}` 获取频道ID
6. 在代码中使用这个 ID（包含负号）

### 消息格式化

支持 Markdown 格式：
- `*粗体*`
- `_斜体_`
- `` `代码` ``
- `[链接](URL)`

### 添加按钮（进阶）

可以在消息中添加按钮，比如"查看详情"、"确认"等：

```javascript
await fetch(`${this.apiUrl}/sendMessage`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    chat_id: this.adminChatId,
    text: '💰 新支付: $5',
    reply_markup: {
      inline_keyboard: [[
        { text: '✅ 确认', callback_data: 'confirm_123' },
        { text: '❌ 拒绝', callback_data: 'reject_123' }
      ]]
    }
  })
});
```

---

## 🎨 自定义日志

### 添加自定义事件

在 `telegram-logger.js` 中添加新方法：

```javascript
// 记录用户更换角色
async logRoleChange(userId, userName, oldRole, newRole) {
  const text = `
🎭 *角色切换*

👤 ${userName || userId}
🔄 ${oldRole} → ${newRole}

⏰ ${new Date().toLocaleString('zh-CN')}
  `.trim();
  
  await this.sendMessage(text);
}
```

在 `app.js` 中调用：

```javascript
function selectRole(roleId) {
  const oldRole = currentUser.currentRole;
  currentUser.currentRole = roleId;
  storage.updateUser(currentUser.id, currentUser);
  
  // 记录角色切换
  telegramLogger.logRoleChange(
    currentUser.id,
    currentUser.firstName,
    oldRole,
    roleId
  );
}
```

---

## 📈 统计数据收集

### 方法1：定时发送（需要有人保持页面打开）

```javascript
// 在 app.js 中添加
setInterval(async () => {
  // 只在管理员设备上执行
  if (currentUser.id === 'YOUR_ADMIN_USER_ID') {
    const stats = calculateDailyStats();
    await telegramLogger.sendDailyStats(stats);
  }
}, 24 * 60 * 60 * 1000); // 每24小时
```

### 方法2：手动触发

在管理后台添加按钮：

```html
<button onclick="sendStatsToTelegram()">📊 发送统计到 Telegram</button>
```

```javascript
async function sendStatsToTelegram() {
  const users = JSON.parse(localStorage.getItem('ifriendly_users') || '{}');
  const payments = JSON.parse(localStorage.getItem('ifriendly_payments') || '[]');
  
  const stats = {
    totalUsers: Object.keys(users).length,
    premiumUsers: Object.values(users).filter(u => 
      u.isPremium && new Date(u.premiumUntil) > new Date()
    ).length,
    totalRevenue: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
    paymentCount: payments.length
  };
  
  await telegramLogger.sendDailyStats(stats);
  alert('✅ 统计已发送到 Telegram！');
}
```

---

## 🔒 安全建议

### 1. 保护 Bot Token

❌ **不要**：将 Token 硬编码在前端代码中（会被用户看到）

✅ **推荐方案**：
- 将 Token 存储在环境变量（如果使用构建工具）
- 或使用简单的代理服务（Cloudflare Workers 免费）

### 2. Cloudflare Workers 代理（推荐）

创建一个 Cloudflare Worker（免费）：

```javascript
// worker.js
export default {
  async fetch(request) {
    const BOT_TOKEN = 'YOUR_BOT_TOKEN'; // 在 Worker 中存储
    const ADMIN_CHAT_ID = 'YOUR_CHAT_ID';
    
    if (request.method === 'POST') {
      const body = await request.json();
      
      // 转发到 Telegram
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: ADMIN_CHAT_ID,
          text: body.text,
          parse_mode: 'Markdown'
        })
      });
      
      return new Response('OK');
    }
    
    return new Response('Not Found', { status: 404 });
  }
};
```

在前端调用：

```javascript
// telegram-logger.js
async sendMessage(text) {
  await fetch('https://your-worker.workers.dev', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
}
```

### 3. 限流保护

防止滥用：

```javascript
// 限制每个用户的发送频率
const userLastSent = {};

async sendMessage(text, userId = null) {
  if (userId) {
    const now = Date.now();
    const lastSent = userLastSent[userId] || 0;
    
    if (now - lastSent < 60000) { // 1分钟内只能发送1次
      console.log('Rate limited');
      return;
    }
    
    userLastSent[userId] = now;
  }
  
  // 发送消息...
}
```

---

## 🧪 测试

### 测试 Bot 配置

在浏览器控制台执行：

```javascript
// 测试发送消息
fetch('https://api.telegram.org/bot<YOUR_BOT_TOKEN>/sendMessage', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    chat_id: '<YOUR_CHAT_ID>',
    text: '🧪 测试消息\n\nBot 配置成功！'
  })
}).then(r => r.json()).then(console.log);
```

### 测试完整流程

1. 创建测试用户
2. 模拟支付
3. 检查 Telegram 是否收到通知

---

## 📱 Telegram Bot 命令（可选）

可以给 Bot 添加交互命令：

### 创建命令处理 Worker

```javascript
// Cloudflare Worker with webhook
export default {
  async fetch(request) {
    const data = await request.json();
    
    if (data.message) {
      const text = data.message.text;
      const chatId = data.message.chat.id;
      
      // 处理命令
      if (text === '/stats') {
        // 返回统计数据
        await sendStats(chatId);
      } else if (text === '/users') {
        // 返回用户列表
        await sendUsers(chatId);
      }
    }
    
    return new Response('OK');
  }
};
```

### 设置 Webhook

```bash
curl https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook \
  -d "url=https://your-worker.workers.dev"
```

---

## 🎯 完整示例

参考 `app.js` 中的集成示例：

1. **新用户注册** → 发送通知
2. **用户支付** → 发送通知 + 保存记录
3. **会员激活** → 发送通知
4. **每日统计** → 定时发送

---

## ❓ 常见问题

### Q1: Bot Token 会被用户看到吗？

A: 如果直接写在前端代码中，会被看到。建议使用 Cloudflare Workers 代理。

### Q2: 免费吗？

A: Telegram Bot API 完全免费，无限制。Cloudflare Workers 每天有 10万 次免费请求。

### Q3: 如何防止刷消息？

A: 添加限流逻辑（见上文"限流保护"）。

### Q4: 可以接收图片吗？

A: 可以！使用 `sendPhoto` 方法发送图片。

### Q5: 多个管理员怎么办？

A: 使用频道接收，或将消息发送到多个 Chat ID。

---

## 🚀 部署清单

- [ ] 创建 Telegram Bot（@BotFather）
- [ ] 获取 Bot Token
- [ ] 获取 Chat ID（@userinfobot）
- [ ] 配置 `telegram-logger.js`
- [ ] 在 `app.js` 中集成日志
- [ ] 测试发送消息
- [ ] 部署到 GitHub Pages
- [ ] （可选）配置 Cloudflare Workers 代理

---

**配置完成后，你将实时收到所有用户的操作通知！** 🎉

**文档版本**: 1.0  
**创建日期**: 2024-12-10  
**适用场景**: 纯前端应用的数据监控
