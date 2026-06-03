#!/usr/bin/env node

/**
 * SEO 监控工具
 * 监控网站的 SEO 健康状况
 */

import https from 'https';
import http from 'http';

const CONFIG = {
  siteUrl: 'https://wujp123.github.io/AiFriend/',
  pages: [
    '',
    'landing.html',
    'index.html',
    'blog.html',
    'faq.html',
    'use-cases.html'
  ]
};

// 检查页面是否可访问
function checkPageAvailability(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, (res) => {
      resolve({
        url,
        status: res.statusCode,
        ok: res.statusCode === 200
      });
    }).on('error', (err) => {
      resolve({
        url,
        status: 0,
        ok: false,
        error: err.message
      });
    });
  });
}

// 检查 sitemap 是否可访问
async function checkSitemap() {
  console.log('🗺️  检查 Sitemap...');
  const result = await checkPageAvailability(`${CONFIG.siteUrl}sitemap.xml`);
  
  if (result.ok) {
    console.log('✅ Sitemap 可访问 (状态码: 200)');
  } else {
    console.log(`❌ Sitemap 不可访问 (状态码: ${result.status})`);
  }
  
  return result.ok;
}

// 检查 robots.txt
async function checkRobotsTxt() {
  console.log('🤖 检查 robots.txt...');
  const result = await checkPageAvailability(`${CONFIG.siteUrl}robots.txt`);
  
  if (result.ok) {
    console.log('✅ robots.txt 可访问 (状态码: 200)');
  } else {
    console.log(`❌ robots.txt 不可访问 (状态码: ${result.status})`);
  }
  
  return result.ok;
}

// 检查所有页面
async function checkAllPages() {
  console.log('\n📄 检查所有页面...\n');
  
  const results = [];
  
  for (const page of CONFIG.pages) {
    const url = `${CONFIG.siteUrl}${page}`;
    const result = await checkPageAvailability(url);
    results.push(result);
    
    if (result.ok) {
      console.log(`✅ ${page || '首页'} - OK`);
    } else {
      console.log(`❌ ${page || '首页'} - 失败 (${result.status})`);
    }
  }
  
  const successCount = results.filter(r => r.ok).length;
  const totalCount = results.length;
  
  console.log(`\n📊 页面可用性: ${successCount}/${totalCount} (${Math.round(successCount/totalCount*100)}%)`);
  
  return results;
}

// 生成 SEO 得分
function calculateSEOScore(sitemapOk, robotsOk, pagesResults) {
  let score = 0;
  
  // Sitemap (20分)
  if (sitemapOk) score += 20;
  
  // robots.txt (10分)
  if (robotsOk) score += 10;
  
  // 页面可用性 (70分)
  const availablePages = pagesResults.filter(r => r.ok).length;
  score += Math.round((availablePages / pagesResults.length) * 70);
  
  return score;
}

// 主函数
async function main() {
  console.log('🔍 开始 SEO 监控...\n');
  console.log(`🌐 网站: ${CONFIG.siteUrl}\n`);
  
  // 检查 sitemap
  const sitemapOk = await checkSitemap();
  
  // 检查 robots.txt
  const robotsOk = await checkRobotsTxt();
  
  // 检查所有页面
  const pagesResults = await checkAllPages();
  
  // 计算 SEO 得分
  const score = calculateSEOScore(sitemapOk, robotsOk, pagesResults);
  
  console.log('\n' + '='.repeat(50));
  console.log(`\n🎯 SEO 健康得分: ${score}/100\n`);
  
  if (score >= 90) {
    console.log('🎉 优秀！SEO 配置完美！');
  } else if (score >= 70) {
    console.log('👍 良好，但还有改进空间');
  } else if (score >= 50) {
    console.log('⚠️  需要改进');
  } else {
    console.log('❌ 需要立即修复 SEO 问题');
  }
  
  console.log('\n' + '='.repeat(50));
  
  // 建议
  console.log('\n💡 优化建议:\n');
  
  if (!sitemapOk) {
    console.log('   - 确保 sitemap.xml 已部署并可访问');
  }
  
  if (!robotsOk) {
    console.log('   - 确保 robots.txt 已部署并可访问');
  }
  
  const failedPages = pagesResults.filter(r => !r.ok);
  if (failedPages.length > 0) {
    console.log('   - 修复以下页面的访问问题:');
    failedPages.forEach(p => {
      console.log(`     * ${p.url}`);
    });
  }
  
  if (sitemapOk && robotsOk && failedPages.length === 0) {
    console.log('   - 继续在 Google Search Console 提交 sitemap');
    console.log('   - 定期更新内容保持新鲜度');
    console.log('   - 建立外部链接提升权重');
  }
  
  console.log('\n✨ 监控完成！');
}

// 运行
main().catch(console.error);

export { checkPageAvailability, checkSitemap, checkRobotsTxt };
