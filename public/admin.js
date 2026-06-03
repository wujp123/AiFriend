// iFriendly AI - 管理后台
import { storage } from './storage.js';

// 管理员配置
const ADMIN_CONFIG = {
  // 设置管理员密码（建议使用环境变量，这里为演示）
  password: 'admin123456', // 请修改为强密码！
  sessionKey: 'admin_session'
};

// 套餐价格配置
const PLAN_PRICES = {
  weekly: { price: 2, days: 7, name: '周会员' },
  monthly: { price: 5, days: 30, name: '月会员' },
  quarterly: { price: 13, days: 90, name: '季度会员' },
  yearly: { price: 40, days: 365, name: '年会员' }
};

// DOM 元素
const elements = {
  // 视图
  loginView: document.getElementById('loginView'),
  adminView: document.getElementById('adminView'),
  
  // 登录
  adminPassword: document.getElementById('adminPassword'),
  loginBtn: document.getElementById('loginBtn'),
  loginError: document.getElementById('loginError'),
  logoutBtn: document.getElementById('logoutBtn'),
  
  // 导航
  navTabs: document.querySelectorAll('.nav-tab'),
  tabContents: document.querySelectorAll('.tab-content'),
  
  // 刷新
  refreshBtn: document.getElementById('refreshBtn'),
  
  // 概览统计
  totalUsers: document.getElementById('totalUsers'),
  premiumUsers: document.getElementById('premiumUsers'),
  totalRevenue: document.getElementById('totalRevenue'),
  todayRevenue: document.getElementById('todayRevenue'),
  
  // 收款记录
  paymentsTableBody: document.getElementById('paymentsTableBody'),
  addPaymentBtn: document.getElementById('addPaymentBtn'),
  exportPaymentsBtn: document.getElementById('exportPaymentsBtn'),
  paymentStatusFilter: document.getElementById('paymentStatusFilter'),
  paymentDateFilter: document.getElementById('paymentDateFilter'),
  paymentSearchInput: document.getElementById('paymentSearchInput'),
  
  // 排行榜
  leaderboardList: document.getElementById('leaderboardList'),
  leaderboardPeriod: document.getElementById('leaderboardPeriod'),
  
  // 用户管理
  usersTableBody: document.getElementById('usersTableBody'),
  exportUsersBtn: document.getElementById('exportUsersBtn'),
  userTypeFilter: document.getElementById('userTypeFilter'),
  userSearchInput: document.getElementById('userSearchInput'),
  
  // 弹窗
  addPaymentModal: document.getElementById('addPaymentModal'),
  newPaymentUserId: document.getElementById('newPaymentUserId'),
  newPaymentPlan: document.getElementById('newPaymentPlan'),
  newPaymentTxId: document.getElementById('newPaymentTxId'),
  newPaymentNote: document.getElementById('newPaymentNote'),
  confirmPaymentBtn: document.getElementById('confirmPaymentBtn'),
  cancelPaymentBtn: document.getElementById('cancelPaymentBtn')
};

// 初始化
function init() {
  console.log('🔧 Initializing Admin Panel...');
  
  // 检查是否已登录
  if (isLoggedIn()) {
    showAdminView();
  } else {
    showLoginView();
  }
  
  setupEventListeners();
}

// 设置事件监听
function setupEventListeners() {
  // 登录
  elements.loginBtn.addEventListener('click', handleLogin);
  elements.adminPassword.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleLogin();
  });
  elements.logoutBtn.addEventListener('click', handleLogout);
  
  // 导航标签
  elements.navTabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });
  
  // 刷新
  elements.refreshBtn.addEventListener('click', refreshAllData);
  
  // 收款记录
  elements.addPaymentBtn.addEventListener('click', showAddPaymentModal);
  elements.exportPaymentsBtn.addEventListener('click', exportPayments);
  elements.confirmPaymentBtn.addEventListener('click', confirmAddPayment);
  elements.cancelPaymentBtn.addEventListener('click', closeAddPaymentModal);
  elements.paymentStatusFilter.addEventListener('change', filterPayments);
  elements.paymentSearchInput.addEventListener('input', filterPayments);
  
  // 排行榜
  elements.leaderboardPeriod.addEventListener('change', renderLeaderboard);
  
  // 用户管理
  elements.exportUsersBtn.addEventListener('click', exportUsers);
  elements.userTypeFilter.addEventListener('change', filterUsers);
  elements.userSearchInput.addEventListener('input', filterUsers);
  
  // 弹窗关闭
  const modalClose = document.querySelector('.modal-close');
  if (modalClose) {
    modalClose.addEventListener('click', closeAddPaymentModal);
  }
}

// 登录处理
function handleLogin() {
  const password = elements.adminPassword.value.trim();
  
  if (!password) {
    elements.loginError.textContent = '请输入密码';
    return;
  }
  
  if (password === ADMIN_CONFIG.password) {
    // 登录成功
    sessionStorage.setItem(ADMIN_CONFIG.sessionKey, 'true');
    showAdminView();
  } else {
    // 登录失败
    elements.loginError.textContent = '密码错误，请重试';
    elements.adminPassword.value = '';
  }
}

// 登出处理
function handleLogout() {
  if (confirm('确定要登出吗？')) {
    sessionStorage.removeItem(ADMIN_CONFIG.sessionKey);
    showLoginView();
  }
}

// 检查登录状态
function isLoggedIn() {
  return sessionStorage.getItem(ADMIN_CONFIG.sessionKey) === 'true';
}

// 显示登录界面
function showLoginView() {
  elements.loginView.classList.remove('hidden');
  elements.adminView.classList.add('hidden');
  elements.adminPassword.value = '';
  elements.loginError.textContent = '';
}

// 显示管理界面
function showAdminView() {
  elements.loginView.classList.add('hidden');
  elements.adminView.classList.remove('hidden');
  refreshAllData();
}

// 切换标签
function switchTab(tabName) {
  // 更新导航状态
  elements.navTabs.forEach(tab => {
    if (tab.dataset.tab === tabName) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
  
  // 更新内容显示
  elements.tabContents.forEach(content => {
    if (content.id === tabName + 'Tab') {
      content.classList.add('active');
    } else {
      content.classList.remove('active');
    }
  });
  
  // 刷新对应数据
  switch(tabName) {
    case 'dashboard':
      renderDashboard();
      break;
    case 'payments':
      renderPayments();
      break;
    case 'leaderboard':
      renderLeaderboard();
      break;
    case 'users':
      renderUsers();
      break;
  }
}

// 刷新所有数据
function refreshAllData() {
  console.log('🔄 Refreshing all data...');
  renderDashboard();
  renderPayments();
  renderLeaderboard();
  renderUsers();
}

// 渲染概览页
function renderDashboard() {
  const users = getAllUsers();
  const payments = getPayments();
  
  // 统计数据
  const totalUsers = users.length;
  const premiumUsers = users.filter(u => isPremiumUser(u)).length;
  const totalRevenue = calculateTotalRevenue(payments);
  const todayRevenue = calculateTodayRevenue(payments);
  
  elements.totalUsers.textContent = totalUsers;
  elements.premiumUsers.textContent = premiumUsers;
  elements.totalRevenue.textContent = `$${totalRevenue}`;
  elements.todayRevenue.textContent = `$${todayRevenue}`;
}

// 渲染收款记录
function renderPayments() {
  const payments = getPayments();
  
  if (payments.length === 0) {
    elements.paymentsTableBody.innerHTML = `
      <tr>
        <td colspan="8" class="empty-state">
          <div class="empty-state-icon">💰</div>
          <p>暂无收款记录</p>
        </td>
      </tr>
    `;
    return;
  }
  
  elements.paymentsTableBody.innerHTML = payments.map(payment => `
    <tr data-payment-id="${payment.id}">
      <td>${formatDate(payment.timestamp)}</td>
      <td>${payment.userId}</td>
      <td>${payment.userName || '-'}</td>
      <td>${payment.planName}</td>
      <td>$${payment.amount}</td>
      <td>${payment.txId ? payment.txId.substring(0, 10) + '...' : '-'}</td>
      <td><span class="status-badge status-${payment.status}">${getStatusText(payment.status)}</span></td>
      <td>
        ${payment.status === 'pending' ? `
          <button class="action-btn action-verify" onclick="window.verifyPayment('${payment.id}')">✓ 确认</button>
          <button class="action-btn action-reject" onclick="window.rejectPayment('${payment.id}')">✗ 拒绝</button>
        ` : `
          <button class="action-btn action-edit" onclick="window.viewPayment('${payment.id}')">查看</button>
        `}
      </td>
    </tr>
  `).join('');
}

// 渲染排行榜
function renderLeaderboard() {
  const period = elements.leaderboardPeriod.value;
  const leaderboard = getLeaderboard(period);
  
  if (leaderboard.length === 0) {
    elements.leaderboardList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🏆</div>
        <p>暂无充值记录</p>
      </div>
    `;
    return;
  }
  
  elements.leaderboardList.innerHTML = leaderboard.map((item, index) => {
    const rank = index + 1;
    const rankClass = rank <= 3 ? `rank-${rank}` : '';
    const initial = item.userName ? item.userName[0].toUpperCase() : 'U';
    
    return `
      <div class="leaderboard-item">
        <div class="leaderboard-rank ${rankClass}">#${rank}</div>
        <div class="leaderboard-avatar">${initial}</div>
        <div class="leaderboard-info">
          <div class="leaderboard-name">${item.userName || '用户' + item.userId.substring(0, 8)}</div>
          <div class="leaderboard-id">ID: ${item.userId}</div>
        </div>
        <div class="leaderboard-amount">$${item.totalAmount}</div>
      </div>
    `;
  }).join('');
}

// 渲染用户列表
function renderUsers() {
  const users = getAllUsers();
  
  if (users.length === 0) {
    elements.usersTableBody.innerHTML = `
      <tr>
        <td colspan="7" class="empty-state">
          <div class="empty-state-icon">👥</div>
          <p>暂无用户数据</p>
        </td>
      </tr>
    `;
    return;
  }
  
  elements.usersTableBody.innerHTML = users.map(user => {
    const isPremium = isPremiumUser(user);
    const totalSpent = getUserTotalSpent(user.id);
    
    return `
      <tr data-user-id="${user.id}">
        <td>${user.id}</td>
        <td>${user.firstName || user.username || '-'}</td>
        <td><span class="status-badge status-${isPremium ? 'premium' : 'free'}">${isPremium ? '会员' : '免费'}</span></td>
        <td>${user.createdAt ? formatDate(user.createdAt) : '-'}</td>
        <td>$${totalSpent}</td>
        <td>${isPremium && user.membership ? formatDate(user.membership.expireAt) : '-'}</td>
        <td>
          <button class="action-btn action-edit" onclick="window.editUser('${user.id}')">编辑</button>
        </td>
      </tr>
    `;
  }).join('');
}

// 获取所有用户
function getAllUsers() {
  const users = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('user_')) {
      try {
        const user = JSON.parse(localStorage.getItem(key));
        users.push(user);
      } catch (e) {
        console.error('Failed to parse user:', key, e);
      }
    }
  }
  return users;
}

// 获取收款记录
function getPayments() {
  const paymentsData = localStorage.getItem('admin_payments');
  return paymentsData ? JSON.parse(paymentsData) : [];
}

// 保存收款记录
function savePayments(payments) {
  localStorage.setItem('admin_payments', JSON.stringify(payments));
}

// 添加收款记录
function addPayment(payment) {
  const payments = getPayments();
  payment.id = 'pay_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
  payment.timestamp = Date.now();
  payments.unshift(payment);
  savePayments(payments);
  return payment.id;
}

// 显示添加收款弹窗
function showAddPaymentModal() {
  elements.addPaymentModal.classList.remove('hidden');
}

// 关闭添加收款弹窗
function closeAddPaymentModal() {
  elements.addPaymentModal.classList.add('hidden');
  elements.newPaymentUserId.value = '';
  elements.newPaymentPlan.value = 'weekly';
  elements.newPaymentTxId.value = '';
  elements.newPaymentNote.value = '';
}

// 确认添加收款
function confirmAddPayment() {
  const userId = elements.newPaymentUserId.value.trim();
  const planId = elements.newPaymentPlan.value;
  const txId = elements.newPaymentTxId.value.trim();
  const note = elements.newPaymentNote.value.trim();
  
  if (!userId) {
    alert('请输入用户ID');
    return;
  }
  
  const plan = PLAN_PRICES[planId];
  const user = storage.getUser(userId);
  
  const payment = {
    userId: userId,
    userName: user.firstName || user.username || '',
    planId: planId,
    planName: plan.name,
    amount: plan.price,
    days: plan.days,
    txId: txId || '',
    note: note || '',
    status: 'completed'
  };
  
  const paymentId = addPayment(payment);
  
  // 激活会员
  activateUserPremium(userId, plan.days);
  
  closeAddPaymentModal();
  refreshAllData();
  
  alert('✅ 收款记录已添加，会员已激活');
}

// 激活用户会员
function activateUserPremium(userId, days) {
  const user = storage.getUser(userId);
  const currentExpireAt = user.membership?.expireAt || Date.now();
  const newExpireAt = Math.max(Date.now(), currentExpireAt) + days * 24 * 60 * 60 * 1000;
  
  storage.updateUser(userId, {
    membership: {
      type: 'premium',
      expireAt: newExpireAt
    }
  });
}

// 验证收款
window.verifyPayment = function(paymentId) {
  const payments = getPayments();
  const payment = payments.find(p => p.id === paymentId);
  
  if (!payment) return;
  
  if (confirm(`确认验证此收款？\n用户：${payment.userId}\n金额：$${payment.amount}`)) {
    payment.status = 'completed';
    savePayments(payments);
    
    // 激活会员
    activateUserPremium(payment.userId, payment.days);
    
    refreshAllData();
    alert('✅ 收款已确认，会员已激活');
  }
};

// 拒绝收款
window.rejectPayment = function(paymentId) {
  const payments = getPayments();
  const payment = payments.find(p => p.id === paymentId);
  
  if (!payment) return;
  
  if (confirm(`确认拒绝此收款？\n用户：${payment.userId}\n金额：$${payment.amount}`)) {
    payment.status = 'failed';
    savePayments(payments);
    refreshAllData();
    alert('❌ 收款已拒绝');
  }
};

// 查看收款详情
window.viewPayment = function(paymentId) {
  const payments = getPayments();
  const payment = payments.find(p => p.id === paymentId);
  
  if (!payment) return;
  
  const details = `
收款详情：

用户ID: ${payment.userId}
用户名: ${payment.userName || '-'}
套餐: ${payment.planName}
金额: $${payment.amount}
交易ID: ${payment.txId || '-'}
状态: ${getStatusText(payment.status)}
时间: ${formatDate(payment.timestamp)}
备注: ${payment.note || '-'}
  `;
  
  alert(details);
};

// 编辑用户
window.editUser = function(userId) {
  alert(`用户编辑功能开发中...\n用户ID: ${userId}`);
};

// 导出收款记录
function exportPayments() {
  const payments = getPayments();
  const csv = generateCSV(payments, [
    { key: 'timestamp', label: '时间', format: formatDate },
    { key: 'userId', label: '用户ID' },
    { key: 'userName', label: '用户名' },
    { key: 'planName', label: '套餐' },
    { key: 'amount', label: '金额' },
    { key: 'txId', label: '交易ID' },
    { key: 'status', label: '状态', format: getStatusText },
    { key: 'note', label: '备注' }
  ]);
  
  downloadCSV(csv, `payments_${formatDate(Date.now())}.csv`);
}

// 导出用户列表
function exportUsers() {
  const users = getAllUsers();
  const csv = generateCSV(users.map(u => ({
    ...u,
    isPremium: isPremiumUser(u),
    totalSpent: getUserTotalSpent(u.id)
  })), [
    { key: 'id', label: '用户ID' },
    { key: 'firstName', label: '名字' },
    { key: 'username', label: '用户名' },
    { key: 'isPremium', label: '会员状态', format: v => v ? '会员' : '免费' },
    { key: 'totalSpent', label: '累计充值' },
    { key: 'createdAt', label: '注册时间', format: formatDate }
  ]);
  
  downloadCSV(csv, `users_${formatDate(Date.now())}.csv`);
}

// 生成 CSV
function generateCSV(data, columns) {
  const header = columns.map(col => col.label).join(',');
  const rows = data.map(item => {
    return columns.map(col => {
      let value = item[col.key] || '';
      if (col.format) {
        value = col.format(value);
      }
      return `"${value}"`;
    }).join(',');
  });
  
  return [header, ...rows].join('\n');
}

// 下载 CSV
function downloadCSV(csv, filename) {
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

// 过滤收款记录
function filterPayments() {
  // 实现过滤逻辑
  renderPayments();
}

// 过滤用户
function filterUsers() {
  // 实现过滤逻辑
  renderUsers();
}

// 获取排行榜
function getLeaderboard(period) {
  const payments = getPayments().filter(p => p.status === 'completed');
  const userAmounts = {};
  
  // 过滤时间范围
  const now = Date.now();
  const filtered = payments.filter(p => {
    if (period === 'all') return true;
    if (period === 'month') return now - p.timestamp < 30 * 24 * 60 * 60 * 1000;
    if (period === 'week') return now - p.timestamp < 7 * 24 * 60 * 60 * 1000;
    return true;
  });
  
  // 统计每个用户的充值总额
  filtered.forEach(payment => {
    if (!userAmounts[payment.userId]) {
      userAmounts[payment.userId] = {
        userId: payment.userId,
        userName: payment.userName,
        totalAmount: 0
      };
    }
    userAmounts[payment.userId].totalAmount += payment.amount;
  });
  
  // 排序
  return Object.values(userAmounts)
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 50); // 只显示前50名
}

// 计算总收入
function calculateTotalRevenue(payments) {
  return payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);
}

// 计算今日收入
function calculateTodayRevenue(payments) {
  const today = new Date().setHours(0, 0, 0, 0);
  return payments
    .filter(p => p.status === 'completed' && p.timestamp >= today)
    .reduce((sum, p) => sum + p.amount, 0);
}

// 获取用户累计充值
function getUserTotalSpent(userId) {
  const payments = getPayments();
  return payments
    .filter(p => p.userId === userId && p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);
}

// 判断是否为会员
function isPremiumUser(user) {
  return user.membership && user.membership.expireAt > Date.now();
}

// 格式化日期
function formatDate(timestamp) {
  if (!timestamp) return '-';
  const date = new Date(timestamp);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// 获取状态文本
function getStatusText(status) {
  const statusMap = {
    pending: '待确认',
    completed: '已完成',
    failed: '已失败'
  };
  return statusMap[status] || status;
}

// 初始化
init();
