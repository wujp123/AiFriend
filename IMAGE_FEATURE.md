# 📸 图片功能说明

## ✨ 功能介绍

AiFriend 支持 AI 生成角色自拍图片，让对话更生动有趣！

### 触发方式
当你的消息包含以下关键词时，AI 会自动发送自拍：

**中文关键词：**
- 自拍、照片、图片、样子、看看你、发张、来张
- 早安、晚安、起床、睡觉
- 在干嘛、在做什么、穿的、衣服

**英文关键词：**
- selfie, photo, picture, look, show, send
- morning, night, today, now, wearing

**日文关键词：**
- 自撮り、写真、見せて、今、朝、夜

### 场景识别
AI 会根据你的消息内容生成相应场景的图片：

| 消息内容 | 生成场景 |
|---------|---------|
| 早安 | 刚起床的样子 |
| 晚安 | 准备睡觉的样子 |
| 运动/健身 | 运动装扮 |
| 工作/上班 | 职业装扮 |
| 吃饭/咖啡 | 餐厅/咖啡厅场景 |
| 开心/难过/累 | 对应的情绪表情 |

## 💎 配额限制

### 免费用户
- ✅ 每天 50 条对话
- ✅ 每天 1 张 AI 图片
- 每日 0:00 重置

### 会员用户
- ✅ 无限对话
- ✅ 无限 AI 图片
- ✅ 更长对话记忆
- ✅ 解锁全部角色

## 🎨 图片生成技术

### 方案 1：Pollinations.ai（当前使用）
- ✅ **完全免费**
- ✅ 无需 API Key
- ✅ 无使用限制
- ✅ 高质量图片
- ⚡ 实时生成

**工作原理：**
```javascript
// 直接通过 URL 生成图片
const imageUrl = `https://image.pollinations.ai/prompt/${prompt}?width=512&height=768`;
```

### 方案 2：其他 AI 图片服务（备选）

#### Replicate
```javascript
// 需要 API Key
apiUrl: 'https://api.replicate.com/v1/predictions'
model: 'stability-ai/sdxl'
```

#### Stable Diffusion API
```javascript
apiUrl: 'https://stablediffusionapi.com/api/v3/text2img'
```

## 💻 技术实现

### 1. 角色外貌定义
每个角色都有独特的外貌描述：

```javascript
{
  id: 'sister',
  name: '御姐',
  avatar: 'https://images.unsplash.com/photo-1494790108377...?w=400',
  appearance: 'elegant woman, mature, professional, business attire'
}
```

### 2. 智能场景识别
```javascript
// 检测消息是否需要图片
imageService.shouldGenerateImage(message);

// 提取场景
imageService.getScenarioFromMessage(message);
// 例如："早安" → "just woke up, morning selfie, casual pajamas"
```

### 3. 图片生成
```javascript
const image = await imageService.generateSelfie(roleId, scenario);
// 返回：{ url, prompt, service }
```

### 4. 配额管理
```javascript
// 检查权限
const permission = imageService.canGenerateImage(userId);

// 使用配额
imageService.useImageQuota(userId);

// 获取剩余次数
const remaining = imageService.getRemainingImageQuota(userId);
```

## 🎯 使用示例

### 示例 1：早安场景
```
用户：早安呀～刚起床吗？
AI：早安！是的，刚醒来呢～头发还有点乱（害羞）
[显示图片：刚起床的自拍]
```

### 示例 2：日常自拍
```
用户：发张自拍看看
AI：好呀～这是今天拍的，还不错吧？
[显示图片：日常自拍]
```

### 示例 3：运动场景
```
用户：你在干嘛呢？
AI：刚运动完，出了好多汗！
[显示图片：运动装扮]
```

## ⚙️ 自定义配置

### 修改默认图片尺寸
编辑 `public/image.js`：

```javascript
generatePollinationsUrl(prompt) {
  const width = 512;   // 修改宽度
  const height = 768;  // 修改高度
  ...
}
```

### 添加新的场景关键词
编辑 `public/image.js`：

```javascript
getScenarioFromMessage(message) {
  const scenarios = {
    '你的关键词': '场景描述 (英文)',
    '逛街': 'shopping, casual outfit, city street',
    '海边': 'beach selfie, summer, swimsuit',
    ...
  };
}
```

### 更换图片生成服务
编辑 `public/image.js`：

```javascript
async generateSelfie(roleId, scenario) {
  // 方案 1: Pollinations (当前)
  return this.generatePollinationsUrl(prompt);
  
  // 方案 2: Replicate
  // return await this.generateWithReplicate(prompt);
  
  // 方案 3: 其他服务
  // return await this.generateWithCustomAPI(prompt);
}
```

## 🔒 隐私说明

- ✅ 图片实时生成，不存储
- ✅ 通过 URL 直接访问
- ✅ 无需上传任何数据
- ✅ 完全客户端处理

## 📊 性能优化

### 图片加载优化
- 使用较小尺寸（512x768）平衡质量和速度
- 添加加载动画提升体验
- 图片懒加载
- CDN 加速

### 配额管理
- 本地存储配额信息
- 每日自动重置
- 会员永久无限

## 🐛 常见问题

**Q: 图片加载很慢？**
A: Pollinations.ai 首次生成需要几秒，这是正常的。后续相同提示词会更快。

**Q: 图片质量不满意？**
A: 可以调整 `appearance` 描述或 `scenario` 场景词来优化效果。

**Q: 想要更高质量的图片？**
A: 可以换用 Stable Diffusion API 或 Replicate，但需要 API Key。

**Q: 免费用户能生成多少图片？**
A: 每天 1 张免费图片。升级会员可无限生成。

**Q: 会员如何购买？**
A: 通过 Telegram Stars 购买：
- 月度：100 Stars
- 年度：1000 Stars  
- 终身：3000 Stars

## 🎉 总结

**优势：**
- ✅ 完全免费（使用 Pollinations.ai）
- ✅ 无需额外配置
- ✅ 实时生成
- ✅ 场景智能识别
- ✅ 支持多语言触发

**下一步优化：**
- [ ] 支持用户自定义外貌
- [ ] 更多场景支持
- [ ] 图片风格选择
- [ ] 多图发送
- [ ] 图片历史记录

---

体验角色自拍功能，让对话更生动！🎊
