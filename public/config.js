// 配置文件 - 在这里设置你的 AI API
export const config = {
  // AI API 配置（示例：OpenAI 兼容接口）
  ai: {
    // 方案 1：OpenAI
    provider: 'openai',
    apiKey: 'YOUR_API_KEY_HERE', // 或者从用户设置中获取
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-3.5-turbo',
    
    // 方案 2：DeepSeek（更便宜）
    // provider: 'deepseek',
    // apiKey: 'YOUR_DEEPSEEK_API_KEY',
    // apiUrl: 'https://api.deepseek.com/v1/chat/completions',
    // model: 'deepseek-chat',
    
    // 方案 3：其他兼容 OpenAI 格式的 API
    // provider: 'custom',
    // apiKey: 'YOUR_API_KEY',
    // apiUrl: 'https://your-api-endpoint.com/v1/chat/completions',
    // model: 'your-model',
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
