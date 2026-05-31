Get笔记文案提取工具 (SPA 深度提取版)



一个基于 Playwright 的高效自动化工具，用于提取 Get笔记知识库中的所有文章，保存为 Markdown 文件。



> 🙏 致谢与声明

> 本项目的大部分基础架构衍生自 \\\\\\\[dontbesilent2025/extract-getnote-articles](https://github.com/dontbesilent2025/extract-getnote-articles)。

> 由于原目标网站改版为单页应用 (SPA) 架构，导致原版工具的并发提取失效。本项目 (`v3.0.0`) 对核心抓取逻辑进行了 100% 的重构，采用智能单线程跳转模式，完美适配最新版 Get笔记。特此向原作者致谢！



功能特点



🤖 智能单页跳转捕获：完美解决 SPA 架构下 URL 不变导致的抓取失效问题。

🎯 深度长文遍历：不再局限于 AI 摘要，自动点击原链接，智能遍历抓取完整正文内容。

⏱️ 拟人化安全提取：内置 3 分钟扫码登录等待时间，单线程平滑后退，极大降低被网站拦截的风险。

📝 格式化输出：保存为结构化的 Markdown 文件，自动处理文件名中的非法字符。

📁 智能命名：使用博主名称命名文件夹，自动处理重名冲突。



安装



手动安装到本地（推荐）：



```bash

git clone \\\\\\\[https://github.com/yiyunwei10-oss/extract-getnote-spa-version.git](https://github.com/yiyunwei10-oss/extract-getnote-spa-version.git)

cd extract-getnote-spa-version

npm install

npx playwright install

使用方法



第一步：获取知识库URL

打开博主的知识库页面，复制完整的浏览器地址：
https://www.biji.com/subject/QYARpjM0/DEFAULT?followId=785142\\\&followName=博主名称



⚠️ 重要：必须复制完整URL，包含 followName 参数，这样才能正确命名输出文件夹。



第二步：运行提取

直接在终端运行以下命令：node run.js "https://www.biji.com/subject/QYARpjM0/DEFAULT?followId=785142\\\&followName=博主名称"



第三步：授权登录

运行后浏览器会自动打开。



如果未登录，请在弹出的浏览器中扫码或输入账号（你有 3 分钟的操作时间）。



登录成功且列表加载后，脚本会自动开始点击并提取全文。



输出结构

提取的文章会保存在当前目录下，以博主名称命名的文件夹中：/extract-getnote-spa-version/

├── 博主A/              # 第一次提取

│   ├── 001\\\_文章标题.md

│   ├── 002\\\_文章标题.md

│   └── ...

├── 博主A\\\_2/            # 第二次提取（自动添加序号避免冲突）

│   ├── 001\\\_文章标题.md

│   └── ...
注意事项

✅ 首次运行需要在浏览器中登录。



✅ 提取的文章仅供个人学习使用，请尊重原作者版权。



⚠️ 由于采用深度模拟真人点击（进文章 -> 抓取 -> 退回列表），提取速度约为 5-10 篇/分钟。请保持耐心，切勿在脚本运行时干扰自动打开的浏览器窗口。



⚠️ 提取过程中请保持网络稳定。



更新日志

v3.0.0 (SPA 重构版)

✨ 彻底重构核心逻辑，适配 Get笔记最新单页应用 (SPA) 架构



✨ 新增二级页面跳转捕获，精准提取长文正文



✨ 新增登录状态等待机制 (3分钟安全期)



✨ 修复因获取不到 tbody tr 导致程序崩溃的问题



🐛 优化 DOM 元素加载的等待逻辑，减少超时错误
历史版本 (v1.x - v2.x)

原作者 dontbesilent2025 的基础架构与并发抓取实现
许可

MIT License


