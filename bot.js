// 这个文件仅用于本地测试 Bot 功能
// 生产环境不需要运行此文件，直接部署静态页面即可

import TelegramBot from 'node-telegram-bot-api';
import fs from 'fs';

// 从 .env 读取 Bot Token
function getBotToken() {
  if (!fs.existsSync('.env')) {
    console.log('❌ .env 文件不存在');
    console.log('\n📝 请创建 .env 文件，添加：');
    console.log('BOT_TOKEN=你的Bot Token');
    process.exit(1);
  }

  const envContent = fs.readFileSync('.env', 'utf-8');
  const match = envContent.match(/BOT_TOKEN=(.+)/);
  
  if (!match) {
    console.log('❌ .env 中未找到 BOT_TOKEN');
    process.exit(1);
  }

  return match[1].trim();
}

const token = getBotToken();
const bot = new TelegramBot(token, { polling: true });

// 你的 Web App URL（部署后的地址）
const WEB_APP_URL = process.env.WEB_APP_URL || 'https://your-github-pages-url.github.io/AiFriend';

// Bot 信息
bot.getMe().then(me => {
  console.log('\n✅ Bot 信息:');
  console.log(`   名称: ${me.first_name}`);
  console.log(`   用户名: @${me.username}`);
  console.log(`   ID: ${me.id}`);
  console.log(`\n💡 Web App URL: ${WEB_APP_URL}`);
  console.log(`\n💡 在 Telegram 搜索 @${me.username} 开始对话\n`);
});

// 监听 /start 命令
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userName = msg.from.first_name;
  const language = msg.from.language_code || 'zh';
  
  const keyboard = {
    inline_keyboard: [
      [
        {
          text: '🚀 打开 AiFriend',
          web_app: { url: WEB_APP_URL }
        }
      ]
    ]
  };

  bot.sendMessage(
    chatId,
    `👋 ${userName}!\n\n欢迎使用 AiFriend - 你的 AI 智能伙伴\n\n✨ 特色功能：\n• 🎭 10+ 角色可选\n• 🌍 多语言支持\n• 💫 每天 50 条免费对话\n• 🔒 长期记忆\n\n点击下面按钮开始吧！`,
    { reply_markup: keyboard }
  );
});

console.log('\n🤖 AiFriend Bot 测试服务已启动！');
console.log('✅ 仅用于本地测试 Bot 命令');
console.log('💡 生产环境请直接部署静态页面到 GitHub Pages/Vercel/Cloudflare Pages');
console.log('💡 按 Ctrl+C 退出\n');
