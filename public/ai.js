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
      'zh': '⚠️ 重要指令：你必须用中文回复所有消息。不要使用英语、日语或任何其他语言。',
      'en': '⚠️ CRITICAL INSTRUCTION: You MUST respond in English only. Never use Chinese, Japanese, or any other language. This is mandatory.',
      'ja': '⚠️ 重要指令：すべてのメッセージに日本語のみで返信してください。他の言語を使用しないでください。',
      'ko': '⚠️ 중요 지침: 모든 메시지에 한국어로만 응답해야 합니다. 다른 언어를 사용하지 마세요.',
      'ru': '⚠️ ВАЖНАЯ ИНСТРУКЦИЯ: Вы ДОЛЖНЫ отвечать только на русском языке. Не используйте другие языки.',
      'es': '⚠️ INSTRUCCIÓN CRÍTICA: Debes responder solo en español. No uses otros idiomas.',
      'fr': '⚠️ INSTRUCTION CRITIQUE: Vous devez répondre uniquement en français. N\'utilisez pas d\'autres langues.',
      'de': '⚠️ KRITISCHE ANWEISUNG: Sie müssen nur auf Deutsch antworten. Verwenden Sie keine anderen Sprachen.',
      'pt': '⚠️ INSTRUÇÃO CRÍTICA: Você DEVE responder apenas em português. Não use outros idiomas.',
      'ar': '⚠️ تعليمات مهمة: يجب أن ترد باللغة العربية فقط. لا تستخدم لغات أخرى.'
    };
    
    const currentLanguage = languageNames[userLanguage] || languageNames['en'];
    const languageInstruction = languageInstructions[userLanguage] || languageInstructions['en'];
    
    // 检查是否需要生成图片
    const shouldGenerateImage = imageService.shouldGenerateImage(message);
    let imageResult = null;
    
    if (shouldGenerateImage) {
      imageResult = await imageService.generateContextualSelfie(userId, roleId, message);
    }
    
    // 在用户消息前添加语言提示
    const userMessageWithLanguage = `[Language: ${currentLanguage}] ${message}`;
    
    // 构建消息列表 - 语言指令放在系统提示最前面
    const messages = [
      {
        role: 'system',
        content: `${languageInstruction}\n\nYour response language: ${currentLanguage}\n\n${role.systemPrompt}` + (imageResult?.success ? 
          '\n\n当你发送自拍或照片时，要自然地描述你当时的样子、心情、环境等，让对话更生动。' : '')
      },
      {
        role: 'user',
        content: userMessageWithLanguage
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
