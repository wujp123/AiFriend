// AiFriend - 主应用逻辑
import { t, detectLanguage } from './i18n.js';
import { roles, getRolesByCategory, getRole, isRoleFree } from './roles.js';
import { storage } from './storage.js';
import { aiService } from './ai.js';
import { config } from './config.js';
import { imageService } from './image.js';

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
function init() {
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

// 渲染角色广场
function renderRoleSquare() {
  const categorized = getRolesByCategory(currentLang);
  elements.roleCategories.innerHTML = '';
  
  Object.entries(categorized).forEach(([category, roleList]) => {
    if (roleList.length === 0) return;
    
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
      
      const roleEmoji = document.createElement('div');
      roleEmoji.className = 'role-emoji';
      roleEmoji.textContent = role.emoji;
      
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
  loadConversation();
  
  tg.HapticFeedback.notificationOccurred('success');
}

// 渲染会员页面
function renderMembership() {
  // 状态
  const isPremium = storage.isPremium(currentUser.id);
  elements.membershipStatusContent.innerHTML = isPremium
    ? '<p class="premium-badge">✨ 您是会员</p>'
    : '<p>免费用户</p>';
  
  // 会员计划
  elements.membershipPlans.innerHTML = `
    <div class="plan-card">
      <h3>月度会员</h3>
      <p class="price">100 Stars</p>
      <ul>
        <li>✓ 无限对话</li>
        <li>✓ 无限图片</li>
        <li>✓ 全部角色</li>
      </ul>
      <button onclick="alert('使用 Telegram Stars 支付')">购买</button>
    </div>
  `;
}

// 渲染设置
function renderSettings() {
  elements.languageSelect.value = currentLang;
  elements.apiKeyInput.value = currentUser.apiKey || '';
}

// 切换语言
function changeLanguage() {
  currentLang = elements.languageSelect.value;
  storage.updateUser(currentUser.id, { language: currentLang });
  updateUI();
  tg.showAlert('语言已切换');
}

// 保存API Key
function saveApiKey() {
  const apiKey = elements.apiKeyInput.value.trim();
  storage.updateUser(currentUser.id, { apiKey });
}

// 清空历史
function clearHistory() {
  tg.showConfirm('确定清空所有对话记录吗？', (confirmed) => {
    if (confirmed) {
      storage.clearConversation(currentUser.id, currentUser.currentRole);
      elements.chatMessages.innerHTML = '';
      addWelcomeMessage();
      tg.showAlert('已清空');
    }
  });
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
    const result = await aiService.generateResponse(
      currentUser.id,
      currentUser.currentRole,
      message
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
    addMessage('抱歉，出现错误了: ' + error.message, false);
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
