// AiFriend - 主应用逻辑
import { t, detectLanguage } from './i18n.js';
import { roles, getRolesByCategory, getRole, isRoleFree } from './roles.js';
import { storage } from './storage.js';
import { aiService } from './ai.js';
import { config } from './config.js';

// Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand();
tg.enableClosingConfirmation();

// 全局状态
let currentLang = 'zh';
let currentUser = null;
let currentView = 'main';

// DOM 元素
const elements = {
  // Header
  roleBtn: document.getElementById('roleBtn'),
  currentRoleEmoji: document.getElementById('currentRoleEmoji'),
  roleStatus: document.getElementById('roleStatus'),
  quotaBtn: document.getElementById('quotaBtn'),
  quotaText: document.getElementById('quotaText'),
  settingsBtn: document.getElementById('settingsBtn'),
  
  // Main view
  mainView: document.getElementById('mainView'),
  chatMessages: document.getElementById('chatMessages'),
  messageInput: document.getElementById('messageInput'),
  sendButton: document.getElementById('sendButton'),
  
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
  const user = tg.initDataUnsafe.user;
  const userId = user?.id || 'demo_user';
  
  currentUser = storage.getUser(userId);
  currentLang = detectLanguage(user?.language_code) || currentUser.language;
  
  setupEventListeners();
  updateUI();
  loadConversation();
  addWelcomeMessage();
}

// 设置事件监听
function setupEventListeners() {
  // 导航
  elements.roleBtn.addEventListener('click', () => showView('roleSquare'));
  elements.quotaBtn.addEventListener('click', () => showView('membership'));
  elements.settingsBtn.addEventListener('click', () => showView('settings'));
  
  // 返回按钮
  elements.backFromRoles.addEventListener('click', () => showView('main'));
  elements.backFromMembership.addEventListener('click', () => showView('main'));
  elements.backFromSettings.addEventListener('click', () => showView('main'));
  
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
  currentView = viewName;
  
  elements.mainView.classList.add('hidden');
  elements.roleSquareView.classList.add('hidden');
  elements.membershipView.classList.add('hidden');
  elements.settingsView.classList.add('hidden');
  
  if (viewName === 'main') {
    elements.mainView.classList.remove('hidden');
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
  
  tg.HapticFeedback.impactOccurred('light');
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
    const reply = await aiService.generateResponse(
      currentUser.id,
      currentUser.currentRole,
      message
    );
    
    addMessage(reply, false);
    
    storage.addMessage(currentUser.id, currentUser.currentRole, {
      role: 'assistant',
      content: reply
    });
    
  } catch (error) {
    console.error('AI Error:', error);
    tg.showAlert(error.message || t('networkError', currentLang));
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

// 加载对话历史
function loadConversation() {
  const history = storage.getConversationHistory(currentUser.id, currentUser.currentRole, 20);
  
  history.forEach(msg => {
    addMessage(msg.content, msg.role === 'user');
  });
}

// 页面加载完成
document.addEventListener('DOMContentLoaded', init);

console.log('🤖 AiFriend loaded!');
