# 💳 钱包集成说明

## ✅ 已实现的功能

现在用户可以通过以下方式支付：

### 1. 🔗 **一键打开钱包支付**（推荐）
- 自动检测并调用 TronLink 钱包
- 支持 imToken 钱包
- 自动填充收款地址和金额
- 用户只需在钱包中确认即可

### 2. 📋 **复制地址手动支付**（备用）
- 复制收款地址到剪贴板
- 用户手动在钱包中转账

---

## 🎯 支持的钱包

### TronLink（优先支持）
- **浏览器扩展**：Chrome、Firefox、Edge
- **移动端 App**：iOS、Android
- **Deep Link**：`tronlinkoutside://`
- **官网**：https://www.tronlink.org/

### imToken（备用支持）
- **移动端 App**：iOS、Android
- **Deep Link**：`imtokenv2://`
- **官网**：https://token.im/

---

## 📱 用户体验流程

### 桌面端（浏览器）

1. 用户点击 **"TRON 支付"** 按钮
2. 弹窗显示支付信息和两个选项：
   - **打开钱包支付** - 调用 TronLink 浏览器扩展
   - **复制地址** - 手动复制地址
3. 如果安装了 TronLink 扩展：
   - 自动连接钱包
   - 自动填充收款地址和金额
   - 用户确认后完成支付
4. 如果未安装：
   - 提示安装 TronLink 扩展
   - 提供下载链接

### 移动端（Telegram Mini App）

1. 用户点击 **"TRON 支付"** 按钮
2. 弹窗显示支付信息
3. 点击 **"打开钱包支付"**：
   - 尝试打开 TronLink App
   - 如果失败，尝试打开 imToken App
   - 如果都没安装，显示下载链接
4. 钱包打开后：
   - 用户在钱包中完成转账
   - 返回 Telegram 继续使用

---

## 🔧 技术实现

### 钱包检测逻辑

```javascript
// 1. 检测 TronLink 浏览器扩展
if (window.tronWeb && window.tronWeb.ready) {
  // 使用 TronLink API
}

// 2. 检测 TronLink 移动端
if (window.tronLink) {
  // 使用 TronLink 移动 API
}

// 3. 尝试 Deep Link (移动端)
// TronLink: tronlinkoutside://
// imToken: imtokenv2://
```

### 支付流程

```javascript
// 1. 获取用户钱包地址
const fromAddress = tronWeb.defaultAddress.base58;

// 2. 连接 USDT 合约 (Nile 测试网)
const usdtContract = 'TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj';
const contract = await tronWeb.contract().at(usdtContract);

// 3. 发起转账
const result = await contract.transfer(
  toAddress,      // 收款地址
  amount * 1000000, // USDT 金额 (6位小数)
).send({
  feeLimit: 100000000, // 手续费限制
  shouldPollResponse: true // 等待确认
});

// 4. 获取交易哈希
console.log('TxID:', result);
```

---

## 🧪 测试指南

### 准备工作

1. **安装 TronLink**
   - 浏览器：安装 Chrome 扩展
   - 手机：下载 TronLink App

2. **切换到 Nile 测试网**
   - 打开 TronLink 设置
   - 切换网络 → Nile Testnet

3. **获取测试币**
   - 访问：https://nileex.io/join/getJoinPage
   - 输入钱包地址
   - 领取测试 TRX 和 USDT

### 测试步骤

#### 浏览器测试

1. 打开 https://wujp123.github.io/AiFriend/
2. 安装并登录 TronLink 扩展
3. 切换到 Nile 测试网
4. 在应用中点击会员页面
5. 选择套餐，点击 TRON 支付
6. 点击 **"打开钱包支付"**
7. TronLink 弹窗自动打开
8. 确认交易信息
9. 点击确认支付
10. 等待交易确认（约3秒）

#### 移动端测试

1. 在手机上安装 TronLink App
2. 切换到 Nile 测试网
3. 打开 Telegram
4. 访问 @iFriendly_Ai_Bot
5. 打开 Mini App
6. 点击会员页面
7. 选择套餐，点击 TRON 支付
8. 点击 **"打开钱包支付"**
9. 跳转到 TronLink App
10. 确认并支付
11. 返回 Telegram

---

## ⚙️ 配置说明

### USDT 合约地址

**Nile 测试网**：
```javascript
const usdtContract = 'TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj';
```

**主网**（上线时替换）：
```javascript
const usdtContract = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
```

### 收款地址

**当前测试地址**：
```
TZ2Q6fXRP44bu28R4WTdMB3Tzf7TXfGR6m
```

**上线时更换为你的主网地址**

### 网络配置

在 `app.js` 和 `public/app.js` 中修改：

```javascript
// 测试网
const network = 'Nile Testnet';

// 主网
const network = 'Mainnet';
```

---

## 🐛 常见问题

### Q1: TronLink 扩展检测不到？

**检查**：
1. 确认已安装 TronLink 扩展
2. 刷新页面
3. 检查浏览器控制台是否有错误

### Q2: 支付时提示 "TronWeb not available"？

**解决**：
1. 确保 TronLink 已登录
2. 检查网络是否切换到 Nile Testnet
3. 重新加载页面

### Q3: 移动端无法打开钱包？

**检查**：
1. 确认已安装 TronLink 或 imToken App
2. 检查 App 是否是最新版本
3. 尝试手动打开钱包，然后使用"复制地址"方式

### Q4: 交易失败提示余额不足？

**检查**：
1. 钱包中是否有足够的 USDT
2. 钱包中是否有足够的 TRX（用于手续费）
3. 是否在 Nile 测试网？主网和测试网资产不互通

### Q5: 支付成功但会员未激活？

**原因**：当前仅支持手动验证
**解决**：
1. 管理员登录管理后台
2. 手动添加收款记录
3. 输入交易哈希
4. 系统自动激活会员

---

## 🚀 未来优化

### 自动检测支付

- [ ] 监听区块链交易
- [ ] 自动验证收款
- [ ] 自动激活会员
- [ ] 发送支付通知

### 更多钱包支持

- [ ] TokenPocket
- [ ] Trust Wallet
- [ ] MetaMask (通过桥接)

### 支付体验优化

- [ ] 显示实时汇率
- [ ] 支持多种代币
- [ ] 支付进度追踪
- [ ] 支付失败重试

---

## 📊 支付流程图

```
用户点击支付
    ↓
检测钱包类型
    ↓
┌─────────────┬─────────────┐
│ TronLink    │ 其他/未安装  │
│ 已安装      │             │
└──────┬──────┴──────┬──────┘
       ↓              ↓
  调用 TronLink   显示安装提示
  API 支付       或复制地址
       ↓              ↓
  钱包确认       手动转账
       ↓              ↓
  交易发送       用户操作
       ↓              ↓
  返回交易ID     完成支付
       ↓              ↓
  显示成功       等待验证
       └──────┬───────┘
              ↓
        管理员验证
              ↓
        激活会员
```

---

## 🎉 优势

### ✅ 用户体验
- 一键支付，无需复制粘贴
- 自动填充金额，减少错误
- 支持主流钱包

### ✅ 安全性
- 不需要用户输入私钥
- 钱包自身验证交易
- 区块链交易可追溯

### ✅ 兼容性
- 桌面端：浏览器扩展
- 移动端：Deep Link
- 备用方案：手动复制

---

## 📞 技术支持

遇到问题？
1. 查看浏览器控制台日志
2. 检查 TronLink 连接状态
3. 确认网络配置正确

---

**最后更新**：2024年12月
**版本**：v2.0 - 钱包集成版
