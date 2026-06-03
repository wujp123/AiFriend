// AI API 调用
import { config } from './config.js';
import { getRole } from './roles.js';
import { storage } from './storage.js';
import { imageService } from './image.js';

export class AIService {
  constructor() {
    this.config = config.ai;
  }
  
  // 生成 AI 回复（可能包含图片）
  async generateResponse(userId, roleId, message, userLanguage = 'zh') {
    const role = getRole(roleId);
    const history = storage.getConversationHistory(userId, roleId, 10);
    
    // 语言映射
    const languageNames = {
      'zh': '中文',
      'en': 'English',
      'ja': '日本語',
      'ko': '한국어',
      'ru': 'Русский',
      'es': 'Español',
      'fr': 'Français',
      'de': 'Deutsch',
      'pt': 'Português',
      'ar': 'العربية'
    };
    
    const languageInstruction = `\n\nIMPORTANT: You must respond in ${languageNames[userLanguage] || 'English'} language. All your responses should be in ${languageNames[userLanguage] || 'English'}. Do not use other languages unless the user specifically asks.`;
    
    // 检查是否需要生成图片
    const shouldGenerateImage = imageService.shouldGenerateImage(message);
    let imageResult = null;
    
    if (shouldGenerateImage) {
      imageResult = await imageService.generateContextualSelfie(userId, roleId, message);
    }
    
    // 构建消息列表
    const messages = [
      {
        role: 'system',
        content: role.systemPrompt + languageInstruction + (imageResult?.success ? 
          '\n\n当你发送自拍或照片时，要自然地描述你当时的样子、心情、环境等，让对话更生动。' : '')
      }
    ];
    
    // 添加历史对话
    history.forEach(msg => {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    });
    
    // 添加当前消息
    messages.push({
      role: 'user',
      content: message
    });
    
    // 获取用户自定义 API Key（如果有）
    const user = storage.getUser(userId);
    const apiKey = user.apiKey || this.config.apiKey;
    
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
      throw new Error('请先配置 API Key');
    }
    
    try {
      const response = await fetch(this.config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: messages,
          temperature: 0.8,
          max_tokens: 500
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || '请求失败');
      }
      
      const data = await response.json();
      const textReply = data.choices[0].message.content;
      
      return {
        text: textReply,
        image: imageResult?.success ? imageResult.image : null,
        imageQuotaRemaining: imageResult?.success ? imageResult.remaining : imageService.getRemainingImageQuota(userId)
      };
      
    } catch (error) {
      console.error('AI API 错误:', error);
      throw error;
    }
  }
}

export const aiService = new AIService();
