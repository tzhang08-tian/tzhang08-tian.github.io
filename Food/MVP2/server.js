// ═══════════════════════════════════════════════
//  NutriAI 本地代理服务器
//  用途：把浏览器的 Claude API 请求转发到 Anthropic
//
//  启动方法：
//    1. cd 到本文件所在目录
//    2. npm install
//    3. node server.js
//    4. 浏览器打开 http://localhost:3000/mvp.html
// ═══════════════════════════════════════════════

require('dotenv').config();

const express  = require('express');
const fetch    = require('node-fetch');
const path     = require('path');

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const app = express();
app.use(express.json({ limit: '25mb' }));   // 图片 base64 较大
app.use(express.static(path.dirname(require.resolve('./mvp.html')) || __dirname));

// 代理 Claude API
app.post('/api/claude', async (req, res) => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key':         ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type':      'application/json',
      },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.json(data);
  } catch (e) {
    console.error('Claude API error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log('\n✅ NutriAI 已启动');
  console.log(`   浏览器打开 → http://localhost:${PORT}/mvp.html\n`);
});
