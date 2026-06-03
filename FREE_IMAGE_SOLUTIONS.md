# 🆓 免费 AI 图片生成方案对比

## 当前使用：Pollinations.ai ⭐

### 优势
- ✅ **完全免费**
- ✅ **无需 API Key**
- ✅ **无使用限制**
- ✅ **直接 URL 访问**
- ✅ **高质量输出**
- ✅ **支持中文提示词**

### 使用方法
```javascript
// 直接通过 URL 生成
const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=768&nologo=true`;

// 示例
https://image.pollinations.ai/prompt/beautiful%20woman%20selfie?width=512&height=768
```

### 参数说明
- `prompt`: 图片描述（URL 编码）
- `width`: 宽度（推荐 512-1024）
- `height`: 高度（推荐 512-1024）
- `seed`: 随机种子（可选）
- `nologo`: 去除水印（可选）

### 生成时间
- 首次：3-5秒
- 缓存后：<1秒

---

## 备选方案 1：Hugging Face Inference API

### 优势
- ✅ 免费额度充足
- ✅ 多种模型可选
- ✅ 高质量输出

### 限制
- ⚠️ 需要注册账号
- ⚠️ 需要 API Token
- ⚠️ 有请求频率限制

### 使用方法
```javascript
const response = await fetch(
  'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${HF_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ inputs: prompt })
  }
);

const blob = await response.blob();
const imageUrl = URL.createObjectURL(blob);
```

### 免费额度
- 1000 次/月
- 足够个人项目使用

---

## 备选方案 2：Replicate（免费 tier）

### 优势
- ✅ 高质量模型
- ✅ SDXL 支持
- ✅ 快速生成

### 限制
- ⚠️ 需要信用卡验证
- ⚠️ 免费额度有限（$0.1 起）
- ⚠️ 需要 API Key

### 使用方法
```javascript
const response = await fetch('https://api.replicate.com/v1/predictions', {
  method: 'POST',
  headers: {
    'Authorization': `Token ${REPLICATE_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    version: 'stability-ai/sdxl',
    input: { prompt: prompt }
  })
});
```

---

## 备选方案 3：Together.ai

### 优势
- ✅ 多种开源模型
- ✅ 快速响应
- ✅ 免费额度

### 限制
- ⚠️ 需要注册
- ⚠️ 免费额度：$25（一次性）
- ⚠️ 需要 API Key

---

## 备选方案 4：Cloudflare AI

### 优势
- ✅ Cloudflare 基础设施
- ✅ 快速稳定
- ✅ 免费额度

### 限制
- ⚠️ 需要 Cloudflare 账号
- ⚠️ 配置较复杂
- ⚠️ 每月 10000 次请求

---

## 备选方案 5：使用预设图片库

### Unsplash API

**优势：**
- ✅ 完全免费
- ✅ 高质量照片
- ✅ 商用许可
- ✅ 无需复杂配置

**限制：**
- ⚠️ 不是 AI 生成
- ⚠️ 每小时 50 次请求

```javascript
// 搜索相关图片
const url = `https://api.unsplash.com/search/photos?query=${keyword}&client_id=${UNSPLASH_ACCESS_KEY}`;
```

### Pexels API

**类似 Unsplash，也是免费图片库**

---

## 方案对比表

| 方案 | 免费 | 质量 | 速度 | 限制 | 难度 |
|------|------|------|------|------|------|
| **Pollinations.ai** | ✅ 无限 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 无 | ⭐ |
| Hugging Face | ✅ 1000/月 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | 需注册 | ⭐⭐ |
| Replicate | ⚠️ 有限 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 需信用卡 | ⭐⭐⭐ |
| Together.ai | ✅ $25 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 一次性 | ⭐⭐ |
| Cloudflare AI | ✅ 10k/月 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 需配置 | ⭐⭐⭐ |
| Unsplash | ✅ 50/小时 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 非AI | ⭐ |

---

## 💡 推荐使用策略

### 策略 1：纯免费（当前）
```
Pollinations.ai（主）
↓ 如果失败
Unsplash API（备用真实图片）
```

### 策略 2：混合方案
```
免费用户：Pollinations.ai
会员用户：Replicate/SDXL（更高质量）
```

### 策略 3：完全预设
```
为每个角色准备多张预设图片
根据场景随机返回
成本：¥0，但缺乏个性化
```

---

## 实现建议

### 当前配置（推荐）
```javascript
// public/image.js
export class ImageService {
  async generateSelfie(roleId, scenario) {
    // 使用 Pollinations.ai（完全免费）
    return this.generatePollinationsUrl(prompt);
  }
}
```

### 升级方案（会员专享）
```javascript
async generateSelfie(roleId, scenario) {
  // 检查会员状态
  if (storage.isPremium(userId)) {
    // 会员使用高质量 API
    return await this.generateWithReplicate(prompt);
  } else {
    // 免费用户使用 Pollinations
    return this.generatePollinationsUrl(prompt);
  }
}
```

### 备用方案
```javascript
async generateSelfie(roleId, scenario) {
  try {
    // 尝试 Pollinations
    return this.generatePollinationsUrl(prompt);
  } catch (error) {
    // 失败则使用 Unsplash 预设图片
    return this.getUnsplashPhoto(roleId);
  }
}
```

---

## 成本分析

### 免费方案（Pollinations.ai）
- 生成：¥0
- 存储：¥0（直接 URL）
- 带宽：¥0（Pollinations 承担）
- **总成本：¥0/月**

### 付费方案对比

#### Replicate
- $0.000725/张（SDXL）
- 1000 张 = $0.73
- 适合会员服务

#### Together.ai
- $0.0002/张（Stable Diffusion）
- 1000 张 = $0.20
- 性价比高

#### OpenAI DALL-E
- $0.02/张（标准）
- 1000 张 = $20
- 贵但质量最好

---

## 🎯 最终建议

**对于 AiFriend 项目：**

1. **免费用户**：Pollinations.ai
   - 成本：¥0
   - 质量：足够好
   - 速度：可接受
   - 限制：无

2. **会员用户**：可升级到
   - Replicate SDXL（高质量）
   - Together.ai（性价比）
   - 或继续使用 Pollinations（省钱）

3. **备用方案**：Unsplash 预设图
   - 当 API 失败时
   - 真实人物照片
   - 更快的加载速度

**当前实现已经采用最佳方案（Pollinations.ai）！** ✅

---

## 📚 相关链接

- [Pollinations.ai](https://pollinations.ai/)
- [Hugging Face](https://huggingface.co/inference-api)
- [Replicate](https://replicate.com/)
- [Together.ai](https://together.ai/)
- [Unsplash API](https://unsplash.com/developers)
- [Pexels API](https://www.pexels.com/api/)

---

**结论：当前使用的 Pollinations.ai 是最佳免费方案！** 🎉
