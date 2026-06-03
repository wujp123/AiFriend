// AiFriend - 主应用逻辑
// Version: 2.1 - Payment Verification
// Last Update: 2024-12-10
import { t, detectLanguage, getSupportedLanguages } from './i18n.js';
import { roles, getRolesByCategory, getRole, isRoleFree } from './roles.js';
import { storage } from './storage.js';
import { aiService } from './ai.js';
import { config } from './config.js';
import { imageService } from './image.js';
import { languageDetector } from './lang-detect.js';
import { paymentVerifier } from './payment-verify.js';
import { telegramLogger } from './telegram-logger.js';

// Telegram Web App
const tg = window.Telegram?.WebApp || {
  initDataUnsafe: { user: null },
  expand: () => {},
  enableClosingConfirmation: () => {},
  showAlert: (msg) => alert(msg),
  showPopup: (opts, cb) => { 
    if (confirm(opts.message)) cb('confirm'); 
    else cb('cancel');
  },
  showConfirm: (msg, cb) => cb(confirm(msg)),
  HapticFeedback: {
    impactOccurred: () => {},
    notificationOccurred: () => {}
  }
};

try {
  tg.expand();
  tg.enableClosingConfirmation();
} catch (e) {
  console.warn('Telegram WebApp API not available:', e);
}

// 全局状态
let currentLang = 'zh';
let currentUser = null;
let currentView = 'main';
let isFirstTimeUser = false;

// DOM 元素
const elements = {
  // Header
  roleBtn: document.getElementById('roleBtn'),
  currentRoleEmoji: document.getElementById('currentRoleEmoji'),
  roleStatus: document.getElementById('roleStatus'),
  quotaBtn: document.getElementById('quotaBtn'),
  quotaText: document.getElementById('quotaText'),
  settingsBtn: document.getElementById('settingsBtn'),
  headerLanguageSelect: document.getElementById('headerLanguageSelect'),
  
  // Main view
  mainView: document.getElementById('mainView'),
  clearChatBtn: document.getElementById('clearChatBtn'),
  chatMessages: document.getElementById('chatMessages'),
  messageInput: document.getElementById('messageInput'),
  sendButton: document.getElementById('sendButton'),
  
  // Chat history view
  chatHistoryView: document.getElementById('chatHistoryView'),
  chatHistoryTitle: document.getElementById('chatHistoryTitle'),
  newChatBtn: document.getElementById('newChatBtn'),
  historyList: document.getElementById('historyList'),
  
  // Role square view
  roleSquareView: document.getElementById('roleSquareView'),
  backFromRoles: document.getElementById('backFromRoles'),
  roleCategories: document.getElementById('roleCategories'),
  
  // Membership view
  membershipView: document.getElementById('membershipView'),
  backFromMembership: document.getElementById('backFromMembership'),
  membershipStatusContent: document.getElementById('membershipStatusContent'),
  membershipPlans: document.getElementById('membershipPlans'),
  
  // Settings view
  settingsView: document.getElementById('settingsView'),
  backFromSettings: document.getElementById('backFromSettings'),
  languageSelect: document.getElementById('languageSelect'),
  apiKeyInput: document.getElementById('apiKeyInput'),
  clearHistoryBtn: document.getElementById('clearHistoryBtn')
};

// 初始化
async function init() {
  console.log('🚀 Initializing iFriendly AI...');
  
  // 获取 Telegram 用户信息
  const telegramUser = tg.initDataUnsafe?.user;
  let userId;
  let userInfo = {};
  
  if (telegramUser) {
    // 在 Telegram 环境中，使用 Telegram User ID
    userId = telegramUser.id.toString();
    userInfo = {
      id: userId,
      firstName: telegramUser.first_name || '',
      lastName: telegramUser.last_name || '',
      username: telegramUser.username || '',
      languageCode: telegramUser.language_code || 'en',
      isPremium: telegramUser.is_premium || false,
      photoUrl: telegramUser.photo_url || ''
    };
    console.log('✅ Telegram User:', userInfo);
  } else {
    // 在浏览器测试环境中，生成唯一的匿名用户ID
    userId = getOrCreateAnonymousUserId();
    userInfo = {
      id: userId,
      firstName: 'Guest',
      lastName: '',
      username: 'guest_' + userId.substring(0, 8),
      languageCode: navigator.language?.substring(0, 2) || 'en',
      isPremium: false,
      isAnonymous: true
    };
    console.log('👤 Anonymous User:', userInfo);
  }
  
  // 显示用户信息（用于调试）
  console.log('User ID:', userId);
  console.log('Platform:', telegramUser ? 'Telegram' : 'Web Browser');
  
  // 获取或创建用户数据
  currentUser = storage.getUser(userId);
  
  // 判断是否为新用户（检查是否刚刚创建，5秒内算新用户）
  const isNewUser = currentUser.createdAt && 
    (Date.now() - new Date(currentUser.createdAt).getTime() < 5000);
  
  // 更新用户信息（无论新老用户，都更新 Telegram 的最新信息）
  if (telegramUser) {
    storage.updateUser(userId, userInfo);
    currentUser = storage.getUser(userId);
  }
  
  // 如果是新用户，记录到 Telegram
  if (isNewUser) {
    console.log('🆕 New user detected, logging to Telegram...');
    try {
      // 保存用户注册记录到 localStorage（供后台查看）
      const userLogs = JSON.parse(localStorage.getItem('ifriendly_user_logs') || '[]');
      userLogs.push({
        type: 'new_user',
        userId: currentUser.id,
        userName: currentUser.firstName || currentUser.username || 'Unknown',
        username: currentUser.username,
        language: currentUser.language,
        timestamp: Date.now(),
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('ifriendly_user_logs', JSON.stringify(userLogs));
      
      // 发送到 Telegram
      await telegramLogger.logNewUser(currentUser);
      console.log('✅ New user logged to Telegram and localStorage');
    } catch (error) {
      console.error('Failed to log new user:', error);
    }
  }
  
  console.log('Current user data:', currentUser);
  
  // 智能语言检测（优先级：用户设置 > Telegram > IP > 浏览器）
  if (currentUser.language) {
    currentLang = currentUser.language;
    console.log(`Using saved user language: ${currentLang}`);
  } else {
    // 使用智能语言检测
    try {
      currentLang = await languageDetector.detect(userInfo.languageCode, currentUser.language);
      currentUser.language = currentLang;
      storage.updateUser(userId, currentUser);
      console.log(`Auto-detected language: ${currentLang}`);
    } catch (e) {
      console.error('Language detection failed:', e);
      currentLang = userInfo.languageCode || 'en';
    }
  }
  
  // 检查是否首次访问（针对当前用户）
  const userVisitKey = `hasVisited_${userId}`;
  const hasVisitedBefore = localStorage.getItem(userVisitKey);
  isFirstTimeUser = !hasVisitedBefore;
  console.log('Is first time user:', isFirstTimeUser);
  
  setupEventListeners();
  updateUI();
  
  // 决定初始显示哪个视图
  if (isFirstTimeUser) {
    // 首次访问 - 显示角色广场
    console.log('📱 Showing role square for first-time user');
    localStorage.setItem(userVisitKey, 'true');
    showView('roleSquare');
  } else {
    // 老用户 - 检查是否有聊天历史
    const conversations = storage.getConversations(currentUser.id);
    const hasHistory = Object.keys(conversations).length > 0;
    
    if (hasHistory) {
      console.log('📜 Showing chat history for returning user');
      showView('chatHistory');
    } else {
      console.log('📱 No chat history, showing role square');
      showView('roleSquare');
    }
  }
  
  // 显示欢迎信息（仅 Telegram 环境）
  if (telegramUser && isFirstTimeUser) {
    const welcomeMsg = `👋 ${currentLang === 'zh' ? '欢迎' : 'Welcome'}, ${userInfo.firstName}!`;
    console.log(welcomeMsg);
  }
  
  console.log('✅ iFriendly AI initialized successfully');
}

// 获取或创建匿名用户ID（用于浏览器测试）
function getOrCreateAnonymousUserId() {
  const STORAGE_KEY = 'anonymous_user_id';
  let anonymousId = localStorage.getItem(STORAGE_KEY);
  
  if (!anonymousId) {
    // 生成唯一ID：时间戳 + 随机数
    anonymousId = 'anon_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem(STORAGE_KEY, anonymousId);
    console.log('🆕 Created new anonymous user ID:', anonymousId);
  } else {
    console.log('📌 Using existing anonymous user ID:', anonymousId);
  }
  
  return anonymousId;
}

// 设置事件监听
function setupEventListeners() {
  // 导航
  elements.roleBtn.addEventListener('click', () => showView('roleSquare'));
  elements.quotaBtn.addEventListener('click', () => showView('membership'));
  elements.settingsBtn.addEventListener('click', () => showView('settings'));
  
  // Header语言切换
  elements.headerLanguageSelect.addEventListener('change', changeLanguageFromHeader);
  
  // 返回按钮
  elements.backFromRoles.addEventListener('click', () => showView('chatHistory'));
  elements.backFromMembership.addEventListener('click', () => showView('chatHistory'));
  elements.backFromSettings.addEventListener('click', () => showView('chatHistory'));
  
  // 新对话按钮
  elements.newChatBtn.addEventListener('click', () => showView('roleSquare'));
  
  // 清除当前聊天按钮
  elements.clearChatBtn.addEventListener('click', clearCurrentChat);
  
  // 发送消息
  elements.sendButton.addEventListener('click', sendMessage);
  elements.messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
  
  // 设置
  elements.languageSelect.addEventListener('change', changeLanguage);
  elements.apiKeyInput.addEventListener('blur', saveApiKey);
  elements.clearHistoryBtn.addEventListener('click', clearHistory);
}

// 切换视图
function showView(viewName) {
  console.log(`Switching to view: ${viewName}`);
  currentView = viewName;
  
  elements.mainView.classList.add('hidden');
  elements.chatHistoryView.classList.add('hidden');
  elements.roleSquareView.classList.add('hidden');
  elements.membershipView.classList.add('hidden');
  elements.settingsView.classList.add('hidden');
  
  if (viewName === 'main') {
    elements.mainView.classList.remove('hidden');
    loadConversation();
  } else if (viewName === 'chatHistory') {
    elements.chatHistoryView.classList.remove('hidden');
    renderChatHistory();
  } else if (viewName === 'roleSquare') {
    elements.roleSquareView.classList.remove('hidden');
    renderRoleSquare();
  } else if (viewName === 'membership') {
    elements.membershipView.classList.remove('hidden');
    renderMembership();
  } else if (viewName === 'settings') {
    elements.settingsView.classList.remove('hidden');
    renderSettings();
  }
  
  try {
    tg.HapticFeedback.impactOccurred('light');
  } catch (e) {
    // Ignore haptic feedback errors
  }
}

// 更新UI
function updateUI() {
  const role = getRole(currentUser.currentRole);
  
  elements.currentRoleEmoji.textContent = role.emoji;
  elements.roleStatus.textContent = t(`roles.${role.id}.name`, currentLang);
  
  const remaining = storage.getRemainingTries(currentUser.id);
  if (remaining === Infinity) {
    elements.quotaText.textContent = '∞';
  } else {
    elements.quotaText.textContent = remaining;
  }
  
  elements.messageInput.placeholder = t('typingPlaceholder', currentLang);
  
  // 同步header和设置页面的语言选择器
  elements.headerLanguageSelect.value = currentLang;
  if (elements.languageSelect) {
    elements.languageSelect.value = currentLang;
  }
  
  // RTL support for Arabic
  if (currentLang === 'ar') {
    document.body.setAttribute('dir', 'rtl');
    document.body.style.fontFamily = 'Tahoma, Arial, sans-serif';
  } else {
    document.body.setAttribute('dir', 'ltr');
    document.body.style.fontFamily = '';
  }
  
  // 显示用户信息（如果有名字）
  if (currentUser.firstName && !currentUser.isAnonymous) {
    console.log(`👤 Logged in as: ${currentUser.firstName} (ID: ${currentUser.id})`);
  }
}

// 渲染角色广场
function renderRoleSquare() {
  console.log('📋 Rendering role square...');
  const categorized = getRolesByCategory(currentLang);
  console.log('Categorized roles:', categorized);
  
  elements.roleCategories.innerHTML = '';
  
  Object.entries(categorized).forEach(([category, roleList]) => {
    if (roleList.length === 0) return;
    
    console.log(`Category ${category}: ${roleList.length} roles`);
    
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'role-category';
    
    const categoryTitle = document.createElement('h3');
    categoryTitle.textContent = t(`categories.${category}`, currentLang);
    categoryDiv.appendChild(categoryTitle);
    
    const rolesGrid = document.createElement('div');
    rolesGrid.className = 'roles-grid';
    
    roleList.forEach(role => {
      const roleCard = document.createElement('div');
      roleCard.className = 'role-card';
      if (!role.free && !storage.isPremium(currentUser.id)) {
        roleCard.classList.add('locked');
      }
      if (currentUser.currentRole === role.id) {
        roleCard.classList.add('selected');
      }
      
      // 角色图片
      const roleImg = document.createElement('img');
      roleImg.src = role.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(role.emoji)}&size=200`;
      roleImg.alt = role.name || role.emoji;
      roleImg.className = 'role-avatar';
      roleImg.onerror = function() {
        console.warn(`Failed to load avatar for ${role.id}, using fallback`);
        this.style.display = 'none';
        roleCard.querySelector('.role-emoji').style.display = 'block';
      };
      
      const roleEmoji = document.createElement('div');
      roleEmoji.className = 'role-emoji';
      roleEmoji.textContent = role.emoji;
      roleEmoji.style.display = 'none'; // 默认隐藏，图片加载失败时显示
      
      const roleName = document.createElement('div');
      roleName.className = 'role-name';
      roleName.textContent = t(`roles.${role.id}.name`, currentLang);
      
      const roleDesc = document.createElement('div');
      roleDesc.className = 'role-desc';
      roleDesc.textContent = t(`roles.${role.id}.desc`, currentLang);
      
      roleCard.appendChild(roleImg);
      roleCard.appendChild(roleEmoji);
      roleCard.appendChild(roleName);
      roleCard.appendChild(roleDesc);
      
      if (!role.free && !storage.isPremium(currentUser.id)) {
        const lockIcon = document.createElement('div');
        lockIcon.className = 'lock-icon';
        lockIcon.textContent = '🔒';
        roleCard.appendChild(lockIcon);
      }
      
      roleCard.addEventListener('click', () => selectRole(role.id));
      
      rolesGrid.appendChild(roleCard);
    });
    
    categoryDiv.appendChild(rolesGrid);
    elements.roleCategories.appendChild(categoryDiv);
  });
  
  console.log('✅ Role square rendered');
}

// 选择角色
function selectRole(roleId) {
  const role = getRole(roleId);
  
  if (!role.free && !storage.isPremium(currentUser.id)) {
    tg.showPopup({
      title: t('upgradeMembership', currentLang),
      message: '此角色需要会员才能使用',
      buttons: [
        { id: 'upgrade', type: 'default', text: t('becomeMember', currentLang) },
        { id: 'cancel', type: 'cancel' }
      ]
    }, (buttonId) => {
      if (buttonId === 'upgrade') {
        showView('membership');
      }
    });
    return;
  }
  
  currentUser.currentRole = roleId;
  storage.updateUser(currentUser.id, currentUser);
  updateUI();
  showView('main');
  
  tg.HapticFeedback.notificationOccurred('success');
}

// 渲染聊天历史列表
function renderChatHistory() {
  elements.chatHistoryTitle.textContent = t('chatHistory', currentLang);
  elements.historyList.innerHTML = '';
  
  const conversations = storage.getConversations(currentUser.id);
  const roleIds = Object.keys(conversations);
  
  if (roleIds.length === 0) {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'empty-history';
    emptyDiv.innerHTML = `
      <p>${t('noHistory', currentLang)}</p>
      <button class="primary-btn" id="startNewChatBtn">${t('newChat', currentLang)}</button>
    `;
    elements.historyList.appendChild(emptyDiv);
    
    document.getElementById('startNewChatBtn').addEventListener('click', () => {
      showView('roleSquare');
    });
    return;
  }
  
  roleIds.forEach(roleId => {
    const role = getRole(roleId);
    const conv = conversations[roleId];
    const lastMessage = conv.messages[conv.messages.length - 1];
    
    const historyCard = document.createElement('div');
    historyCard.className = 'history-card';
    
    const roleAvatar = document.createElement('img');
    roleAvatar.src = role.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(role.emoji)}&size=200`;
    roleAvatar.alt = role.name || role.emoji;
    roleAvatar.className = 'history-avatar';
    
    const historyInfo = document.createElement('div');
    historyInfo.className = 'history-info';
    
    const roleName = document.createElement('div');
    roleName.className = 'history-role-name';
    roleName.textContent = `${role.emoji} ${t(`roles.${role.id}.name`, currentLang)}`;
    
    const lastMsgPreview = document.createElement('div');
    lastMsgPreview.className = 'history-last-msg';
    lastMsgPreview.textContent = lastMessage ? lastMessage.content.substring(0, 50) + '...' : '';
    
    const timestamp = document.createElement('div');
    timestamp.className = 'history-time';
    timestamp.textContent = conv.updatedAt ? new Date(conv.updatedAt).toLocaleDateString() : '';
    
    // 删除按钮
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'history-delete-btn';
    deleteBtn.textContent = '🗑️';
    deleteBtn.onclick = (e) => {
      e.stopPropagation(); // 防止触发卡片点击事件
      deleteRoleConversation(roleId);
    };
    
    historyInfo.appendChild(roleName);
    historyInfo.appendChild(lastMsgPreview);
    
    historyCard.appendChild(roleAvatar);
    historyCard.appendChild(historyInfo);
    historyCard.appendChild(timestamp);
    historyCard.appendChild(deleteBtn);
    
    historyCard.addEventListener('click', () => {
      currentUser.currentRole = roleId;
      storage.updateUser(currentUser.id, currentUser);
      updateUI();
      showView('main');
    });
    
    elements.historyList.appendChild(historyCard);
  });
}

// 渲染会员页面
function renderMembership() {
  // 状态
  const isPremium = storage.isPremium(currentUser.id);
  elements.membershipStatusContent.innerHTML = isPremium
    ? `<p class="premium-badge">✨ ${t('premiumMember', currentLang) || '您是会员'}</p>`
    : `<p>${t('freeUser', currentLang) || '免费用户'}</p>`;
  
  // 会员套餐
  const plans = [
    {
      id: 'weekly',
      name: '周会员',
      nameEn: 'Weekly',
      price: '$1.99',
      stars: 50,
      ton: '1',
      usdt: '2',
      duration: 7,
      features: ['unlimitedChats', 'unlimitedImages', 'allCharacters']
    },
    {
      id: 'monthly',
      name: '月会员',
      nameEn: 'Monthly',
      price: '$4.99',
      stars: 100,
      ton: '3',
      usdt: '5',
      duration: 30,
      popular: true,
      features: ['unlimitedChats', 'unlimitedImages', 'allCharacters', 'prioritySupport']
    },
    {
      id: 'quarterly',
      name: '季度会员',
      nameEn: 'Quarterly',
      price: '$12.99',
      stars: 260,
      ton: '8',
      usdt: '13',
      duration: 90,
      discount: '13%',
      features: ['unlimitedChats', 'unlimitedImages', 'allCharacters', 'prioritySupport']
    },
    {
      id: 'yearly',
      name: '年会员',
      nameEn: 'Yearly',
      price: '$39.99',
      stars: 800,
      ton: '24',
      usdt: '40',
      duration: 365,
      discount: '33%',
      features: ['unlimitedChats', 'unlimitedImages', 'allCharacters', 'prioritySupport', 'exclusiveRoles']
    }
  ];
  
  const plansHTML = plans.map(plan => `
    <div class="plan-card ${plan.popular ? 'popular-plan' : ''}">
      ${plan.popular ? `<div class="popular-badge">${currentLang === 'zh' ? '最受欢迎' : 'Most Popular'}</div>` : ''}
      ${plan.discount ? `<div class="discount-badge">-${plan.discount}</div>` : ''}
      
      <h3>${currentLang === 'zh' ? plan.name : plan.nameEn}</h3>
      <p class="price">${plan.price} <span class="period">/ ${plan.duration} ${currentLang === 'zh' ? '天' : 'days'}</span></p>
      
      <ul class="features-list">
        ${plan.features.map(feature => `
          <li>✓ ${getFeatureText(feature)}</li>
        `).join('')}
      </ul>
      
      <div class="payment-methods">
        <h4>${currentLang === 'zh' ? '支付方式' : 'Payment Method'}</h4>
        
        <button class="payment-btn tron-btn" onclick="window.payWithTRON('${plan.id}', '${plan.usdt}', ${plan.duration})">
          <span class="payment-icon">🔺</span>
          <div class="payment-info">
            <div class="payment-name">TRON (USDT-TRC20)</div>
            <div class="payment-amount">${plan.usdt} USDT</div>
          </div>
        </button>
      </div>
    </div>
  `).join('');
  
  elements.membershipPlans.innerHTML = plansHTML;
}

// 获取功能文本
function getFeatureText(feature) {
  const features = {
    zh: {
      unlimitedChats: '无限对话',
      unlimitedImages: '无限图片生成',
      allCharacters: '全部角色解锁',
      prioritySupport: '优先客服支持',
      exclusiveRoles: '独家限定角色'
    },
    en: {
      unlimitedChats: 'Unlimited Chats',
      unlimitedImages: 'Unlimited Images',
      allCharacters: 'All Characters',
      prioritySupport: 'Priority Support',
      exclusiveRoles: 'Exclusive Characters'
    }
  };
  
  const lang = currentLang === 'zh' ? 'zh' : 'en';
  return features[lang][feature] || feature;
}

// Telegram Stars 支付
window.payWithStars = function(planId, stars, duration) {
  console.log(`💫 Initiating Telegram Stars payment: ${planId}, ${stars} Stars, ${duration} days`);
  
  const messages = {
    zh: {
      title: 'Telegram Stars 支付',
      desc: `您将支付 ${stars} Stars 购买 ${duration} 天会员`,
      pay: '支付',
      cancel: '取消',
      notSupported: '您的 Telegram 版本不支持 Stars 支付',
      contactSupport: '请联系客服完成支付'
    },
    en: {
      title: 'Telegram Stars Payment',
      desc: `You will pay ${stars} Stars for ${duration} days membership`,
      pay: 'Pay',
      cancel: 'Cancel',
      notSupported: 'Your Telegram version does not support Stars payment',
      contactSupport: 'Please contact support to complete payment'
    }
  };
  
  const msg = currentLang === 'zh' ? messages.zh : messages.en;
  
  try {
    tg.showPopup({
      title: msg.title,
      message: msg.desc,
      buttons: [
        { id: 'pay', type: 'default', text: msg.pay + ` ${stars} Stars` },
        { id: 'cancel', type: 'cancel', text: msg.cancel }
      ]
    }, (buttonId) => {
      if (buttonId === 'pay') {
        if (window.Telegram?.WebApp?.openInvoice) {
          const invoiceLink = 'YOUR_TELEGRAM_STARS_INVOICE_LINK';
          tg.openInvoice(invoiceLink, (status) => {
            if (status === 'paid') {
              activatePremium(duration);
            }
          });
        } else {
          tg.showAlert(msg.notSupported);
        }
      }
    });
  } catch (e) {
    alert(`Telegram Stars: ${stars} Stars\n\n${msg.contactSupport}`);
  }
};

// TON 支付
window.payWithTON = function(planId, tonAmount, duration) {
  console.log(`💎 Initiating TON payment: ${planId}, ${tonAmount} TON, ${duration} days`);
  
  // TODO: 替换为你的真实 TON 钱包地址
  const tonAddress = '0x4a25ef931yce5c3eoca23b34b87520d6c2cd73a6';
  
  const messages = {
    zh: {
      title: 'TON 支付',
      desc: `请向以下地址转账 ${tonAmount} TON`,
      address: '地址',
      amount: '金额',
      copy: '复制地址',
      open: '打开钱包',
      cancel: '取消',
      copied: '地址已复制到剪贴板',
      note: '转账备注',
      noteText: `AiFriend_${planId}_${currentUser.id}`
    },
    en: {
      title: 'TON Payment',
      desc: `Please transfer ${tonAmount} TON to the address below`,
      address: 'Address',
      amount: 'Amount',
      copy: 'Copy Address',
      open: 'Open Wallet',
      cancel: 'Cancel',
      copied: 'Address copied to clipboard',
      note: 'Memo',
      noteText: `AiFriend_${planId}_${currentUser.id}`
    }
  };
  
  const msg = currentLang === 'zh' ? messages.zh : messages.en;
  
  try {
    tg.showPopup({
      title: msg.title,
      message: `${msg.desc}\n\n${msg.address}:\n${tonAddress}\n\n${msg.amount}: ${tonAmount} TON\n\n${msg.note}: ${msg.noteText}`,
      buttons: [
        { id: 'copy', type: 'default', text: msg.copy },
        { id: 'open', type: 'default', text: msg.open },
        { id: 'cancel', type: 'cancel', text: msg.cancel }
      ]
    }, (buttonId) => {
      if (buttonId === 'copy') {
        copyToClipboard(tonAddress);
        tg.showAlert(msg.copied);
      } else if (buttonId === 'open') {
        const tonUrl = `ton://transfer/${tonAddress}?amount=${tonAmount}000000000&text=${msg.noteText}`;
        window.open(tonUrl, '_blank');
      }
    });
  } catch (e) {
    alert(`TON Payment\n\nAddress: ${tonAddress}\nAmount: ${tonAmount} TON\nMemo: ${msg.noteText}`);
  }
};

// TRON (USDT-TRC20) 支付 - Nile 测试网络
window.payWithTRON = function(planId, usdtAmount, duration) {
  console.log(`🔺 Initiating TRON payment: ${planId}, ${usdtAmount} USDT, ${duration} days`);
  
  // 主网钱包地址
  const tronAddress = 'TMiBnPCeFcv1A2UNKV636f5NAMvuJKQVhm';
  const network = 'TRON Mainnet'; // 主网
  
  // USDT TRC20 合约地址 (Nile 测试网)
  const usdtContract = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'; // 主网 USDT
  
  const messages = {
    zh: {
      title: `TRON 支付 (${network})`,
      paymentInfo: `💰 支付信息\n\n金额：${usdtAmount} USDT\n网络：Nile 测试网\n\n📋 收款地址：\n${tronAddress}\n\n📝 备注：AiFriend_${planId}_${currentUser.id}`,
      copyAndOpen: '复制地址并打开钱包',
      copyOnly: '仅复制地址',
      cancel: '取消',
      addressCopied: '✅ 地址已复制！\n\n请在钱包中粘贴地址并完成转账',
      instructions: '📱 支付步骤：\n\n1️⃣ 地址已复制到剪贴板\n2️⃣ 打开 TronLink 或 imToken\n3️⃣ 粘贴地址并输入金额\n4️⃣ 确认转账\n\n⚠️ 请确保：\n- 网络选择 TRON Mainnet (主网)\n- 代币选择 USDT (TRC20)\n- 金额输入 ' + usdtAmount + ' USDT'
    },
    en: {
      title: `TRON Payment (${network})`,
      paymentInfo: `💰 Payment Info\n\nAmount: ${usdtAmount} USDT\nNetwork: TRON Mainnet\n\n📋 Recipient:\n${tronAddress}\n\n📝 Memo: AiFriend_${planId}_${currentUser.id}`,
      copyAndOpen: 'Copy & Open Wallet',
      copyOnly: 'Copy Address Only',
      cancel: 'Cancel',
      addressCopied: '✅ Address copied!\n\nPlease paste in your wallet and complete the transfer',
      instructions: '📱 Payment Steps:\n\n1️⃣ Address copied to clipboard\n2️⃣ Open TronLink or imToken\n3️⃣ Paste address and enter amount\n4️⃣ Confirm transfer\n\n⚠️ Make sure:\n- Network: TRON Mainnet\n- Token: USDT (TRC20)\n- Amount: ' + usdtAmount + ' USDT'
    }
  };
  
  const msg = currentLang === 'zh' ? messages.zh : messages.en;
  
  // 检测环境
  const isTelegramApp = window.Telegram?.WebApp?.initData;
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  try {
    tg.showPopup({
      title: msg.title,
      message: msg.paymentInfo,
      buttons: [
        { id: 'copy', type: 'default', text: msg.copyAndOpen },
        { id: 'verify', type: 'default', text: currentLang === 'zh' ? '验证支付' : 'Verify Payment' },
        { id: 'cancel', type: 'cancel', text: msg.cancel }
      ]
    }, (buttonId) => {
      if (buttonId === 'copy') {
        // 复制地址
        copyToClipboard(tronAddress);
        
        // 显示详细说明
        tg.showAlert(msg.instructions);
        
        // 如果在移动端，尝试打开钱包（但不依赖成功）
        if (isMobile && !isTelegramApp) {
          setTimeout(() => {
            tryOpenWalletApp();
          }, 1000);
        }
      } else if (buttonId === 'verify') {
        // 验证支付
        verifyPaymentForUser(planId, usdtAmount, duration);
      }
    });
  } catch (e) {
    // 浏览器环境回退
    const confirmed = confirm(msg.paymentInfo + '\n\n' + (currentLang === 'zh' ? '点击确定复制地址' : 'Click OK to copy address'));
    if (confirmed) {
      copyToClipboard(tronAddress);
      alert(msg.instructions);
    }
  }
};

// 尝试打开钱包应用（最佳努力，不保证成功）
function tryOpenWalletApp() {
  console.log('📱 Attempting to open wallet app...');
  
  // 尝试多个钱包的 URL Scheme
  const walletUrls = [
    'tronlink://wallet',  // TronLink
    'imtokenv2://navigate/Wallet',  // imToken
    'https://link.trustwallet.com'  // Trust Wallet
  ];
  
  // 依次尝试（静默失败）
  walletUrls.forEach((url, index) => {
    setTimeout(() => {
      try {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = url;
        document.body.appendChild(iframe);
        setTimeout(() => document.body.removeChild(iframe), 100);
      } catch (e) {
        console.log('Failed to open:', url);
      }
    }, index * 300);
  });
}

// 验证用户支付
async function verifyPaymentForUser(planId, amount, duration) {
  const loadingMsg = currentLang === 'zh' 
    ? '🔍 正在验证支付...\n\n这可能需要几秒钟\n请稍候...'
    : '🔍 Verifying payment...\n\nThis may take a few seconds\nPlease wait...';
  
  try {
    tg.showAlert(loadingMsg);
  } catch (e) {
    alert(loadingMsg);
  }
  
  console.log('🔍 Verifying payment:', amount, 'USDT for', duration, 'days');
  
  try {
    // 检查最近1小时内的交易
    const result = await paymentVerifier.checkPayment(currentUser.id, amount, 3600000);
    
    if (result.success) {
      // 验证成功
      const successMsg = currentLang === 'zh'
        ? `✅ 支付验证成功！\n\n交易ID: ${result.txId.substring(0, 20)}...\n金额: ${result.amount} USDT\n\n正在激活会员...`
        : `✅ Payment verified!\n\nTx ID: ${result.txId.substring(0, 20)}...\nAmount: ${result.amount} USDT\n\nActivating membership...`;
      
      try {
        tg.showAlert(successMsg);
      } catch (e) {
        alert(successMsg);
      }
      
      // 📝 记录支付到 Telegram
      try {
        const payment = {
          userId: currentUser.id,
          userName: currentUser.firstName || currentUser.username || 'Unknown',
          planId: planId,
          amount: amount,
          duration: duration,
          txId: result.txId,
          timestamp: result.timestamp || Date.now(),
          status: 'completed'
        };
        
        // 保存到 localStorage（ifriendly_payments - 已存在）
        const payments = JSON.parse(localStorage.getItem('ifriendly_payments') || '[]');
        payments.push(payment);
        localStorage.setItem('ifriendly_payments', JSON.stringify(payments));
        
        // 保存到日志（ifriendly_user_logs - 供后台统一查看）
        const userLogs = JSON.parse(localStorage.getItem('ifriendly_user_logs') || '[]');
        userLogs.push({
          type: 'payment',
          ...payment,
          createdAt: new Date().toISOString()
        });
        localStorage.setItem('ifriendly_user_logs', JSON.stringify(userLogs));
        
        // 发送到 Telegram
        await telegramLogger.logPayment(payment);
        console.log('✅ Payment logged to Telegram and localStorage');
      } catch (error) {
        console.error('Failed to log payment:', error);
      }
      
      // 激活会员
      setTimeout(() => {
        activatePremium(duration);
      }, 1000);
      
    } else {
      // 未找到支付
      const notFoundMsg = currentLang === 'zh'
        ? '❌ 未找到支付记录\n\n请确保：\n✓ 已完成转账\n✓ 交易已确认（约3-5秒）\n✓ 金额正确\n✓ 网络选择 TRON Mainnet (主网)\n\n如果刚刚支付，请等待几秒后重试'
        : '❌ Payment not found\n\nPlease ensure:\n✓ Transfer completed\n✓ Transaction confirmed (~3-5s)\n✓ Correct amount\n✓ Network: TRON Mainnet\n\nIf just paid, wait a few seconds and retry';
      
      try {
        tg.showAlert(notFoundMsg);
      } catch (e) {
        alert(notFoundMsg);
      }
    }
    
  } catch (error) {
    console.error('❌ Verification error:', error);
    
    const errorMsg = currentLang === 'zh'
      ? `❌ 验证失败\n\n错误: ${error.message}\n\n请联系管理员手动验证`
      : `❌ Verification failed\n\nError: ${error.message}\n\nPlease contact admin for manual verification`;
    
    try {
      tg.showAlert(errorMsg);
    } catch (e) {
      alert(errorMsg);
    }
  }
}

// 打开 TRON 钱包进行支付
async function openTronWallet(toAddress, amount, messages) {
  console.log('🔗 Attempting to connect TRON wallet...');
  
  // 检测是否在 Telegram 环境
  const isTelegramApp = window.Telegram?.WebApp?.initData;
  const isWebView = /TelegramWebView/.test(navigator.userAgent);
  
  // 方案1: 检测 TronLink (浏览器扩展)
  if (window.tronWeb && window.tronWeb.ready) {
    try {
      console.log('✅ TronLink detected');
      await payWithTronLink(toAddress, amount, messages);
      return;
    } catch (error) {
      console.error('TronLink payment failed:', error);
    }
  }
  
  // 方案2: 检测 TronLink 移动端
  if (window.tronLink) {
    try {
      console.log('✅ TronLink Mobile detected');
      await window.tronLink.request({ method: 'tron_requestAccounts' });
      await payWithTronLink(toAddress, amount, messages);
      return;
    } catch (error) {
      console.error('TronLink Mobile payment failed:', error);
    }
  }
  
  // 检测是否在移动设备
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  if (isMobile) {
    // 移动端：使用通用钱包链接
    console.log('📱 Mobile device detected, opening wallet...');
    
    // 构建 TRON 支付参数
    const paymentParams = {
      to: toAddress,
      amount: amount,
      token: 'USDT',
      network: 'nile' // 测试网
    };
    
    // 方案1: TronLink URL Scheme (推荐)
    const tronLinkUrl = `tronlink://wallet/transfer?to=${toAddress}&amount=${amount}&token=USDT`;
    
    // 方案2: 通用 Web3 钱包 URL
    const web3Url = `https://link.trustwallet.com/send?asset=c195&address=${toAddress}&amount=${amount}`;
    
    // 显示选择弹窗
    if (isTelegramApp || isWebView) {
      // 在 Telegram 中，使用不同的方式
      const walletMsg = currentLang === 'zh'
        ? `请选择钱包应用:\n\n💎 TronLink\n📱 imToken\n🔐 Trust Wallet\n\n或者复制地址手动转账`
        : `Choose wallet:\n\n💎 TronLink\n📱 imToken\n🔐 Trust Wallet\n\nOr copy address for manual transfer`;
      
      try {
        tg.showPopup({
          title: currentLang === 'zh' ? '选择钱包' : 'Choose Wallet',
          message: walletMsg,
          buttons: [
            { id: 'tronlink', type: 'default', text: 'TronLink' },
            { id: 'imtoken', type: 'default', text: 'imToken' },
            { id: 'manual', type: 'default', text: currentLang === 'zh' ? '手动转账' : 'Manual' }
          ]
        }, (buttonId) => {
          if (buttonId === 'tronlink') {
            openWalletApp('tronlink', toAddress, amount);
          } else if (buttonId === 'imtoken') {
            openWalletApp('imtoken', toAddress, amount);
          } else if (buttonId === 'manual') {
            showManualPaymentInstructions(toAddress, amount);
          }
        });
      } catch (e) {
        // 回退方案
        showManualPaymentInstructions(toAddress, amount);
      }
    } else {
      // 普通浏览器，尝试打开钱包
      const opened = await tryOpenApp(tronLinkUrl, 1000);
      
      if (!opened) {
        // 显示下载提示
        showWalletDownloadLinks();
      }
    }
  } else {
    // 桌面端：引导用户安装浏览器扩展
    const installMsg = currentLang === 'zh' 
      ? '请安装 TronLink 浏览器扩展\n\n或在手机上使用钱包 App'
      : 'Please install TronLink browser extension\n\nOr use wallet app on mobile';
    
    if (confirm(installMsg + '\n\n' + toAddress)) {
      window.open('https://www.tronlink.org/', '_blank');
    }
  }
}

// 打开指定的钱包应用
function openWalletApp(walletType, toAddress, amount) {
  let appUrl = '';
  
  switch(walletType) {
    case 'tronlink':
      // TronLink 通用链接
      appUrl = `tronlink://wallet/transfer?to=${toAddress}&amount=${amount}&token=USDT`;
      break;
    case 'imtoken':
      // imToken 通用链接
      appUrl = `imtokenv2://navigate/DappView?url=${encodeURIComponent('https://tronscan.org')}`;
      break;
    case 'trust':
      // Trust Wallet
      appUrl = `https://link.trustwallet.com/send?asset=c195&address=${toAddress}&amount=${amount}`;
      break;
  }
  
  if (appUrl) {
    console.log('Opening wallet:', walletType, appUrl);
    
    // 尝试打开应用
    window.location.href = appUrl;
    
    // 2秒后显示备用方案
    setTimeout(() => {
      showManualPaymentInstructions(toAddress, amount);
    }, 2000);
  }
}

// 显示手动支付说明
function showManualPaymentInstructions(toAddress, amount) {
  const msg = currentLang === 'zh' 
    ? `请手动在钱包中转账：\n\n收款地址：\n${toAddress}\n\n金额：${amount} USDT\n网络：TRON (TRC20)\n测试网：Nile Testnet`
    : `Please transfer manually:\n\nRecipient:\n${toAddress}\n\nAmount: ${amount} USDT\nNetwork: TRON (TRC20)\nTestnet: Nile`;
  
  try {
    tg.showAlert(msg);
  } catch (e) {
    alert(msg);
  }
  
  // 同时复制地址
  copyToClipboard(toAddress);
}

// 显示钱包下载链接
function showWalletDownloadLinks() {
  const msg = currentLang === 'zh'
    ? '未检测到钱包应用\n\n推荐钱包：\n💎 TronLink: tronlink.org\n📱 imToken: token.im\n🔐 Trust Wallet: trustwallet.com'
    : 'Wallet not detected\n\nRecommended wallets:\n💎 TronLink: tronlink.org\n📱 imToken: token.im\n🔐 Trust Wallet: trustwallet.com';
  
  try {
    tg.showAlert(msg);
  } catch (e) {
    alert(msg);
  }
}

// 使用 TronLink 支付
async function payWithTronLink(toAddress, amount, messages) {
  try {
    if (!window.tronWeb) {
      throw new Error('TronWeb not available');
    }
    
    const tronWeb = window.tronWeb;
    
    // 获取当前账户
    const fromAddress = tronWeb.defaultAddress.base58;
    if (!fromAddress) {
      throw new Error('Please login to TronLink');
    }
    
    console.log('👛 Wallet address:', fromAddress);
    
    // USDT TRC20 合约地址 (Nile 测试网)
    const usdtContract = 'TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj';
    
    // 转换金额 (USDT 有 6 位小数)
    const amountInSun = amount * 1000000;
    
    // 获取合约实例
    const contract = await tronWeb.contract().at(usdtContract);
    
    // 调用 transfer 方法
    const result = await contract.transfer(toAddress, amountInSun).send({
      feeLimit: 100000000, // 100 TRX
      callValue: 0,
      shouldPollResponse: true
    });
    
    console.log('✅ Transaction sent:', result);
    
    tg.showAlert(messages.paymentSuccess + '\n\nTxID: ' + result.substring(0, 20) + '...');
    
    // 可以在这里保存交易ID，等待确认
    // savePaymentTransaction(result, amount);
    
  } catch (error) {
    console.error('❌ Payment error:', error);
    
    const errorMsg = currentLang === 'zh' 
      ? '支付失败：' + error.message 
      : 'Payment failed: ' + error.message;
    
    tg.showAlert(errorMsg);
  }
}

// 尝试打开 App (通过 Deep Link)
function tryOpenApp(url, timeout = 1000) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    // 创建隐藏的 iframe 来触发 deep link
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = url;
    document.body.appendChild(iframe);
    
    // 同时尝试直接打开链接
    window.location.href = url;
    
    // 检测是否成功打开
    setTimeout(() => {
      const endTime = Date.now();
      const timeElapsed = endTime - startTime;
      
      // 清理 iframe
      document.body.removeChild(iframe);
      
      // 如果页面仍然可见，说明没有打开 App
      if (document.hidden || timeElapsed > timeout + 500) {
        resolve(true); // App 可能已打开
      } else {
        resolve(false); // App 未打开
      }
    }, timeout);
  });
}

// 激活会员
function activatePremium(days) {
  // 使用 storage 的 setPremium 方法设置会员状态
  storage.setPremium(currentUser.id, days);
  
  // 重新获取用户数据（包含更新后的会员状态）
  currentUser = storage.getUser(currentUser.id);
  
  // 📝 记录会员激活到 Telegram
  try {
    const expireDate = new Date(currentUser.premiumUntil);
    
    // 保存到日志（ifriendly_user_logs）
    const userLogs = JSON.parse(localStorage.getItem('ifriendly_user_logs') || '[]');
    userLogs.push({
      type: 'membership_activation',
      userId: currentUser.id,
      userName: currentUser.firstName || currentUser.username || 'Unknown',
      duration: days,
      expireDate: expireDate.toISOString(),
      timestamp: Date.now(),
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('ifriendly_user_logs', JSON.stringify(userLogs));
    
    // 发送到 Telegram
    await telegramLogger.logMembershipActivation(
      currentUser.id,
      currentUser.firstName || currentUser.username || 'Unknown',
      days,
      expireDate
    );
    console.log('✅ Membership activation logged to Telegram and localStorage');
  } catch (error) {
    console.error('Failed to log membership activation:', error);
  }
  
  const successMsg = currentLang === 'zh' 
    ? `🎉 恭喜！会员已激活，有效期 ${days} 天\n\n您现在拥有无限对话次数！` 
    : `🎉 Congratulations! Premium activated for ${days} days\n\nYou now have unlimited messages!`;
    
  try {
    tg.showAlert(successMsg);
  } catch (e) {
    alert(successMsg);
  }
  
  // 更新UI显示
  renderMembership();
  updateUI();
  
  console.log('✅ Premium activated successfully:', currentUser);
}

// 复制到剪贴板
function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
  } else {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}

// 渲染设置
function renderSettings() {
  elements.languageSelect.value = currentLang;
  elements.apiKeyInput.value = currentUser.apiKey || '';
}

// 切换语言（从header）
function changeLanguageFromHeader() {
  currentLang = elements.headerLanguageSelect.value;
  storage.updateUser(currentUser.id, { language: currentLang });
  console.log(`Language changed to: ${currentLang}`);
  updateUI();
  
  // 刷新当前视图以应用新语言
  if (currentView === 'roleSquare') {
    renderRoleSquare();
  } else if (currentView === 'chatHistory') {
    renderChatHistory();
  } else if (currentView === 'membership') {
    renderMembership();
  } else if (currentView === 'settings') {
    renderSettings();
  }
  
  try {
    tg.HapticFeedback.impactOccurred('light');
  } catch (e) {
    // Ignore
  }
}

// 切换语言（从设置页）
function changeLanguage() {
  currentLang = elements.languageSelect.value;
  storage.updateUser(currentUser.id, { language: currentLang });
  console.log(`Language changed to: ${currentLang}`);
  updateUI();
  
  // 刷新当前视图以应用新语言
  if (currentView === 'roleSquare') {
    renderRoleSquare();
  } else if (currentView === 'chatHistory') {
    renderChatHistory();
  } else if (currentView === 'membership') {
    renderMembership();
  } else if (currentView === 'settings') {
    renderSettings();
  }
  
  try {
    tg.showAlert(t('cleared', currentLang));
  } catch (e) {
    // Ignore
  }
}

// 保存API Key
function saveApiKey() {
  const apiKey = elements.apiKeyInput.value.trim();
  storage.updateUser(currentUser.id, { apiKey });
}

// 清空历史
function clearHistory() {
  const confirmMessage = t('clearConfirm', currentLang);
  const clearedMessage = t('cleared', currentLang);
  
  try {
    tg.showConfirm(confirmMessage, (confirmed) => {
      if (confirmed) {
        storage.clearConversation(currentUser.id, currentUser.currentRole);
        elements.chatMessages.innerHTML = '';
        addWelcomeMessage();
        tg.showAlert(clearedMessage);
      }
    });
  } catch (e) {
    // Fallback for non-Telegram environment
    if (confirm(confirmMessage)) {
      storage.clearConversation(currentUser.id, currentUser.currentRole);
      elements.chatMessages.innerHTML = '';
      addWelcomeMessage();
      alert(clearedMessage);
    }
  }
}

// 清除当前聊天（从聊天界面）
function clearCurrentChat() {
  const role = getRole(currentUser.currentRole);
  const roleName = t(`roles.${currentUser.currentRole}.name`, currentLang);
  const confirmMessage = `${t('clearConfirm', currentLang)}\n\n${role.emoji} ${roleName}`;
  const clearedMessage = t('cleared', currentLang);
  
  try {
    tg.showConfirm(confirmMessage, (confirmed) => {
      if (confirmed) {
        storage.clearConversation(currentUser.id, currentUser.currentRole);
        tg.showAlert(clearedMessage);
        tg.HapticFeedback.notificationOccurred('success');
        
        // 检查是否还有其他对话
        const conversations = storage.getConversations(currentUser.id);
        const hasHistory = Object.keys(conversations).length > 0;
        
        if (hasHistory) {
          // 还有其他对话，返回历史列表
          showView('chatHistory');
        } else {
          // 没有历史记录了，显示角色广场
          showView('roleSquare');
        }
      }
    });
  } catch (e) {
    // Fallback for non-Telegram environment
    if (confirm(confirmMessage)) {
      storage.clearConversation(currentUser.id, currentUser.currentRole);
      alert(clearedMessage);
      
      // 检查是否还有其他对话
      const conversations = storage.getConversations(currentUser.id);
      const hasHistory = Object.keys(conversations).length > 0;
      
      if (hasHistory) {
        // 还有其他对话，返回历史列表
        showView('chatHistory');
      } else {
        // 没有历史记录了，显示角色广场
        showView('roleSquare');
      }
    }
  }
}

// 清空所有历史（所有角色）
function clearAllHistory() {
  const confirmMessage = '确定要清空所有角色的对话记录吗？此操作不可恢复！';
  
  try {
    tg.showConfirm(confirmMessage, (confirmed) => {
      if (confirmed) {
        const allConvs = storage.getConversations(currentUser.id);
        Object.keys(allConvs).forEach(roleId => {
          storage.clearConversation(currentUser.id, roleId);
        });
        tg.showAlert('所有对话记录已清空');
        // 没有历史记录了，显示角色广场
        showView('roleSquare');
      }
    });
  } catch (e) {
    if (confirm(confirmMessage)) {
      const allConvs = storage.getConversations(currentUser.id);
      Object.keys(allConvs).forEach(roleId => {
        storage.clearConversation(currentUser.id, roleId);
      });
      alert('所有对话记录已清空');
      // 没有历史记录了，显示角色广场
      showView('roleSquare');
    }
  }
}

// 删除单个角色的对话
function deleteRoleConversation(roleId) {
  const role = getRole(roleId);
  const confirmMessage = `确定要删除与 ${t(`roles.${roleId}.name`, currentLang)} 的对话记录吗？`;
  
  try {
    tg.showConfirm(confirmMessage, (confirmed) => {
      if (confirmed) {
        storage.clearConversation(currentUser.id, roleId);
        tg.showAlert('已删除');
        
        // 检查是否还有其他对话
        const conversations = storage.getConversations(currentUser.id);
        const hasHistory = Object.keys(conversations).length > 0;
        
        if (hasHistory) {
          renderChatHistory();
        } else {
          // 没有历史记录了，显示角色广场
          showView('roleSquare');
        }
      }
    });
  } catch (e) {
    if (confirm(confirmMessage)) {
      storage.clearConversation(currentUser.id, roleId);
      alert('已删除');
      
      // 检查是否还有其他对话
      const conversations = storage.getConversations(currentUser.id);
      const hasHistory = Object.keys(conversations).length > 0;
      
      if (hasHistory) {
        renderChatHistory();
      } else {
        // 没有历史记录了，显示角色广场
        showView('roleSquare');
      }
    }
  }
}

// 添加欢迎消息
function addWelcomeMessage() {
  if (elements.chatMessages.children.length === 0) {
    addMessage(t('welcomeMessage', currentLang), false);
  }
}

// 发送消息
async function sendMessage() {
  const message = elements.messageInput.value.trim();
  if (!message) return;
  
  console.log('📤 Sending message with language:', currentLang);
  console.log('📤 Current user language setting:', currentUser.language);
  
  if (!storage.canSendMessage(currentUser.id)) {
    tg.showPopup({
      title: t('noMoreTries', currentLang),
      message: t('upgradeMembership', currentLang),
      buttons: [
        { id: 'upgrade', type: 'default', text: t('becomeMember', currentLang) },
        { id: 'cancel', type: 'cancel' }
      ]
    }, (buttonId) => {
      if (buttonId === 'upgrade') {
        showView('membership');
      }
    });
    return;
  }
  
  addMessage(message, true);
  elements.messageInput.value = '';
  
  storage.addMessage(currentUser.id, currentUser.currentRole, {
    role: 'user',
    content: message
  });
  
  storage.useFreeTry(currentUser.id);
  updateUI();
  
  elements.sendButton.disabled = true;
  
  try {
    const result = await aiService.generateResponse(
      currentUser.id,
      currentUser.currentRole,
      message,
      currentLang  // 传递当前语言
    );
    
    addMessage(result.text, false);
    
    // 如果有图片
    if (result.image) {
      addImageMessage(result.image.url);
    }
    
    storage.addMessage(currentUser.id, currentUser.currentRole, {
      role: 'assistant',
      content: result.text
    });
    
  } catch (error) {
    console.error('AI Error:', error);
    const errorMsg = t('errorSending', currentLang) + ': ' + error.message;
    addMessage(errorMsg, false);
  } finally {
    elements.sendButton.disabled = false;
  }
}

// 添加消息到界面
function addMessage(content, isUser) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
  
  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';
  contentDiv.textContent = content;
  
  const timeDiv = document.createElement('div');
  timeDiv.className = 'message-time';
  timeDiv.textContent = new Date().toLocaleTimeString(currentLang === 'zh' ? 'zh-CN' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  messageDiv.appendChild(contentDiv);
  messageDiv.appendChild(timeDiv);
  elements.chatMessages.appendChild(messageDiv);
  
  elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
  
  if (isUser) {
    tg.HapticFeedback.impactOccurred('light');
  }
}

// 添加图片消息
function addImageMessage(imageUrl) {
  const imageDiv = document.createElement('div');
  imageDiv.className = 'message bot-message image-message';
  
  const img = document.createElement('img');
  img.src = imageUrl;
  img.alt = 'AI Generated Image';
  img.className = 'message-image';
  img.loading = 'lazy';
  
  imageDiv.appendChild(img);
  elements.chatMessages.appendChild(imageDiv);
  
  elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

// 加载对话历史
function loadConversation() {
  elements.chatMessages.innerHTML = '';
  const history = storage.getConversationHistory(currentUser.id, currentUser.currentRole, 20);
  
  history.forEach(msg => {
    addMessage(msg.content, msg.role === 'user');
  });
  
  if (history.length === 0) {
    addWelcomeMessage();
  }
}

// 页面加载完成
document.addEventListener('DOMContentLoaded', init);

console.log('🤖 AiFriend loaded!');
