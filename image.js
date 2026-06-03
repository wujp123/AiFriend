// AI 图片生成服务
import { getRole } from './roles.js';
import { storage } from './storage.js';

export class ImageService {
  constructor() {
    // 使用 Pollinations.ai - 完全免费的 AI 图片生成
    this.pollinationsUrl = 'https://image.pollinations.ai/prompt/';
    
    // 备用：Replicate（需要 API Key）
    this.replicateUrl = 'https://api.replicate.com/v1/predictions';
  }
  
  // 检查用户是否可以生成图片
  canGenerateImage(userId) {
    const user = storage.getUser(userId);
    
    // 会员无限制
    if (storage.isPremium(userId)) {
      return { allowed: true, reason: 'premium' };
    }
    
    // 检查今日免费额度
    const today = new Date().toDateString();
    if (!user.imageQuota) {
      user.imageQuota = { date: today, count: 1 };
      storage.updateUser(userId, user);
    }
    
    if (user.imageQuota.date !== today) {
      // 新的一天，重置额度
      user.imageQuota = { date: today, count: 1 };
      storage.updateUser(userId, user);
      return { allowed: true, reason: 'daily_quota', remaining: 0 };
    }
    
    if (user.imageQuota.count > 0) {
      return { allowed: true, reason: 'daily_quota', remaining: user.imageQuota.count };
    }
    
    return { allowed: false, reason: 'quota_exceeded' };
  }
  
  // 使用图片额度
  useImageQuota(userId) {
    if (storage.isPremium(userId)) {
      return true; // 会员无限制
    }
    
    const user = storage.getUser(userId);
    if (user.imageQuota && user.imageQuota.count > 0) {
      user.imageQuota.count--;
      storage.updateUser(userId, user);
      return true;
    }
    return false;
  }
  
  // 获取剩余图片额度
  getRemainingImageQuota(userId) {
    if (storage.isPremium(userId)) {
      return Infinity;
    }
    
    const user = storage.getUser(userId);
    const today = new Date().toDateString();
    
    if (!user.imageQuota || user.imageQuota.date !== today) {
      return 1; // 今日还未使用
    }
    
    return user.imageQuota.count;
  }
  
  // 生成角色自拍图片
  async generateSelfie(roleId, scenario = 'casual selfie') {
    const role = getRole(roleId);
    
    // 构建提示词
    const prompt = `${role.appearance}, ${scenario}, high quality, realistic, portrait photography, natural lighting, 8k`;
    
    // 使用 Pollinations.ai（完全免费）
    const imageUrl = this.generatePollinationsUrl(prompt);
    
    return {
      url: imageUrl,
      prompt: scenario,
      service: 'pollinations'
    };
  }
  
  // 生成 Pollinations.ai URL
  generatePollinationsUrl(prompt) {
    // URL 编码提示词
    const encodedPrompt = encodeURIComponent(prompt);
    
    // 添加参数：尺寸、种子等
    const width = 512;
    const height = 768;
    const seed = Math.floor(Math.random() * 100000);
    
    return `${this.pollinationsUrl}${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true`;
  }
  
  // 检测消息是否需要生成图片
  shouldGenerateImage(message) {
    const imageKeywords = [
      // 中文
      '自拍', '照片', '图片', '样子', '看看你', '发张', '发个', '来张',
      '早安', '晚安', '起床', '睡觉', '今天', '现在',
      '在干嘛', '在做什么', '穿的', '衣服',
      
      // 英文
      'selfie', 'photo', 'picture', 'look', 'show', 'send',
      'morning', 'night', 'today', 'now', 'wearing',
      
      // 日文  
      '自撮り', '写真', '見せて', '今', '朝', '夜'
    ];
    
    const lowerMessage = message.toLowerCase();
    return imageKeywords.some(keyword => lowerMessage.includes(keyword));
  }
  
  // 根据消息内容生成场景描述
  getScenarioFromMessage(message) {
    const scenarios = {
      // 时间相关
      '早安': 'just woke up, morning selfie, casual pajamas, bed',
      '晚安': 'goodnight selfie, night time, cozy pajamas',
      '起床': 'morning look, just woke up, messy hair',
      '睡觉': 'ready for bed, night time, sleepy',
      
      // 活动相关
      '运动': 'gym selfie, workout clothes, fitness',
      '工作': 'at work, professional outfit, office',
      '吃饭': 'dining, food selfie, restaurant',
      '咖啡': 'coffee shop, casual outfit, relaxed',
      
      // 心情相关
      '开心': 'happy smile, cheerful, bright',
      '难过': 'sad expression, comforting',
      '累': 'tired look, exhausted',
      
      // 默认
      'default': 'casual selfie, natural smile, everyday look'
    };
    
    // 匹配场景
    for (const [keyword, scenario] of Object.entries(scenarios)) {
      if (message.includes(keyword)) {
        return scenario;
      }
    }
    
    return scenarios.default;
  }
  
  // 生成带场景的自拍
  async generateContextualSelfie(userId, roleId, message) {
    // 检查权限
    const permission = this.canGenerateImage(userId);
    if (!permission.allowed) {
      return {
        success: false,
        reason: permission.reason,
        message: '今日免费图片额度已用完，升级会员可无限生成图片'
      };
    }
    
    // 获取场景
    const scenario = this.getScenarioFromMessage(message);
    
    try {
      // 生成图片
      const image = await this.generateSelfie(roleId, scenario);
      
      // 使用额度
      this.useImageQuota(userId);
      
      return {
        success: true,
        image: image,
        remaining: this.getRemainingImageQuota(userId)
      };
      
    } catch (error) {
      console.error('图片生成失败:', error);
      
      // 检查是否是速率限制错误
      if (error.message && error.message.includes('Queue full')) {
        return {
          success: false,
          reason: 'rate_limit',
          message: '图片服务繁忙，请稍后再试（免费服务有速率限制）'
        };
      }
      
      return {
        success: false,
        reason: 'generation_failed',
        message: '图片生成失败，请稍后重试'
      };
    }
  }
}

export const imageService = new ImageService();
