# 📊 用户数据查看完整指南

## ✅ 问题已修复

管理后台文件已正确部署到 `public` 文件夹，现在可以正常访问了！

---

## 🎯 访问方式

### 方式1：管理后台（需要密码）⭐

**访问地址**:
```
https://wujp123.github.io/AiFriend/admin.html
```

**登录信息**:
- 密码：`admin123456`

**功能**:
- ✅ 数据概览（用户数、收入等）
- ✅ 用户管理（查看、筛选、导出）
- ✅ 支付记录管理
- ✅ 充值排行榜
- ✅ 手动添加/验证支付

**使用步骤**:
1. 访问上述地址
2. 输入密码：`admin123456`
3. 点击 "登录" 按钮
4. 等待 1-2 分钟 GitHub Pages 部署完成
5. 如果还是不行，强制刷新：`Ctrl+Shift+R` (Windows) 或 `Cmd+Shift+R` (Mac)

---

### 方式2：用户数据查看器（无需密码）⭐ 推荐

**访问地址**:
```
https://wujp123.github.io/AiFriend/view-users.html
```

**无需密码**，直接显示数据！

**功能**:
- ✅ 实时统计（总用户、会员、今日新增、对话数）
- ✅ 用户列表（表格形式）
- ✅ 筛选功能（全部/会员/免费/活跃）
- ✅ 搜索功能（按用户ID或名称）
- ✅ 查看详情（点击查看按钮）
- ✅ 导出数据（CSV/JSON）
- ✅ 对话统计

**使用步骤**:
1. 直接访问上述地址
2. 自动加载并显示所有用户数据
3. 使用筛选和搜索功能查找特定用户
4. 点击 "查看" 按钮查看用户详情
5. 点击 "导出CSV" 或 "导出JSON" 下载数据

---

### 方式3：浏览器开发者工具

**适合**: 开发调试、快速查看

**步骤**:
1. 访问：`https://wujp123.github.io/AiFriend/`
2. 按 `F12` 或 `Cmd+Option+I` 打开开发者工具
3. 切换到 `Console` 标签
4. 运行以下命令

#### 查看所有用户
```javascript
const users = JSON.parse(localStorage.getItem('ifriendly_users'));
console.table(users);
```

#### 查看用户数量
```javascript
const users = JSON.parse(localStorage.getItem('ifriendly_users'));
console.log('总用户数:', Object.keys(users).length);
```

#### 查看会员用户
```javascript
const users = JSON.parse(localStorage.getItem('ifriendly_users'));
const premium = Object.values(users).filter(u => 
  u.isPremium && u.premiumUntil && new Date(u.premiumUntil) > new Date()
);
console.log('会员用户:', premium.length);
console.table(premium);
```

#### 查看特定用户
```javascript
const users = JSON.parse(localStorage.getItem('ifriendly_users'));
const userId = Object.keys(users)[0]; // 第一个用户
console.log('用户详情:', users[userId]);
```

#### 查看对话记录
```javascript
const conversations = JSON.parse(localStorage.getItem('ifriendly_conversations'));
console.log('对话记录:', conversations);
```

#### 查看支付记录
```javascript
const payments = JSON.parse(localStorage.getItem('ifriendly_payments') || '[]');
console.log('支付记录:', payments);
console.table(payments);
```

---

## 📊 数据结构说明

### 用户数据 (ifriendly_users)

```javascript
{
  "user_id": {
    "id": "user_id",                    // 用户ID
    "firstName": "张三",                // 名字
    "lastName": "",                     // 姓氏
    "username": "zhangsan",             // 用户名
    "language": "zh",                   // 语言
    "currentRole": "sister",            // 当前角色
    "freeTries": 5,                     // 剩余免费次数
    "lastReset": "2024-12-10",          // 上次重置日期
    "isPremium": true,                  // 是否会员
    "premiumUntil": "2024-12-17...",    // 会员到期时间
    "createdAt": "2024-12-10...",       // 注册时间
    "apiKey": "",                       // 自定义API Key
    "isAnonymous": false                // 是否匿名用户
  }
}
```

### 对话记录 (ifriendly_conversations)

```javascript
{
  "user_id": {
    "role_id": {
      "messages": [
        {
          "role": "user",
          "content": "你好",
          "timestamp": "2024-12-10..."
        },
        {
          "role": "assistant",
          "content": "你好！有什么可以帮你？",
          "timestamp": "2024-12-10..."
        }
      ],
      "createdAt": "2024-12-10...",
      "updatedAt": "2024-12-10..."
    }
  }
}
```

### 支付记录 (ifriendly_payments)

```javascript
[
  {
    "id": "payment_1",
    "userId": "user_id",
    "amount": 2,
    "planId": "weekly",
    "duration": 7,
    "txId": "transaction_id",
    "timestamp": 1702123456789,
    "createdAt": "2024-12-10..."
  }
]
```

---

## 🛠️ 常用操作

### 1. 查找特定用户

**按用户ID**:
```javascript
const users = JSON.parse(localStorage.getItem('ifriendly_users'));
const user = users['user_id'];
console.log(user);
```

**按名称搜索**:
```javascript
const users = JSON.parse(localStorage.getItem('ifriendly_users'));
const found = Object.values(users).filter(u => 
  u.firstName?.includes('张三')
);
console.table(found);
```

### 2. 统计数据

**总用户数**:
```javascript
const users = JSON.parse(localStorage.getItem('ifriendly_users'));
console.log('总用户数:', Object.keys(users).length);
```

**会员用户数**:
```javascript
const users = JSON.parse(localStorage.getItem('ifriendly_users'));
const premiumCount = Object.values(users).filter(u => 
  u.isPremium && u.premiumUntil && new Date(u.premiumUntil) > new Date()
).length;
console.log('会员用户:', premiumCount);
```

**今日新增用户**:
```javascript
const users = JSON.parse(localStorage.getItem('ifriendly_users'));
const today = new Date().toDateString();
const todayUsers = Object.values(users).filter(u => 
  u.createdAt && new Date(u.createdAt).toDateString() === today
).length;
console.log('今日新增:', todayUsers);
```

### 3. 导出数据

**导出为JSON**:
```javascript
const users = JSON.parse(localStorage.getItem('ifriendly_users'));
const json = JSON.stringify(users, null, 2);
const blob = new Blob([json], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'users.json';
a.click();
```

**导出为CSV**:
```javascript
const users = JSON.parse(localStorage.getItem('ifriendly_users'));
let csv = 'ID,名称,会员状态,会员到期,剩余次数\n';
Object.entries(users).forEach(([id, u]) => {
  const premium = u.isPremium && u.premiumUntil && new Date(u.premiumUntil) > new Date();
  csv += `${id},${u.firstName || ''},${premium ? '会员' : '免费'},${premium ? u.premiumUntil : '-'},${premium ? '∞' : u.freeTries}\n`;
});
const blob = new Blob([csv], { type: 'text/csv' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'users.csv';
a.click();
```

---

## 🔐 安全建议

### 修改管理员密码

管理员密码存储在 `admin.js` 中：

```javascript
// 找到这一行
const ADMIN_PASSWORD = 'admin123456';

// 改为你的密码
const ADMIN_PASSWORD = 'your_strong_password_here';
```

**步骤**:
1. 编辑 `admin.js` 文件
2. 修改密码
3. 复制到 `public/admin.js`
4. 提交并推送到 GitHub

### 限制访问

考虑：
1. 将 admin.html 放在私密位置
2. 添加 IP 白名单（需要后端）
3. 使用更复杂的密码
4. 定期更换密码

---

## 🐛 故障排除

### 问题1：管理后台无法访问

**原因**: GitHub Pages 还在部署

**解决**:
1. 等待 1-2 分钟
2. 强制刷新页面：`Ctrl+Shift+R` (Windows) 或 `Cmd+Shift+R` (Mac)
3. 清除浏览器缓存

### 问题2：输入密码后无反应

**原因**: JavaScript 错误或文件未加载

**解决**:
1. 打开浏览器开发者工具 (F12)
2. 查看 Console 标签的错误信息
3. 检查 Network 标签，确认 admin.js 已加载
4. 尝试直接访问：`https://wujp123.github.io/AiFriend/view-users.html`（无需密码）

### 问题3：看不到用户数据

**原因**: localStorage 为空或在不同域名

**解决**:
1. 确保你在访问 `https://wujp123.github.io/AiFriend/` 时有过交互
2. localStorage 是按域名隔离的
3. 如果是在本地测试，需要使用 `file://` 协议或本地服务器

### 问题4：数据显示不准确

**原因**: 缓存或数据未同步

**解决**:
1. 点击 "刷新数据" 按钮
2. 强制刷新页面
3. 检查浏览器 Console 的错误信息

---

## 📱 移动端访问

所有页面都支持移动端访问：

1. **管理后台**: `https://wujp123.github.io/AiFriend/admin.html`
2. **用户查看**: `https://wujp123.github.io/AiFriend/view-users.html`

在移动设备上访问体验更佳！

---

## ✅ 快速检查清单

- [ ] 等待 1-2 分钟 GitHub Pages 部署完成
- [ ] 访问 admin.html 并输入密码
- [ ] 如果不行，访问 view-users.html（无需密码）
- [ ] 强制刷新页面清除缓存
- [ ] 检查浏览器 Console 是否有错误
- [ ] 确认在正确的域名下访问

---

## 🔗 相关链接

- **应用首页**: https://wujp123.github.io/AiFriend/
- **管理后台**: https://wujp123.github.io/AiFriend/admin.html
- **用户查看**: https://wujp123.github.io/AiFriend/view-users.html
- **Telegram Bot**: t.me/iFriendly_Ai_Bot/ifriendly_app
- **GitHub 仓库**: https://github.com/wujp123/AiFriend

---

## 📞 获取帮助

如果还有问题：

1. 检查浏览器 Console (F12) 的错误信息
2. 尝试使用无密码的用户查看器
3. 清除浏览器缓存后重试
4. 等待几分钟让 GitHub Pages 完成部署

---

**文档版本**: 1.0  
**创建日期**: 2024-12-10  
**更新日期**: 2024-12-10  
**状态**: ✅ 已修复
