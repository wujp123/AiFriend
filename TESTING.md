# AiFriend 测试和调试指南

## 🌐 在线访问地址

- **主应用**: https://wujp123.github.io/AiFriend/
- **角色测试页**: https://wujp123.github.io/AiFriend/test-roles.html
- **调试工具**: https://wujp123.github.io/AiFriend/debug.html

## 🔍 如果角色列表没有显示

### 方法 1: 清除浏览器缓存
1. 按 `Ctrl+Shift+Delete` (Windows) 或 `Cmd+Shift+Delete` (Mac)
2. 选择"缓存的图片和文件"
3. 清除缓存后刷新页面

### 方法 2: 强制刷新
- Windows: `Ctrl + F5` 或 `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`
- 手机: 长按刷新按钮，选择"硬性重新加载"

### 方法 3: 使用调试工具
1. 访问 https://wujp123.github.io/AiFriend/debug.html
2. 点击"清空 LocalStorage"按钮
3. 返回主页

### 方法 4: 使用隐身模式
在浏览器隐身/无痕模式下打开链接，可以避免缓存问题

## 🐛 查看控制台日志

1. 打开浏览器开发者工具:
   - Windows: `F12` 或 `Ctrl + Shift + I`
   - Mac: `Cmd + Option + I`
   - 手机: 使用 Remote Debugging

2. 切换到 "Console" 标签页

3. 查找以下日志:
   ```
   🚀 Initializing AiFriend...
   📱 Showing role square for first-time user
   📋 Rendering role square...
   ✅ Role square rendered
   ```

## ✅ 测试检查清单

### 1. 首次访问测试
- [ ] 打开主页显示角色广场
- [ ] 显示17个角色（11女 + 3男 + 4奇幻）
- [ ] 角色头像正常加载
- [ ] 免费角色可点击
- [ ] 会员角色显示🔒图标

### 2. 返回用户测试
- [ ] 刷新页面显示聊天历史列表
- [ ] 可以看到之前的对话记录
- [ ] 点击右上角➕可以开始新对话
- [ ] 点击头像可以切换角色

### 3. 语言测试
- [ ] 进入设置页面
- [ ] 语言选择器有10种语言
- [ ] 切换语言后界面更新
- [ ] 角色名称和描述正确翻译

### 4. 多设备测试
- [ ] 电脑浏览器
- [ ] 手机浏览器
- [ ] Telegram内置浏览器
- [ ] 不同操作系统 (Windows/Mac/Android/iOS)

## 📱 Telegram Web App 测试

1. 在Telegram中创建机器人
2. 设置Web App URL为: `https://wujp123.github.io/AiFriend/`
3. 点击机器人的Web App按钮
4. 检查功能是否正常

## 🔧 本地开发测试

```bash
cd /Users/wujianpeng/Documents/webapp/AiFriend

# 使用Python启动本地服务器
python3 -m http.server 8000

# 或使用Node.js
npx http-server -p 8000
```

然后访问: http://localhost:8000

## 💡 常见问题

### Q: 页面空白，没有内容
A: 
1. 检查浏览器控制台是否有错误
2. 确认是否在HTTPS环境下（GitHub Pages默认HTTPS）
3. 清除缓存后重试

### Q: 图片加载失败
A:
1. 检查网络连接
2. Unsplash图片可能需要VPN
3. 图片加载失败会自动显示emoji备用

### Q: 语言检测不准确
A:
1. 手动在设置中选择语言
2. 用户选择的语言会被保存，下次自动使用

### Q: LocalStorage数据丢失
A:
1. 检查浏览器是否允许cookie
2. 隐身模式下数据不会持久保存
3. 不同域名下数据独立

## 📊 性能检查

使用 Lighthouse 检查:
1. 打开开发者工具
2. 切换到 "Lighthouse" 标签
3. 选择 "Performance" 和 "Accessibility"
4. 点击 "Generate report"

目标指标:
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 80

## 🚀 部署检查

GitHub Pages 部署需要等待1-2分钟才能看到更新。

检查部署状态:
1. 访问 https://github.com/wujp123/AiFriend/actions
2. 查看最新的 workflow run
3. 确认 "pages build and deployment" 成功

## 📞 反馈问题

如果遇到问题，请记录:
1. 浏览器版本
2. 操作系统
3. 访问URL
4. 控制台错误信息
5. 屏幕截图

---

**最后更新**: 2026年6月3日
