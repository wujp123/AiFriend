// 基于IP的语言检测服务
export class LanguageDetector {
  constructor() {
    this.defaultLang = 'en';
    this.detectedLang = null;
  }
  
  // 使用免费的IP地理位置API检测语言
  async detectByIP() {
    try {
      // 使用多个备用API以提高可靠性
      const apis = [
        'https://ipapi.co/json/',
        'https://ip-api.com/json/',
        'https://freeipapi.com/api/json'
      ];
      
      for (const api of apis) {
        try {
          const response = await fetch(api, { timeout: 3000 });
          if (!response.ok) continue;
          
          const data = await response.json();
          const countryCode = data.country_code || data.countryCode || data.country;
          
          if (countryCode) {
            this.detectedLang = this.countryToLanguage(countryCode);
            console.log(`🌍 Detected location: ${countryCode} → Language: ${this.detectedLang}`);
            return this.detectedLang;
          }
        } catch (err) {
          console.warn(`API ${api} failed:`, err);
          continue;
        }
      }
      
      // 如果所有API都失败，使用浏览器语言
      return this.detectByBrowser();
    } catch (error) {
      console.error('IP detection failed:', error);
      return this.detectByBrowser();
    }
  }
  
  // 浏览器语言检测（备用方案）
  detectByBrowser() {
    const browserLang = navigator.language || navigator.userLanguage;
    const langCode = browserLang.split('-')[0].toLowerCase();
    
    const supported = ['zh', 'en', 'ja', 'ko', 'ru', 'es', 'fr', 'de', 'pt', 'ar'];
    this.detectedLang = supported.includes(langCode) ? langCode : this.defaultLang;
    
    console.log(`🌐 Browser language: ${browserLang} → ${this.detectedLang}`);
    return this.detectedLang;
  }
  
  // 国家代码到语言的映射
  countryToLanguage(countryCode) {
    const map = {
      // 中文
      'CN': 'zh', 'HK': 'zh', 'TW': 'zh', 'SG': 'zh', 'MO': 'zh',
      // 英语
      'US': 'en', 'GB': 'en', 'CA': 'en', 'AU': 'en', 'NZ': 'en', 'IE': 'en', 'ZA': 'en', 'IN': 'en',
      // 日语
      'JP': 'ja',
      // 韩语
      'KR': 'ko',
      // 俄语
      'RU': 'ru', 'BY': 'ru', 'KZ': 'ru', 'UA': 'ru',
      // 西班牙语
      'ES': 'es', 'MX': 'es', 'AR': 'es', 'CO': 'es', 'CL': 'es', 'PE': 'es', 'VE': 'es',
      // 法语
      'FR': 'fr', 'BE': 'fr', 'CH': 'fr', 'LU': 'fr', 'MC': 'fr',
      // 德语
      'DE': 'de', 'AT': 'de', 'LI': 'de',
      // 葡萄牙语
      'PT': 'pt', 'BR': 'pt', 'AO': 'pt', 'MZ': 'pt',
      // 阿拉伯语
      'SA': 'ar', 'AE': 'ar', 'EG': 'ar', 'DZ': 'ar', 'IQ': 'ar', 'JO': 'ar', 'KW': 'ar', 'LB': 'ar', 'MA': 'ar', 'QA': 'ar', 'SY': 'ar', 'TN': 'ar', 'YE': 'ar'
    };
    
    return map[countryCode.toUpperCase()] || this.defaultLang;
  }
  
  // Telegram语言代码检测
  detectByTelegram(telegramLangCode) {
    if (!telegramLangCode) return null;
    
    const map = {
      'zh': 'zh', 'zh-hans': 'zh', 'zh-hant': 'zh',
      'en': 'en',
      'ja': 'ja',
      'ko': 'ko',
      'ru': 'ru',
      'es': 'es',
      'fr': 'fr',
      'de': 'de',
      'pt': 'pt', 'pt-br': 'pt',
      'ar': 'ar'
    };
    
    const code = telegramLangCode.toLowerCase();
    return map[code] || map[code.split('-')[0]] || null;
  }
  
  // 综合检测（优先级：Telegram > 用户设置 > IP > 浏览器）
  async detect(telegramLangCode, userPreferredLang) {
    // 1. 用户手动设置的语言优先
    if (userPreferredLang) {
      console.log(`✅ Using user preferred language: ${userPreferredLang}`);
      return userPreferredLang;
    }
    
    // 2. Telegram语言设置
    const tgLang = this.detectByTelegram(telegramLangCode);
    if (tgLang) {
      console.log(`📱 Using Telegram language: ${tgLang}`);
      return tgLang;
    }
    
    // 3. 基于IP检测
    const ipLang = await this.detectByIP();
    if (ipLang) {
      return ipLang;
    }
    
    // 4. 浏览器语言（最后备用）
    return this.detectByBrowser();
  }
}

// 导出单例
export const languageDetector = new LanguageDetector();
