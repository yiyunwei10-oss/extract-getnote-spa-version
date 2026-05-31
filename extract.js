const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function run() {
  const url = process.argv[2];
  const outputDir = process.argv[3];
  const maxArticles = parseInt(process.argv[5]) || 0; 

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`\n🚀 启动浏览器，采用【深度提取模式】(智能捕获跳转 + 全文遍历)...`);
  const browser = await chromium.launch({ headless: false }); 
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    console.log(`\n======================================================`);
    console.log(`⚠️ 注意：如果网页要求登录，请直接在浏览器中扫码或输入账号。`);
    console.log(`脚本会在此乖乖等待，你有 3 分钟 的时间完成登录操作...`);
    console.log(`======================================================\n`);

    // 等待左侧列表出现
    await page.waitForSelector('.min-w-0.flex-1.text-left', { timeout: 180000 });
    
    // 获取文章总数
    let total = await page.locator('.min-w-0.flex-1.text-left').count();
    if (maxArticles > 0 && maxArticles < total) {
        total = maxArticles;
    }
    
    console.log(`\n✅ 登录成功！找到 ${total} 篇文章，准备进行深度提取。`);

    let successCount = 0;

    for (let i = 0; i < total; i++) {
      try {
        console.log(`\n▶️ 开始处理第 ${i + 1}/${total} 篇...`);
        
        // 1. 等待左侧列表，滚动到可见位置并点击
        await page.waitForSelector('.min-w-0.flex-1.text-left', { timeout: 15000 });
        const listItems = page.locator('.min-w-0.flex-1.text-left');
        await listItems.nth(i).scrollIntoViewIfNeeded();
        await listItems.nth(i).click();

        // 2. 等待右侧带有 🔗 链接图标的跳转按钮出现
        const jumpBtnSelector = 'div.cursor-pointer:has(svg.lucide-link)';
        await page.waitForSelector(jumpBtnSelector, { state: 'visible', timeout: 10000 });
        
        await page.waitForTimeout(1000); 
        
        // 3. 同时准备捕获可能弹出的“新标签页”
        const newPagePromise = context.waitForEvent('page', { timeout: 5000 }).catch(() => null);
        
        // 强制点击跳转
        await page.locator(jumpBtnSelector).first().click({ force: true });

        const newPage = await newPagePromise;
        const targetPage = newPage || page; 

        if (newPage) {
            console.log(`  -> 侦测到打开了新标签页，正在抓取...`);
        } else {
            console.log(`  -> 在当前页面发生跳转，正在抓取...`);
        }

        // 4. 等待大标题渲染出来
        await targetPage.waitForSelector('.web-title', { timeout: 15000 });
        await targetPage.waitForTimeout(1000); // 留出时间让下方的正文彻底加载

        // 5. 提取大标题
        const title = await targetPage.locator('.web-title').innerText();
        
        // 6. 【核心修复】：循环提取大标题后面的所有正文块
        const content = await targetPage.evaluate(() => {
            const titleEl = document.querySelector('.web-title');
            if (!titleEl) return '';
            
            let textParts = [];
            let curr = titleEl.nextElementSibling; // 拿到标题下面的第一个块（可能是链接，可能是正文）
            
            // 只要下面还有内容，就一直往下找
            while (curr) {
                const paragraphs = Array.from(curr.querySelectorAll('p'));
                if (paragraphs.length > 0) {
                    // 如果这个块里有 <p> 标签，说明是真正的正文段落
                    paragraphs.forEach(p => {
                        const txt = p.innerText.trim();
                        if (txt) textParts.push(txt);
                    });
                } else {
                    // 如果没有 <p> 标签（比如是原链接），也把它的文字存下来
                    const txt = curr.innerText.trim();
                    if (txt) textParts.push(txt);
                }
                curr = curr.nextElementSibling; // 继续检查下一个块
            }
            
            return textParts.join('\n\n');
        });

        // 7. 生成合法的文件名并保存
        const safeTitle = title.replace(/[\\/:*?"<>|]/g, '_');
        const fileName = `${String(i + 1).padStart(3, '0')}_${safeTitle}.md`;
        const filePath = path.join(outputDir, fileName);

        fs.writeFileSync(filePath, `# ${title}\n\n${content}`, 'utf-8');
        console.log(`  ✅ 提取成功并保存: ${title}`);
        successCount++;

        // 8. 退回到列表状态
        if (newPage) {
            await newPage.close();
            await page.waitForTimeout(500);
        } else {
            await targetPage.goBack({ waitUntil: 'domcontentloaded' });
            await page.waitForTimeout(1500); 
        }

      } catch (err) {
        console.log(`  ❌ 提取失败，跳过该篇。错误: ${err.message}`);
        try {
            await page.goto(url, { waitUntil: 'domcontentloaded' });
            await page.waitForTimeout(3000);
        } catch (e) {}
      }
    }

    console.log(`\n=== 🎉 提取完成 ===`);
    console.log(`总计成功保存 ${successCount} 篇完整长文到目录: ${outputDir}`);

  } catch (err) {
    console.error(`\n运行过程中发生致命错误: ${err.message}`);
  } finally {
    await browser.close();
  }
}

run();