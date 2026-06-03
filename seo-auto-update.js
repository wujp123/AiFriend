#!/usr/bin/env node

/**
 * SEO 自动更新工具
 * 功能：
 * 1. 自动更新 sitemap.xml 的 lastmod 日期
 * 2. 扫描所有 HTML 文件并生成 sitemap
 * 3. 检查并优化 meta 标签
 * 4. 生成结构化数据
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置
const CONFIG = {
  baseUrl: 'https://wujp123.github.io/AiFriend/',
  outputDir: './',
  publicDir: './public/',
  excludeFiles: ['admin.html', 'test.html', 'debug.html', 'test-', 'debug-', 'view-users.html', 'reset.html'],
  defaultChangefreq: {
    'landing.html': 'daily',
    'index.html': 'daily',
    'blog.html': 'weekly',
    'faq.html': 'monthly',
    'use-cases.html': 'monthly',
    'tools.html': 'monthly',
    'admin-simple.html': 'monthly'
  },
  defaultPriority: {
    '/': 1.0,
    'landing.html': 1.0,
    'index.html': 0.9,
    'blog.html': 0.9,
    'faq.html': 0.9,
    'use-cases.html': 0.9,
    'tools.html': 0.5,
    'admin-simple.html': 0.3
  }
};

// 获取当前日期 (YYYY-MM-DD)
function getCurrentDate() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

// 获取文件修改时间
function getFileModifiedDate(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.mtime.toISOString().split('T')[0];
  } catch (error) {
    return getCurrentDate();
  }
}

// 扫描目录获取所有 HTML 文件
function scanHtmlFiles(dir) {
  const files = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isFile() && item.endsWith('.html')) {
        // 排除不需要的文件
        const shouldExclude = CONFIG.excludeFiles.some(exclude => 
          item.includes(exclude)
        );
        
        if (!shouldExclude) {
          files.push({
            name: item,
            path: fullPath,
            modifiedDate: getFileModifiedDate(fullPath)
          });
        }
      }
    }
  } catch (error) {
    console.error(`扫描目录失败: ${error.message}`);
  }
  
  return files;
}

// 生成 sitemap.xml
function generateSitemap(files) {
  const currentDate = getCurrentDate();
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">`;

  // 添加首页
  xml += `
  <url>
    <loc>${CONFIG.baseUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

  // 排序：优先级高的在前
  files.sort((a, b) => {
    const priorityA = CONFIG.defaultPriority[a.name] || 0.5;
    const priorityB = CONFIG.defaultPriority[b.name] || 0.5;
    return priorityB - priorityA;
  });

  // 添加其他页面
  for (const file of files) {
    const changefreq = CONFIG.defaultChangefreq[file.name] || 'monthly';
    const priority = CONFIG.defaultPriority[file.name] || 0.5;
    
    xml += `
  <url>
    <loc>${CONFIG.baseUrl}${file.name}</loc>
    <lastmod>${file.modifiedDate}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }

  xml += `
</urlset>`;

  return xml;
}

// 保存 sitemap
function saveSitemap(content) {
  try {
    // 保存到根目录
    fs.writeFileSync(path.join(CONFIG.outputDir, 'sitemap.xml'), content, 'utf8');
    console.log('✅ Sitemap 已保存到根目录');
    
    // 保存到 public 目录
    if (fs.existsSync(CONFIG.publicDir)) {
      fs.writeFileSync(path.join(CONFIG.publicDir, 'sitemap.xml'), content, 'utf8');
      console.log('✅ Sitemap 已保存到 public 目录');
    }
  } catch (error) {
    console.error(`❌ 保存 sitemap 失败: ${error.message}`);
  }
}

// 检查并优化 HTML 文件的 SEO
function checkHtmlSEO(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    const issues = [];
    
    // 检查是否有 title
    if (!content.includes('<title>')) {
      issues.push('缺少 <title> 标签');
    }
    
    // 检查是否有 description
    if (!content.includes('name="description"')) {
      issues.push('缺少 meta description');
    }
    
    // 检查是否有 canonical
    if (!content.includes('rel="canonical"')) {
      issues.push('缺少 canonical 链接');
    }
    
    // 检查是否有 robots
    if (!content.includes('name="robots"')) {
      issues.push('缺少 robots meta 标签');
    }
    
    // 检查是否有 Open Graph
    if (!content.includes('property="og:')) {
      issues.push('缺少 Open Graph 标签');
    }
    
    // 检查是否有结构化数据
    if (!content.includes('application/ld+json')) {
      issues.push('缺少结构化数据 (Schema.org)');
    }
    
    return { fileName, issues };
  } catch (error) {
    return { fileName: path.basename(filePath), issues: [`读取失败: ${error.message}`] };
  }
}

// 生成 SEO 报告
function generateSEOReport(files) {
  console.log('\n📊 SEO 检查报告:\n');
  
  let totalIssues = 0;
  
  for (const file of files) {
    const result = checkHtmlSEO(file.path);
    
    if (result.issues.length > 0) {
      console.log(`⚠️  ${result.fileName}:`);
      result.issues.forEach(issue => {
        console.log(`   - ${issue}`);
        totalIssues++;
      });
      console.log('');
    } else {
      console.log(`✅ ${result.fileName}: 所有检查通过`);
    }
  }
  
  if (totalIssues === 0) {
    console.log('\n🎉 所有页面 SEO 优化良好！');
  } else {
    console.log(`\n⚠️  共发现 ${totalIssues} 个 SEO 问题需要优化`);
  }
}

// 更新 robots.txt
function updateRobotsTxt() {
  const robotsContent = `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${CONFIG.baseUrl}sitemap.xml

# Crawl-delay
Crawl-delay: 1

# Disallow admin pages
Disallow: /admin.html
Disallow: /admin-simple.html
Disallow: /test*.html
Disallow: /debug*.html
`;

  try {
    fs.writeFileSync(path.join(CONFIG.outputDir, 'robots.txt'), robotsContent, 'utf8');
    console.log('✅ robots.txt 已更新');
    
    if (fs.existsSync(CONFIG.publicDir)) {
      fs.writeFileSync(path.join(CONFIG.publicDir, 'robots.txt'), robotsContent, 'utf8');
      console.log('✅ public/robots.txt 已更新');
    }
  } catch (error) {
    console.error(`❌ 更新 robots.txt 失败: ${error.message}`);
  }
}

// 主函数
function main() {
  console.log('🚀 开始 SEO 自动优化...\n');
  
  // 扫描 HTML 文件
  const files = scanHtmlFiles(CONFIG.outputDir);
  console.log(`📄 找到 ${files.length} 个 HTML 文件\n`);
  
  // 生成 sitemap
  const sitemapContent = generateSitemap(files);
  saveSitemap(sitemapContent);
  
  // 更新 robots.txt
  updateRobotsTxt();
  
  // 生成 SEO 报告
  generateSEOReport(files);
  
  console.log('\n✨ SEO 优化完成！');
  console.log(`📅 更新日期: ${getCurrentDate()}`);
}

// 运行
main();

export { generateSitemap, scanHtmlFiles, checkHtmlSEO };
