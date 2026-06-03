# 🚨 快速修复：角色列表不显示

## 问题原因
可能是浏览器缓存了旧版本的代码

## ⚡ 快速解决方案（3选1）

### 方案1: 强制刷新（最快）
**电脑:**
- Windows: 按 `Ctrl + Shift + R` 或 `Ctrl + F5`
- Mac: 按 `Cmd + Shift + R`

**手机:**
- 长按刷新按钮 → 选择"强制刷新"或"清除缓存并刷新"

### 方案2: 清空LocalStorage（最彻底）
1. 访问: https://wujp123.github.io/AiFriend/debug.html
2. 点击 **"清空 LocalStorage"** 按钮
3. 回到主页: https://wujp123.github.io/AiFriend/

### 方案3: 隐身模式（最简单）
**电脑:**
- Chrome/Edge: `Ctrl + Shift + N` (Windows) 或 `Cmd + Shift + N` (Mac)
- Firefox: `Ctrl + Shift + P` (Windows) 或 `Cmd + Shift + P` (Mac)
- Safari: `Cmd + Shift + N`

**手机:**
- Chrome: 菜单 → 新建无痕式标签页
- Safari: 标签页切换器 → 私密浏览

## ✅ 测试页面

如果还是不行，访问测试页面验证角色数据:
- **角色测试**: https://wujp123.github.io/AiFriend/test-roles.html
- **调试工具**: https://wujp123.github.io/AiFriend/debug.html

## 📝 预期效果

首次访问应该看到:
- ✨ 欢迎页面或角色广场
- 👥 17个角色，分3个类别
  - 女性角色: 11个
  - 男性角色: 3个
  - 奇幻角色: 4个
- 🖼️ 每个角色都有头像图片
- 🆓 免费角色（御姐、萝莉、温柔女友、温柔男友）

老用户应该看到:
- 📜 聊天历史列表
- 💬 之前的所有对话记录
- ➕ 右上角的"新对话"按钮

## 🔍 如果仍然有问题

打开浏览器开发者工具（F12），查看Console标签，应该看到:
```
🚀 Initializing AiFriend...
User ID: demo_user
📱 Showing role square for first-time user
📋 Rendering role square...
✅ Role square rendered
```

如果看到错误信息，请记录下来。

## 📱 在Telegram中测试

Telegram Web App可能需要:
1. 关闭并重新打开Web App
2. 重启Telegram应用
3. 检查网络连接

---

**提示**: GitHub Pages部署需要1-2分钟，如果刚推送代码，请等待部署完成。

查看部署状态: https://github.com/wujp123/AiFriend/actions
