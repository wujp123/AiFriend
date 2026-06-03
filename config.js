// 配置文件 - 在这里设置你的 AI API
export const config = {
  // AI API 配置（使用 DeepSeek）
  ai: {
    provider: 'deepseek',
    apiKey: 'sk-283ebd6e5dfd47aebe815125e984c2a1',
    apiUrl: 'https://api.deepseek.com/v1/chat/completions',
    model: 'deepseek-chat',
  },
  
  // 会员价格（Telegram Stars）
  pricing: {
    monthly: 100,
    yearly: 1000,
    lifetime: 3000
  },
  
  // 免费额度
  freeQuota: {
    dailyMessages: 50,
    dailyImages: 1  // 每天 1 张免费图片
  },
  
  // 本地存储键名
  storageKeys: {
    user: 'aifriend_user',
    conversations: 'aifriend_conversations',
    settings: 'aifriend_settings'
  }
};
