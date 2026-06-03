// 多语言配置
export const translations = {
  zh: {
    // 通用
    appName: 'AiFriend',
    appSubtitle: '你的 AI 智能伙伴',
    send: '发送',
    cancel: '取消',
    confirm: '确认',
    close: '关闭',
    
    // 欢迎消息
    welcomeMessage: '你好！我是 AiFriend，选择一个角色开始对话吧 ✨',
    greeting: '你好',
    
    // 角色广场
    roleSquare: '角色广场',
    selectRole: '选择角色',
    currentRole: '当前角色',
    changeRole: '切换角色',
    
    // 角色类别
    categories: {
      female: '女性角色',
      male: '男性角色',
      fantasy: '奇幻角色'
    },
    
    // 具体角色
    roles: {
      sister: { name: '御姐', desc: '成熟优雅，气质迷人' },
      loli: { name: '萝莉', desc: '可爱甜美，天真烂漫' },
      girlfriend: { name: '温柔女友', desc: '温柔体贴，甜美可人' },
      ceo: { name: '女总裁', desc: '干练强势，商业精英' },
      nurse: { name: '护士', desc: '温柔体贴，细心照顾' },
      senior: { name: '学姐', desc: '知性优雅，学识渊博' },
      star: { name: '偶像', desc: '魅力四射，光彩照人' },
      athlete: { name: '运动女孩', desc: '活力四射，健康阳光' },
      teacher: { name: '老师', desc: '耐心温柔，循循善诱' },
      artist: { name: '艺术家', desc: '浪漫自由，富有想象' },
      gamer: { name: '游戏少女', desc: '活泼有趣，游戏达人' },
      boyfriend: { name: '温柔男友', desc: '体贴暖心，浪漫多情' },
      dominantCeo: { name: '霸道总裁', desc: '强势专情，帝王气质' },
      schoolmate: { name: '青梅竹马', desc: '亲切守护，青春回忆' },
      werewolf: { name: '狼人', desc: '野性魅力，忠诚守护' },
      vampire: { name: '吸血鬼', desc: '神秘优雅，永恒浪漫' },
      angel: { name: '天使', desc: '纯洁善良，圣洁光明' },
      demon: { name: '恶魔', desc: '魅惑调皮，神秘危险' }
    },
    
    // 会员系统
    freeTries: '免费次数',
    remainingTries: '剩余 {count} 条',
    noMoreTries: '今日免费次数已用完',
    upgradeMembership: '升级会员',
    becomeMember: '成为会员',
    membershipBenefits: '会员特权',
    unlimitedChats: '无限对话',
    allRoles: '解锁全部角色',
    longTermMemory: '长期记忆',
    prioritySupport: '优先支持',
    
    // 购买选项
    buyWithStars: '使用 Stars 购买',
    monthly: '月度会员',
    yearly: '年度会员',
    lifetime: '终身会员',
    price: {
      monthly: '100 Stars/月',
      yearly: '1000 Stars/年',
      lifetime: '3000 Stars 终身'
    },
    
    // 设置
    settings: '设置',
    language: '语言',
    clearHistory: '清空历史',
    about: '关于',
    
    // 消息
    typingPlaceholder: '输入消息...',
    sending: '发送中...',
    errorSending: '发送失败',
    networkError: '网络错误，请重试',
    
    // 历史记录
    chatHistory: '对话历史',
    noHistory: '暂无对话记录',
    clearConfirm: '确定要清空所有对话记录吗？',
    cleared: '已清空',
    
    // 首次访问
    firstTimeTitle: '欢迎使用 AiFriend！',
    firstTimeSubtitle: '选择一个角色开始你的AI伙伴之旅',
    continueChat: '继续对话',
    newChat: '新对话',
    backToHistory: '返回历史'
  },
  
  en: {
    // General
    appName: 'AiFriend',
    appSubtitle: 'Your AI Companion',
    send: 'Send',
    cancel: 'Cancel',
    confirm: 'Confirm',
    close: 'Close',
    
    // Welcome
    welcomeMessage: 'Hi! I\'m AiFriend, choose a character to start chatting ✨',
    greeting: 'Hello',
    
    // Role Square
    roleSquare: 'Character Gallery',
    selectRole: 'Select Character',
    currentRole: 'Current Role',
    changeRole: 'Change Role',
    
    // Categories
    categories: {
      female: 'Female Characters',
      male: 'Male Characters',
      fantasy: 'Fantasy Characters'
    },
    
    // Roles
    roles: {
      sister: { name: 'Mature Lady', desc: 'Elegant and charming' },
      loli: { name: 'Sweet Girl', desc: 'Cute and innocent' },
      girlfriend: { name: 'Girlfriend', desc: 'Sweet and caring' },
      ceo: { name: 'CEO', desc: 'Capable business elite' },
      nurse: { name: 'Nurse', desc: 'Gentle and caring' },
      senior: { name: 'Senior', desc: 'Intellectual and elegant' },
      star: { name: 'Idol', desc: 'Glamorous and stunning' },
      athlete: { name: 'Athletic Girl', desc: 'Energetic and healthy' },
      teacher: { name: 'Teacher', desc: 'Patient and inspiring' },
      artist: { name: 'Artist', desc: 'Romantic and creative' },
      gamer: { name: 'Gamer Girl', desc: 'Fun and energetic' },
      boyfriend: { name: 'Gentle Boyfriend', desc: 'Caring and romantic' },
      dominantCeo: { name: 'Dominant CEO', desc: 'Powerful and devoted' },
      schoolmate: { name: 'Childhood Friend', desc: 'Caring and familiar' },
      werewolf: { name: 'Werewolf', desc: 'Wild and loyal' },
      vampire: { name: 'Vampire', desc: 'Mysterious and elegant' },
      angel: { name: 'Angel', desc: 'Pure and holy' },
      demon: { name: 'Demon', desc: 'Seductive and mysterious' }
    },
    
    // Membership
    freeTries: 'Free Messages',
    remainingTries: '{count} remaining',
    noMoreTries: 'Daily free messages used up',
    upgradeMembership: 'Upgrade',
    becomeMember: 'Become a Member',
    membershipBenefits: 'Member Benefits',
    unlimitedChats: 'Unlimited Chats',
    allRoles: 'All Characters',
    longTermMemory: 'Long-term Memory',
    prioritySupport: 'Priority Support',
    
    // Purchase
    buyWithStars: 'Buy with Stars',
    monthly: 'Monthly',
    yearly: 'Yearly',
    lifetime: 'Lifetime',
    price: {
      monthly: '100 Stars/month',
      yearly: '1000 Stars/year',
      lifetime: '3000 Stars lifetime'
    },
    
    // Settings
    settings: 'Settings',
    language: 'Language',
    clearHistory: 'Clear History',
    about: 'About',
    
    // Messages
    typingPlaceholder: 'Type a message...',
    sending: 'Sending...',
    errorSending: 'Failed to send',
    networkError: 'Network error, please retry',
    
    // History
    chatHistory: 'Chat History',
    noHistory: 'No chat history',
    clearConfirm: 'Clear all chat history?',
    cleared: 'Cleared',
    
    // First time
    firstTimeTitle: 'Welcome to AiFriend!',
    firstTimeSubtitle: 'Choose a character to start your journey',
    continueChat: 'Continue',
    newChat: 'New Chat',
    backToHistory: 'Back to History'
  },
  
  ja: {
    appName: 'AiFriend',
    appSubtitle: 'あなたのAIパートナー',
    send: '送信',
    cancel: 'キャンセル',
    confirm: '確認',
    close: '閉じる',
    welcomeMessage: 'こんにちは！AiFriendです。キャラクターを選んで会話を始めましょう ✨',
    greeting: 'こんにちは',
    roleSquare: 'キャラクター広場',
    selectRole: 'キャラクター選択',
    currentRole: '現在のロール',
    changeRole: 'ロール変更',
    categories: {
      female: '女性キャラ',
      male: '男性キャラ',
      fantasy: 'ファンタジー'
    },
    roles: {
      sister: { name: 'お姉さん', desc: '成熟で優雅' },
      loli: { name: 'ロリ', desc: '可愛くて甘い' },
      girlfriend: { name: '優しい彼女', desc: '温柔で思いやり' },
      ceo: { name: '女社長', desc: '有能なエリート' },
      nurse: { name: 'ナース', desc: '優しくて思いやり' },
      senior: { name: '先輩', desc: '知的で優雅' },
      star: { name: 'アイドル', desc: '魅力的で輝く' },
      athlete: { name: 'スポーツ女子', desc: 'エネルギッシュで健康的' },
      teacher: { name: '先生', desc: '優しくて知的' },
      artist: { name: 'アーティスト', desc: 'ロマンチックで創造的' },
      gamer: { name: 'ゲーマー女子', desc: '楽しくて活発' },
      boyfriend: { name: '優しい彼氏', desc: '思いやりロマンチック' },
      dominantCeo: { name: '俺様社長', desc: '強くて一途' },
      schoolmate: { name: '幼馴染', desc: '親しくて守護' },
      werewolf: { name: '狼男', desc: '野性的で忠実' },
      vampire: { name: '吸血鬼', desc: '神秘的で優雅' },
      angel: { name: '天使', desc: '純粋で聖なる' },
      demon: { name: '悪魔', desc: '魅惑的で神秘的' }
    },
    freeTries: '無料メッセージ',
    remainingTries: '残り{count}回',
    noMoreTries: '本日の無料回数を使い切りました',
    upgradeMembership: 'アップグレード',
    becomeMember: '会員になる',
    membershipBenefits: '会員特典',
    unlimitedChats: '無制限チャット',
    allRoles: '全キャラ解放',
    longTermMemory: '長期記憶',
    prioritySupport: '優先サポート',
    buyWithStars: 'Starsで購入',
    monthly: '月間会員',
    yearly: '年間会員',
    lifetime: '永久会員',
    price: {
      monthly: '100 Stars/月',
      yearly: '1000 Stars/年',
      lifetime: '3000 Stars 永久'
    },
    settings: '設定',
    language: '言語',
    clearHistory: '履歴削除',
    about: 'について',
    typingPlaceholder: 'メッセージを入力...',
    sending: '送信中...',
    errorSending: '送信失敗',
    networkError: 'ネットワークエラー',
    chatHistory: '会話履歴',
    noHistory: '履歴なし',
    clearConfirm: '全ての会話履歴を削除しますか？',
    cleared: '削除しました',
    
    // 初回訪問
    firstTimeTitle: 'AiFriendへようこそ！',
    firstTimeSubtitle: 'キャラクターを選んで始めましょう',
    continueChat: '続ける',
    newChat: '新しいチャット',
    backToHistory: '履歴に戻る'
  }
};

// 获取翻译文本
export function t(key, lang = 'zh', params = {}) {
  const keys = key.split('.');
  let value = translations[lang] || translations.zh;
  
  for (const k of keys) {
    value = value[k];
    if (!value) return key;
  }
  
  // 替换参数
  if (typeof value === 'string') {
    return value.replace(/\{(\w+)\}/g, (match, key) => params[key] || match);
  }
  
  return value;
}

// 检测用户语言
export function detectLanguage(telegramLang) {
  const langMap = {
    'zh': 'zh', 'zh-hans': 'zh', 'zh-hant': 'zh',
    'en': 'en',
    'ja': 'ja',
    'ko': 'en',
    'ru': 'en',
    'es': 'en',
    'fr': 'en',
    'de': 'en',
    'pt': 'en',
    'ar': 'en'
  };
  
  const code = telegramLang?.toLowerCase() || '';
  return langMap[code] || langMap[code.split('-')[0]] || 'en';
}

// 获取支持的语言列表
export function getSupportedLanguages() {
  return [
    { code: 'zh', name: '简体中文', nativeName: '简体中文' },
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' }
  ];
}
