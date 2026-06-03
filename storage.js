// 本地存储管理（使用 localStorage）
import { config } from './config.js';

export class Storage {
  constructor() {
    this.keys = config.storageKeys;
  }
  
  // 用户数据管理
  getUser(userId) {
    const users = this.getAllUsers();
    
    if (!users[userId]) {
      users[userId] = {
        id: userId,
        language: 'zh',
        currentRole: 'sister',
        freeTries: config.freeQuota.dailyMessages,
        lastReset: new Date().toDateString(),
        isPremium: false,
        premiumUntil: null,
        createdAt: new Date().toISOString(),
        apiKey: '' // 用户可以设置自己的 API Key
      };
      this.saveAllUsers(users);
    }
    
    const user = users[userId];
    
    // 每天重置免费次数
    const today = new Date().toDateString();
    if (user.lastReset !== today && !this.isPremium(userId)) {
      user.freeTries = config.freeQuota.dailyMessages;
      user.lastReset = today;
      this.saveUser(userId, user);
    }
    
    return user;
  }
  
  getAllUsers() {
    try {
      return JSON.parse(localStorage.getItem(this.keys.user) || '{}');
    } catch {
      return {};
    }
  }
  
  saveAllUsers(users) {
    localStorage.setItem(this.keys.user, JSON.stringify(users));
  }
  
  saveUser(userId, userData) {
    const users = this.getAllUsers();
    users[userId] = userData;
    this.saveAllUsers(users);
  }
  
  updateUser(userId, updates) {
    const user = this.getUser(userId);
    Object.assign(user, updates);
    this.saveUser(userId, user);
    return user;
  }
  
  // 会员管理
  isPremium(userId) {
    const user = this.getUser(userId);
    if (user.isPremium && user.premiumUntil) {
      return new Date() < new Date(user.premiumUntil);
    }
    return false;
  }
  
  setPremium(userId, days) {
    const user = this.getUser(userId);
    const until = new Date();
    
    if (days === -1) {
      // 终身会员
      until.setFullYear(until.getFullYear() + 100);
    } else {
      until.setDate(until.getDate() + days);
    }
    
    user.isPremium = true;
    user.premiumUntil = until.toISOString();
    this.saveUser(userId, user);
    return user;
  }
  
  // 使用次数管理
  canSendMessage(userId) {
    if (this.isPremium(userId)) {
      return true;
    }
    
    const user = this.getUser(userId);
    return user.freeTries > 0;
  }
  
  useFreeTry(userId) {
    if (this.isPremium(userId)) {
      return true;
    }
    
    const user = this.getUser(userId);
    if (user.freeTries > 0) {
      user.freeTries--;
      this.saveUser(userId, user);
      return true;
    }
    
    return false;
  }
  
  getRemainingTries(userId) {
    if (this.isPremium(userId)) {
      return Infinity;
    }
    return this.getUser(userId).freeTries;
  }
  
  // 对话历史管理
  getConversations(userId) {
    try {
      const allConvs = JSON.parse(localStorage.getItem(this.keys.conversations) || '{}');
      return allConvs[userId] || {};
    } catch {
      return {};
    }
  }
  
  getConversation(userId, roleId) {
    const convs = this.getConversations(userId);
    if (!convs[roleId]) {
      convs[roleId] = {
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.saveConversations(userId, convs);
    }
    return convs[roleId];
  }
  
  saveConversations(userId, conversations) {
    try {
      const allConvs = JSON.parse(localStorage.getItem(this.keys.conversations) || '{}');
      allConvs[userId] = conversations;
      localStorage.setItem(this.keys.conversations, JSON.stringify(allConvs));
    } catch (e) {
      console.error('保存对话失败:', e);
    }
  }
  
  addMessage(userId, roleId, message) {
    const convs = this.getConversations(userId);
    const conv = this.getConversation(userId, roleId);
    
    conv.messages.push({
      ...message,
      timestamp: new Date().toISOString()
    });
    conv.updatedAt = new Date().toISOString();
    
    // 限制消息数量（会员可以存更多）
    const maxMessages = this.isPremium(userId) ? 200 : 100;
    if (conv.messages.length > maxMessages) {
      conv.messages = conv.messages.slice(-maxMessages);
    }
    
    convs[roleId] = conv;
    this.saveConversations(userId, convs);
    return conv;
  }
  
  clearConversation(userId, roleId) {
    const convs = this.getConversations(userId);
    delete convs[roleId];
    this.saveConversations(userId, convs);
  }
  
  getConversationHistory(userId, roleId, limit = 10) {
    const conv = this.getConversation(userId, roleId);
    return conv.messages.slice(-limit);
  }
}

// 导出单例
export const storage = new Storage();
