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
    console.log('🌍 AI Language:', userLanguage);
    
    const role = getRole(roleId);
    // 不使用历史记录，避免历史语言影响当前回复
    // const history = storage.getConversationHistory(userId, roleId, 10);
    
    // 语言映射和强制指令
    const languageNames = {
      'zh': '中文 (Chinese)',
      'en': 'English',
      'ja': '日本語 (Japanese)',
      'ko': '한국어 (Korean)',
      'ru': 'русский (Russian)',
      'es': 'español (Spanish)',
      'fr': 'français (French)',
      'de': 'Deutsch (German)',
      'pt': 'português (Portuguese)',
      'ar': 'العربية (Arabic)'
    };
    
    const languageInstructions = {
      'zh': '你必须用中文回复所有消息。',
      'en': 'You MUST respond in English ONLY. Do NOT use Chinese, Japanese, or any other language.',
      'ja': 'すべてのメッセージに日本語のみで返信してください。',
      'ko': '모든 메시지에 한국어로만 응답해야 합니다.',
      'ru': 'Вы ДОЛЖНЫ отвечать только на русском языке.',
      'es': 'Debes responder solo en español.',
      'fr': 'Vous devez répondre uniquement en français.',
      'de': 'Sie müssen nur auf Deutsch antworten.',
      'pt': 'Você DEVE responder apenas em português.',
      'ar': 'يجب أن ترد باللغة العربية فقط.'
    };
    
    const currentLanguage = languageNames[userLanguage] || languageNames['en'];
    const languageInstruction = languageInstructions[userLanguage] || languageInstructions['en'];
    
    // 检查是否需要生成图片
    const shouldGenerateImage = imageService.shouldGenerateImage(message);
    let imageResult = null;
    
    if (shouldGenerateImage) {
      imageResult = await imageService.generateContextualSelfie(userId, roleId, message);
    }
    
    // 构建系统提示 - 语言指令放在最顶部
    const systemPrompt = `LANGUAGE INSTRUCTION: ${languageInstruction}
Response Language: ${currentLanguage}

${role.systemPrompt}${imageResult?.success ? '\n\n当你发送自拍或照片时，要自然地描述你当时的样子、心情、环境等，让对话更生动。' : ''}`;
    
    // 用户消息添加语言标记
    const userMessage = `[Response in: ${currentLanguage}]\n${message}`;
    
    console.log('📝 System prompt:', systemPrompt);
    console.log('📝 User message:', userMessage);
    
    // 构建消息列表
    const messages = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: userMessage
      }
    ];
    
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
      
      console.log('🤖 AI Response:', textReply);
      
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
