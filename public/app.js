// AiFriend - 主应用逻辑
import { t, detectLanguage, getSupportedLanguages } from './i18n.js';
import { roles, getRolesByCategory, getRole, isRoleFree } from './roles.js';
import { storage } from './storage.js';
import { aiService } from './ai.js';
import { config } from './config.js';
import { imageService } from './image.js';
import { languageDetector } from './lang-detect.js';

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
  console.log('🚀 Initializing AiFriend...');
  
  const user = tg.initDataUnsafe.user;
  const userId = user?.id || 'demo_user';
  console.log('User ID:', userId);
  
  currentUser = storage.getUser(userId);
  console.log('Current user:', currentUser);
  
  // 智能语言检测（优先级：用户设置 > Telegram > IP > 浏览器）
  if (currentUser.language) {
    currentLang = currentUser.language;
    console.log(`Using saved user language: ${currentLang}`);
  } else {
    // 使用智能语言检测
    try {
      currentLang = await languageDetector.detect(user?.language_code, currentUser.language);
      currentUser.language = currentLang;
      storage.updateUser(userId, currentUser);
      console.log(`Auto-detected language: ${currentLang}`);
    } catch (e) {
      console.error('Language detection failed:', e);
      currentLang = 'en';
    }
  }
  
  // 检查是否首次访问
  const hasVisitedBefore = localStorage.getItem('hasVisited');
  isFirstTimeUser = !hasVisitedBefore;
  console.log('Is first time user:', isFirstTimeUser);
  
  setupEventListeners();
  updateUI();
  
  // 决定初始显示哪个视图
  if (isFirstTimeUser) {
    // 首次访问 - 显示角色广场
    console.log('📱 Showing role square for first-time user');
    localStorage.setItem('hasVisited', 'true');
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
  
  console.log('✅ AiFriend initialized successfully');
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
