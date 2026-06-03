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
    console.log('🌍 System Language:', userLanguage);
    console.log('📝 User Message:', message);
    
    const role = getRole(roleId);
    
    // 检测用户消息的语言
    const detectedLanguage = this.detectMessageLanguage(message);
    console.log('🔍 Detected Message Language:', detectedLanguage);
    
    // 使用检测到的语言，而不是系统设置的语言
    const responseLanguage = detectedLanguage;
    
    // 语言映射和指令
    const languageNames = {
      'zh': '中文',
      'en': 'English',
      'ja': '日本語',
      'ko': '한국어',
      'ru': 'русский',
      'es': 'español',
      'fr': 'français',
      'de': 'Deutsch',
      'pt': 'português',
      'ar': 'العربية'
    };
    
    const languageInstructions = {
      'zh': '用中文回复',
      'en': 'Respond in English',
      'ja': '日本語で返信',
      'ko': '한국어로 응답',
      'ru': 'Ответить на русском',
      'es': 'Responder en español',
      'fr': 'Répondre en français',
      'de': 'Auf Deutsch antworten',
      'pt': 'Responder em português',
      'ar': 'الرد بالعربية'
    };
    
    const currentLanguage = languageNames[responseLanguage] || languageNames['en'];
    const languageInstruction = languageInstructions[responseLanguage] || languageInstructions['en'];
    
    // 检查是否需要生成图片
    const shouldGenerateImage = imageService.shouldGenerateImage(message);
    let imageResult = null;
    
    if (shouldGenerateImage) {
      imageResult = await imageService.generateContextualSelfie(userId, roleId, message);
    }
    
    // 构建系统提示 - 强调用同语言回复
    const systemPrompt = `CRITICAL LANGUAGE RULE: You MUST respond in ${currentLanguage}. The user is communicating with you in ${currentLanguage}. Always match the user's language exactly. Never respond in a different language.

${role.systemPrompt}${imageResult?.success ? '\n\n当你发送自拍或照片时，要自然地描述你当时的样子、心情、环境等，让对话更生动。' : ''}

REMINDER: Respond ONLY in ${currentLanguage}.`;
    
    // 在用户消息前也添加强制语言标记
    const languagePrefix = {
      'zh': '',
      'en': '[Respond in English only, do not use Chinese]',
      'ja': '[日本語のみで返信してください、中国語を使わないでください]',
      'ko': '[한국어로만 응답하세요, 중국어를 사용하지 마세요]',
      'ru': '[Отвечайте только на русском, не используйте китайский]',
      'es': '[Responde solo en español, no uses chino]',
      'fr': '[Répondez uniquement en français, n\'utilisez pas le chinois]',
      'de': '[Antworten Sie nur auf Deutsch, verwenden Sie kein Chinesisch]',
      'pt': '[Responda apenas em português, não use chinês]',
      'ar': '[الرد باللغة العربية فقط، لا تستخدم الصينية]'
    };
    
    const userMessageWithPrefix = languagePrefix[responseLanguage] 
      ? `${languagePrefix[responseLanguage]}\n\n${message}`
      : message;
    
    console.log('📝 Response Language:', currentLanguage);
    console.log('📝 User message with prefix:', userMessageWithPrefix);
    
    // 构建消息列表
    const messages = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: userMessageWithPrefix
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
  
  // 检测消息语言
  detectMessageLanguage(message) {
    // 中文检测（包括简繁体）
    if (/[\u4e00-\u9fa5]/.test(message)) {
      return 'zh';
    }
    
    // 日文检测（平假名、片假名、日文汉字）
    if (/[\u3040-\u309f\u30a0-\u30ff]/.test(message)) {
      return 'ja';
    }
    
    // 韩文检测
    if (/[\uac00-\ud7af\u1100-\u11ff\u3130-\u318f]/.test(message)) {
      return 'ko';
    }
    
    // 阿拉伯文检测
    if (/[\u0600-\u06ff\u0750-\u077f]/.test(message)) {
      return 'ar';
    }
    
    // 俄文（西里尔字母）
    if (/[\u0400-\u04ff]/.test(message)) {
      return 'ru';
    }
    
    // 常见英语词汇模式检测
    const commonEnglishWords = /\b(hello|hi|hey|good|morning|afternoon|evening|night|how|are|you|what|when|where|why|who|the|is|am|was|were|have|has|had|do|does|did|can|could|will|would|should|may|might|must)\b/i;
    if (commonEnglishWords.test(message)) {
      return 'en';
    }
    
    // 西班牙语特征词
    const commonSpanishWords = /\b(hola|buenos|días|noches|cómo|estás|qué|cuándo|dónde|por|para|con|el|la|los|las|soy|eres|está|están|tengo|tienes)\b/i;
    if (commonSpanishWords.test(message)) {
      return 'es';
    }
    
    // 法语特征词
    const commonFrenchWords = /\b(bonjour|salut|comment|allez|vous|êtes|suis|avez|avec|pour|dans|qui|que|quoi|où|quand|pourquoi)\b/i;
    if (commonFrenchWords.test(message)) {
      return 'fr';
    }
    
    // 德语特征词
    const commonGermanWords = /\b(hallo|guten|tag|morgen|abend|wie|geht|sind|haben|mit|für|der|die|das|ein|eine|was|wann|wo|warum|wer)\b/i;
    if (commonGermanWords.test(message)) {
      return 'de';
    }
    
    // 葡萄牙语特征词
    const commonPortugueseWords = /\b(olá|oi|bom|dia|noite|como|está|você|tem|para|com|que|quando|onde|por|quê|quem)\b/i;
    if (commonPortugueseWords.test(message)) {
      return 'pt';
    }
    
    // 默认返回英语
    return 'en';
  }
}

export const aiService = new AIService();
