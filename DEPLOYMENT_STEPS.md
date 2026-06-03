# 🚀 AiFriend 部署步骤（GitHub Pages）

## ✅ 第一步：本地准备（已完成）

- ✅ 项目已创建
- ✅ 代码已提交到本地 Git
- ✅ 所有文件已准备就绪

---

## 📦 第二步：创建 GitHub 仓库

### 方式 1：通过网页创建

1. 打开浏览器，访问 https://github.com/new

2. 填写仓库信息：
   ```
   Repository name: AiFriend
   Description: AI Role-play Assistant with Image Generation
   Public（选择公开）
   不要勾选 "Initialize with README"
   ```

3. 点击 "Create repository"

### 方式 2：通过命令行创建（需要 gh CLI）

```bash
# 如果已安装 GitHub CLI
gh repo create AiFriend --public --source=. --remote=origin --push
```

---

## 🔗 第三步：连接远程仓库

在你的 GitHub 创建仓库后，会看到类似这样的地址：
```
https://github.com/你的用户名/AiFriend.git
```

### 执行命令：

```bash
cd /Users/wujianpeng/Documents/webapp/AiFriend

# 添加远程仓库
git remote add origin https://github.com/你的用户名/AiFriend.git

# 推送代码
git branch -M main
git push -u origin main
```

**或者使用 SSH（如果已配置）：**
```bash
git remote add origin git@github.com:你的用户名/AiFriend.git
git push -u origin main
```

---

## ⚙️ 第四步：配置 GitHub Pages

1. **进入仓库设置**
   - 在 GitHub 仓库页面，点击 "Settings"

2. **找到 Pages 设置**
   - 左侧菜单找到 "Pages"

3. **配置部署源**
   ```
   Source: Deploy from a branch
   Branch: main
   Folder: /public
   ```

4. **点击 Save**

5. **等待部署**
   - 通常需要 1-3 分钟
   - 页面会显示你的网站地址：
     `https://你的用户名.github.io/AiFriend/`

---

## 🤖 第五步：创建 Telegram Bot

1. **在 Telegram 搜索** `@BotFather`

2. **创建新 Bot**
   ```
   发送: /newbot
   输入 Bot 名称: AiFriend
   输入用户名: your_aifriend_bot（必须以bot结尾）
   ```

3. **保存 Bot Token**
   - BotFather 会给你一个 Token
   - 格式类似：`123456789:ABCdefGHIjklMNOpqrsTUVwxyz`
   - **妥善保管这个 Token！**

---

## 🌐 第六步：配置 Web App

1. **回到 BotFather**
   ```
   发送: /newapp
   或者: /myapps（如果已有app）
   ```

2. **选择你的 Bot**
   - 点击你刚创建的 Bot

3. **设置 Web App**
   ```
   Title: AiFriend
   Description: AI智能助手，支持多角色对话和图片生成
   Photo: 上传一个图标（可选，可以跳过）
   GIF: 跳过
   ```

4. **输入 Web App URL**
   ```
   粘贴你的 GitHub Pages URL:
   https://你的用户名.github.io/AiFriend/
   ```

5. **确认创建**

---

## 🔧 第七步：配置 AI API（重要！）

### 方案 1：让用户自己配置（推荐）

用户首次使用时：
1. 打开 AiFriend
2. 点击设置 ⚙️
3. 输入自己的 OpenAI/DeepSeek API Key
4. 保存

**优点：** 无需服务器成本，用户自己承担 API 费用

### 方案 2：设置默认 API Key

编辑 `public/config.js`：

```javascript
export const config = {
  ai: {
    apiKey: 'sk-你的默认APIKey',
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-3.5-turbo'
  }
};
```

然后重新提交并推送：
```bash
git add public/config.js
git commit -m "Update default API key"
git push
```

**注意：** 不要在公开仓库中硬编码真实的 API Key！

---

## ✅ 第八步：测试

1. **在 Telegram 搜索你的 Bot**
   - 搜索：`@your_aifriend_bot`

2. **发送 /start**

3. **点击 "打开 AiFriend"**

4. **测试功能：**
   - 选择角色
   - 发送消息
   - 测试图片生成（发送"早安"或"自拍"）
   - 切换语言
   - 查看会员信息

---

## 🎉 完成！

你的 AiFriend 现在已经在线了！

**访问地址：**
- Web App: `https://你的用户名.github.io/AiFriend/`
- Telegram: `@your_aifriend_bot`

---

## 🔄 后续更新

当你修改代码后：

```bash
cd /Users/wujianpeng/Documents/webapp/AiFriend

# 查看修改
git status

# 添加修改
git add .

# 提交
git commit -m "Update: 描述你的修改"

# 推送
git push

# GitHub Pages 会自动重新部署（1-3分钟）
```

---

## 🐛 常见问题

### Q: GitHub Pages 404 错误？
A: 检查：
- Branch 是否选择了 `main`
- Folder 是否选择了 `/public`
- 等待 1-3 分钟让部署完成

### Q: Bot 打不开 Web App？
A: 检查：
- URL 是否正确（必须是 HTTPS）
- GitHub Pages 是否部署成功
- URL 末尾不要有多余的斜杠

### Q: AI 不回复？
A: 检查：
- API Key 是否配置
- 浏览器控制台是否有错误
- 网络连接是否正常

### Q: 图片不显示？
A: 
- Pollinations.ai 首次生成需要几秒
- 检查网络连接
- 刷新页面重试

---

## 📞 需要帮助？

- 查看文档：`README.md`
- 图片功能：`IMAGE_FEATURE.md`
- 使用演示：`DEMO_SCENARIOS.md`

---

## 🎯 下一步优化

1. **自定义域名**（可选）
   - 在 GitHub Pages 设置中添加自定义域名
   - 配置 DNS CNAME 记录

2. **添加 Google Analytics**（可选）
   - 在 `index.html` 中添加跟踪代码

3. **实现支付回调**
   - 集成 Telegram Stars 支付
   - 实现会员自动开通

4. **持续优化**
   - 添加更多角色
   - 优化 UI
   - 添加新功能

---

祝你部署成功！🚀🎉
