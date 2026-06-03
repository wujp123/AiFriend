# 💳 Payment System Testing Guide
# iFriendly AI - 支付系统测试指南

## ✅ Current Implementation Status / 当前实现状态

### ✨ What's Implemented / 已实现功能

1. **4 Membership Tiers / 4个会员套餐**
   - Weekly (周会员): $1.99 - 7 days
   - Monthly (月会员): $4.99 - 30 days ⭐ Popular
   - Quarterly (季度会员): $12.99 - 90 days (13% off)
   - Yearly (年会员): $39.99 - 365 days (33% off)

2. **3 Payment Methods / 3种支付方式**
   - ⭐ Telegram Stars
   - 💎 TON Blockchain
   - 🔺 TRON (USDT-TRC20)

3. **Multi-language Support / 多语言支持**
   - Chinese (中文)
   - English
   - And 8 other languages

4. **UI Features / 界面功能**
   - Copy wallet address to clipboard
   - Payment dialogs with multi-language
   - Premium activation system

---

## 🔧 Configuration Needed / 需要配置

### 📍 Wallet Addresses to Configure / 钱包地址配置

You need to replace placeholder addresses in **TWO** files:

#### File 1: `/AiFriend/app.js`

**Line 685** - TON Wallet:
```javascript
const tonAddress = 'YOUR_TON_WALLET_ADDRESS';
```
Replace with your real TON wallet address, for example:
```javascript
const tonAddress = 'UQCx1y2z3a4b5c6d7e8f9g0h1i2j3k4l5m6n7o8p9q0r1s2t3';
```

**Line 743** - TRON Wallet:
```javascript
const tronAddress = 'YOUR_TRON_WALLET_ADDRESS';
```
Replace with your real TRON wallet address (TRC20), for example:
```javascript
const tronAddress = 'TXYz1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O';
```

#### File 2: `/AiFriend/public/app.js`

Same changes as above - find and replace:
- TON address around line 685
- TRON address around line 743

### 💡 Where to Get Wallet Addresses / 如何获取钱包地址

**For TON:**
- Install Tonkeeper, Tonhub, or MyTonWallet
- Create/import wallet
- Copy your TON address (starts with `UQ` or `EQ`)

**For TRON:**
- Install TronLink wallet
- Create/import wallet  
- Copy your TRC20 USDT receiving address (starts with `T`)
- **Important**: Must support TRC20 tokens!

---

## 🧪 How to Test Payments / 如何测试支付功能

### Method 1: Browser Testing (Recommended First) / 浏览器测试（推荐先测试）

1. **Open the app in browser:**
   ```
   https://wujp123.github.io/AiFriend/
   ```

2. **Navigate to Membership page:**
   - Click the quota button (shows your remaining tries)
   - Or click membership icon in header

3. **Try each payment method:**

   **A. Test TON Payment:**
   - Click "TON" button on any plan
   - Should show popup with your TON address
   - Try "Copy Address" button - address should copy to clipboard
   - Try "Open Wallet" button - should open TON wallet (if installed)

   **B. Test TRON Payment:**
   - Click "TRON (USDT-TRC20)" button
   - Should show popup with your TRON address
   - Try "Copy Address" button
   - Click "Payment Completed" when ready

   **C. Test Telegram Stars:**
   - Click "Telegram Stars" button
   - In browser, will show alert (normal - only works in Telegram)

4. **Check Console Logs:**
   - Open DevTools (F12)
   - Go to Console tab
   - Should see payment initiation logs like:
     ```
     💎 Initiating TON payment: monthly, 3 TON, 30 days
     🔺 Initiating TRON payment: yearly, 40 USDT, 365 days
     ```

### Method 2: Telegram Mini App Testing / Telegram小程序测试

1. **Open your Telegram bot:**
   ```
   t.me/iFriendly_Ai_Bot/ifriendly_app
   ```

2. **Test in real environment:**
   - All payment buttons should work
   - Telegram Stars payment will open native Telegram invoice
   - TON/TRON payments show address dialogs

3. **Test language switching:**
   - Change language in header dropdown
   - Navigate to membership page
   - Payment UI should update to selected language

---

## 🎯 Testing Checklist / 测试清单

### Basic Functionality / 基础功能
- [ ] Membership page loads correctly
- [ ] All 4 plans are displayed
- [ ] "Most Popular" badge shows on Monthly plan
- [ ] Discount badges show on Quarterly (13%) and Yearly (33%)
- [ ] All 3 payment buttons appear for each plan

### TON Payment / TON支付
- [ ] Clicking TON button shows popup
- [ ] Popup displays your TON wallet address
- [ ] "Copy Address" button copies address to clipboard
- [ ] "Open Wallet" button attempts to open TON wallet
- [ ] Memo/note includes plan ID and user ID
- [ ] Multi-language works (try changing to English)

### TRON Payment / TRON支付
- [ ] Clicking TRON button shows popup
- [ ] Popup displays your TRON wallet address
- [ ] Shows USDT amount correctly
- [ ] "Copy Address" button works
- [ ] "Payment Completed" button shows verification message
- [ ] Memo/note format is correct

### Telegram Stars / Telegram星星
- [ ] Button shows correct star amount
- [ ] In Telegram app, opens invoice (needs setup)
- [ ] In browser, shows "not supported" message

### Multi-language / 多语言
- [ ] Change language in header
- [ ] Plan names update (周会员 → Weekly)
- [ ] Payment dialogs update language
- [ ] Button text updates correctly

---

## 🐛 Common Issues & Solutions / 常见问题

### Issue 1: "Copy Address" doesn't work / 复制地址不工作
**Solution**: Some browsers block clipboard access. Try:
```javascript
// Already implemented in code with fallback
navigator.clipboard.writeText(text);
```

### Issue 2: Telegram Stars not working / Telegram星星不工作
**Reason**: Need to create invoice link via BotFather
**Steps**:
1. Open @BotFather
2. Use `/mybots` → Select your bot
3. Bot Settings → Payments
4. Add payment provider
5. Create invoice link
6. Replace in code (line ~655 in app.js):
```javascript
const invoiceLink = 'YOUR_TELEGRAM_STARS_INVOICE_LINK';
```

### Issue 3: Payment not activating premium / 支付后没有激活会员
**Reason**: This is normal! Currently no backend verification
**Current behavior**: Manual testing only
**To manually activate for testing**:
Open browser console and run:
```javascript
// Activate 30-day premium for testing
activatePremium(30);
```

---

## 🚀 Next Steps After Testing / 测试后的下一步

### Phase 1: Frontend Testing (Current) / 第一阶段：前端测试
- ✅ Payment UI works
- ✅ Address copy/paste works
- ✅ Multi-language works
- ✅ User can initiate payment

### Phase 2: Manual Verification (Optional) / 第二阶段：手工验证
- Monitor wallet for incoming payments
- Manually activate premium for users who paid
- Keep payment records in spreadsheet

### Phase 3: Backend Integration (Future) / 第三阶段：后端集成
When you're ready, you'll need:
1. Payment verification API
2. Webhook from blockchain
3. Automatic premium activation
4. Payment history storage

**Recommended**: Start with Vercel Serverless Functions (free tier)

---

## 💰 Price Summary / 价格总览

| Plan | Duration | Stars | TON | USDT | Save |
|------|----------|-------|-----|------|------|
| Weekly | 7 days | 50⭐ | 1💎 | 2🔺 | - |
| Monthly | 30 days | 100⭐ | 3💎 | 5🔺 | - |
| Quarterly | 90 days | 260⭐ | 8💎 | 13🔺 | 13% |
| Yearly | 365 days | 800⭐ | 24💎 | 40🔺 | 33% |

---

## 📝 Manual Testing Commands / 手动测试命令

Open browser console (F12) and try these:

```javascript
// 1. Check current user
console.log(currentUser);

// 2. Test TON payment (won't actually charge)
window.payWithTON('monthly', '3', 30);

// 3. Test TRON payment
window.payWithTRON('yearly', '40', 365);

// 4. Test Stars payment
window.payWithStars('weekly', 50, 7);

// 5. Manually activate premium (for testing)
activatePremium(30); // 30 days

// 6. Check if user is premium
console.log(storage.isPremium(currentUser.id));

// 7. Check user data
console.log(storage.getUser(currentUser.id));
```

---

## ✅ Quick Start Testing / 快速开始测试

1. **Update wallet addresses** in both files
2. **Push to GitHub**:
   ```bash
   cd /Users/wujianpeng/Documents/webapp/AiFriend
   git add .
   git commit -m "Configure payment wallet addresses"
   git push
   ```
3. **Wait 1-2 minutes** for GitHub Pages to deploy
4. **Open in browser**: https://wujp123.github.io/AiFriend/
5. **Go to Membership page**
6. **Click payment buttons** to test

---

## 📞 Support / 支持

If you encounter issues:
1. Check browser console (F12) for errors
2. Verify wallet addresses are correct format
3. Test in different browsers
4. Try both browser and Telegram app

---

## 🎉 What Works Now / 现在可以用的功能

✅ User can see membership plans
✅ User can select payment method
✅ User can copy wallet address
✅ User can see payment amount
✅ Multi-language payment UI
✅ Payment flow is complete
✅ Manual premium activation works

❌ Automatic payment verification (needs backend)
❌ Payment history tracking (needs backend)
❌ Automatic premium activation (needs backend)

---

**Ready to test? Update your wallet addresses and push to GitHub!** 🚀
