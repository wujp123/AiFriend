// Telegram 数据日志器
// 用于将用户数据发送到管理员的 Telegram

class TelegramLogger {
  constructor() {
    // 你的 Telegram Bot Token（从 @BotFather 获取）
    this.botToken = 'YOUR_BOT_TOKEN_HERE';
    
    // 你的 Telegram Chat ID（管理员的 Telegram ID 或频道 ID）
    this.adminChatId = 'YOUR_ADMIN_CHAT_ID_HERE';
    
    // API URL
    this.apiUrl = `https://api.telegram.org/bot${this.botToken}`;
    
    // 是否启用日志
    this.enabled = this.botToken !== 'YOUR_BOT_TOKEN_HERE';
    
    if (!this.enabled) {
      console.warn('⚠️ Telegram Logger not configured');
    }
  }
  
  // 发送消息到 Telegram
  async sendMessage(text, parseMode = 'Markdown') {
    if (!this.enabled) {
      console.log('📝 [Would send to Telegram]:', text);
      return;
    }
    
    try {
      const response = await fetch(`${this.apiUrl}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chat_id: this.adminChatId,
          text: text,
          parse_mode: parseMode
        })
      });
      
      const result = await response.json();
      
      if (result.ok) {
        console.log('✅ Message sent to Telegram');
      } else {
        console.error('❌ Failed to send to Telegram:', result);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Telegram API error:', error);
    }
  }
  
  // 记录新用户注册
  async logNewUser(user) {
    const text = `
🆕 *新用户注册*

👤 *用户信息*
• ID: \`${user.id}\`
• 名字: ${user.firstName || '-'}
• 用户名: @${user.username || '-'}
• 语言: ${user.language || '-'}

⏰ *时间*
${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}
    `.trim();
    
    await this.sendMessage(text);
  }
  
  // 记录用户支付
  async logPayment(payment) {
    const text = `
💰 *新支付记录*

👤 *用户*
• ID: \`${payment.userId}\`
• 名字: ${payment.userName || '-'}

📦 *套餐*
• 类型: ${payment.planId}
• 天数: ${payment.duration || '-'} 天
• 金额: $${payment.amount}

💳 *交易*
• TX ID: \`${payment.txId}\`
• 网络: TRON Mainnet
• 状态: ${payment.status || 'completed'}

⏰ *时间*
${new Date(payment.timestamp || Date.now()).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}
    `.trim();
    
    await this.sendMessage(text);
  }
  
  // 记录会员激活
  async logMembershipActivation(userId, userName, duration, expireDate) {
    const text = `
✨ *会员已激活*

👤 *用户*
• ID: \`${userId}\`
• 名字: ${userName || '-'}

⏱️ *会员信息*
• 时长: ${duration} 天
• 到期: ${new Date(expireDate).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}

⏰ *激活时间*
${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}
    `.trim();
    
    await this.sendMessage(text);
  }
  
  // 记录用户活跃（可选，根据需要开启）
  async logUserActivity(userId, userName, action, details = '') {
    const text = `
📊 *用户活动*

👤 ${userName || userId}
🔹 ${action}
${details ? '📝 ' + details : ''}

⏰ ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}
    `.trim();
    
    await this.sendMessage(text);
  }
  
  // 记录错误
  async logError(userId, error, context = '') {
    const text = `
❌ *错误报告*

👤 *用户*: \`${userId}\`
🔴 *错误*: ${error.message || error}
📍 *上下文*: ${context}

⏰ ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}
    `.trim();
    
    await this.sendMessage(text);
  }
  
  // 发送每日统计（可以设置定时任务）
  async sendDailyStats(stats) {
    const text = `
📈 *每日统计报告*

👥 *用户数据*
• 总用户: ${stats.totalUsers}
• 新增用户: ${stats.newUsers}
• 活跃用户: ${stats.activeUsers}
• 会员用户: ${stats.premiumUsers}

💰 *收入数据*
• 今日收入: $${stats.todayRevenue}
• 总收入: $${stats.totalRevenue}
• 支付笔数: ${stats.paymentCount}

📅 *日期*
${new Date().toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' })}
    `.trim();
    
    await this.sendMessage(text);
  }
}

// 导出单例
export const telegramLogger = new TelegramLogger();
