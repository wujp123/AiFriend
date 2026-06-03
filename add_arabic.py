#!/usr/bin/env python3
with open('i18n.js', 'r', encoding='utf-8') as f:
    content = f.read()

arabic = '''  ,
  
  // 阿拉伯语
  ar: {
    appName: 'AiFriend',
    appSubtitle: 'رفيقك الذكي',
    send: 'إرسال',
    cancel: 'إلغاء',
    confirm: 'تأكيد',
    close: 'إغلاق',
    welcomeMessage: 'مرحباً! أنا AiFriend، اختر شخصية للبدء ✨',
    greeting: 'مرحباً',
    roleSquare: 'معرض الشخصيات',
    selectRole: 'اختر شخصية',
    currentRole: 'الدور الحالي',
    changeRole: 'تغيير الدور',
    categories: {
      female: 'شخصيات نسائية',
      male: 'شخصيات ذكورية',
      fantasy: 'شخصيات خيالية'
    },
    roles: {
      sister: { name: 'سيدة ناضجة', desc: 'أنيقة وساحرة' },
      loli: { name: 'فتاة لطيفة', desc: 'جميلة وبريئة' },
      girlfriend: { name: 'صديقة', desc: 'لطيفة وحنونة' },
      ceo: { name: 'رئيسة تنفيذية', desc: 'نخبة أعمال قادرة' },
      nurse: { name: 'ممرضة', desc: 'لطيفة وحنونة' },
      senior: { name: 'طالبة متقدمة', desc: 'ذكية وأنيقة' },
      star: { name: 'نجمة', desc: 'ساحرة ومبهرة' },
      athlete: { name: 'فتاة رياضية', desc: 'نشيطة وصحية' },
      teacher: { name: 'معلمة', desc: 'صبورة وملهمة' },
      artist: { name: 'فنانة', desc: 'رومانسية ومبدعة' },
      gamer: { name: 'فتاة ألعاب', desc: 'ممتعة ونشيطة' },
      boyfriend: { name: 'صديق لطيف', desc: 'حنون ورومانسي' },
      dominantCeo: { name: 'رئيس تنفيذي مسيطر', desc: 'قوي ومخلص' },
      schoolmate: { name: 'صديق طفولة', desc: 'حنون ومألوف' },
      werewolf: { name: 'رجل ذئب', desc: 'متوحش ومخلص' },
      vampire: { name: 'مصاص دماء', desc: 'غامض وأنيق' },
      angel: { name: 'ملاك', desc: 'نقي ومقدس' },
      demon: { name: 'شيطان', desc: 'مغري وغامض' }
    },
    freeTries: 'رسائل مجانية',
    remainingTries: '{count} متبقية',
    noMoreTries: 'نفدت الرسائل المجانية',
    upgradeMembership: 'ترقية',
    becomeMember: 'كن عضواً',
    membershipBenefits: 'مزايا العضوية',
    unlimitedChats: 'محادثات غير محدودة',
    allRoles: 'جميع الشخصيات',
    longTermMemory: 'ذاكرة طويلة المدى',
    prioritySupport: 'دعم ذو أولوية',
    buyWithStars: 'شراء بالنجوم',
    monthly: 'شهرية',
    yearly: 'سنوية',
    lifetime: 'مدى الحياة',
    price: {
      monthly: '100 نجمة/شهر',
      yearly: '1000 نجمة/سنة',
      lifetime: '3000 نجمة مدى الحياة'
    },
    settings: 'الإعدادات',
    language: 'اللغة',
    clearHistory: 'مسح السجل',
    about: 'حول',
    typingPlaceholder: 'اكتب رسالة...',
    sending: 'جاري الإرسال...',
    errorSending: 'فشل الإرسال',
    networkError: 'خطأ في الشبكة',
    chatHistory: 'سجل المحادثات',
    noHistory: 'لا يوجد سجل محادثات',
    clearConfirm: 'مسح كل سجل المحادثات؟',
    cleared: 'تم المسح',
    firstTimeTitle: 'مرحباً بك في AiFriend!',
    firstTimeSubtitle: 'اختر شخصية للبدء',
    continueChat: 'متابعة',
    newChat: 'محادثة جديدة',
    backToHistory: 'العودة للسجل'
  }'''

insert_pos = content.find('\\n};\\n\\n// 获取翻译文本')
if insert_pos != -1:
    new_content = content[:insert_pos] + arabic + content[insert_pos:]
    with open('i18n.js', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("✅ Added Arabic")
else:
    print("❌ Could not find insertion point")
