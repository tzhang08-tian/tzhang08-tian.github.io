// ═══════════════════════════════════════════════
//  CONFIG
// ═══════════════════════════════════════════════
const CLAUDE_MODEL = 'claude-haiku-4-5-20251001';   // 快速 & 低成本
const CLAUDE_URL   = '/api/claude';                  // 本地代理

const USDA_KEY = 'DEMO_KEY';   // 申请: https://fdc.nal.usda.gov/api-guide.html
const USDA_URL = 'https://api.nal.usda.gov/fdc/v1/foods/search';

// ═══════════════════════════════════════════════
//  CLAUDE API 封装
// ═══════════════════════════════════════════════
async function callClaude(messages, systemPrompt, maxTokens = 512) {
  const body = {
    model:      CLAUDE_MODEL,
    max_tokens: maxTokens,
    system:     systemPrompt,
    messages,
  };
  try {
    const r = await fetch(CLAUDE_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const d = await r.json();
    if (d.error) throw new Error(d.error.message || JSON.stringify(d.error));
    return d.content?.[0]?.text || '';
  } catch (e) {
    console.error('Claude error:', e);
    return null;   // caller checks for null → fallback
  }
}

// ── Claude Vision: identify food in photo ────────
async function recognizeFood(base64, mimeType) {
  const messages = [{
    role: 'user',
    content: [
      { type: 'image', source: { type: 'base64', media_type: mimeType, data: base64 } },
      { type: 'text', text: 'What food is in this image? Reply with only the food name, nothing else.' }
    ]
  }];
  const text = await callClaude(messages, 'You are a food recognition assistant. Reply with only the food name, short and precise.', 80);
  console.log('Claude Vision result:', text);
  if (!text) return null;

  const name = text.trim().replace(/[.\n!?]/g, '').slice(0, 40);
  const emoji = guessEmoji(name);
  return { zh: name, en: name, emoji };
}

function guessEmoji(name) {
  const map = [
    ['米饭|炒饭|饭', '🍚'], ['面|意大利面|拉面|面条', '🍜'], ['饺子|包子|馄饨', '🥟'],
    ['鸡|鸡肉|鸡腿|鸡胸', '🍗'], ['牛肉|牛排|红烧肉', '🥩'], ['猪肉|排骨', '🥩'],
    ['鱼|三文鱼|鲈鱼', '🐟'], ['虾', '🦐'], ['蛋|鸡蛋|荷包蛋', '🍳'],
    ['沙拉|蔬菜|青菜', '🥗'], ['汤|粥', '🥣'], ['面包|吐司', '🍞'],
    ['披萨|比萨', '🍕'], ['汉堡', '🍔'], ['薯条', '🍟'], ['寿司', '🍣'],
    ['苹果', '🍎'], ['香蕉', '🍌'], ['橙|橙子', '🍊'], ['草莓', '🍓'],
    ['咖啡', '☕'], ['牛奶|奶', '🥛'], ['豆腐', '🍱'], ['坚果|花生', '🥜'],
  ];
  for (const [pattern, emoji] of map) {
    if (new RegExp(pattern).test(name)) return emoji;
  }
  return '🍽️';
}

// ── 把文件读成 base64 ────────────────────────────
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve({ base64: reader.result.split(',')[1], mimeType: file.type || 'image/jpeg' });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ═══════════════════════════════════════════════
//  对话历史（保留最近 12 轮）
// ═══════════════════════════════════════════════
let chatHistory = [];

function buildSystemPrompt() {
  if (!S.profile) return 'You are a nutrition assistant.';
  const cfg = GOALS[S.profile.goal];
  const t   = totals(todayLogs());
  const rem = S.profile.kcal - t.cal;
  return `You are Nourish, a friendly nutrition assistant.
User goal: ${cfg.label}. Daily calorie target: ${S.profile.kcal} kcal, protein: ${S.profile.protein}g.
Today so far: ${t.cal} kcal eaten, ${t.protein}g protein, ${t.carbs}g carbs, ${t.fat}g fat. Remaining: ${rem} kcal.
Rules:
- Short, warm, conversational (users are students, seniors, or busy workers — not nutrition experts)
- Max 3 sentences unless the user asks for more
- No medical diagnoses; keep nutrition advice practical and encouraging
- If the user logs a food, just give a brief encouraging comment — the UI already shows the nutrition numbers
- Never say "As an AI"`;
}

async function claudeChat(userText) {
  chatHistory.push({ role: 'user', content: userText });
  if (chatHistory.length > 24) chatHistory = chatHistory.slice(-24);

  const reply = await callClaude(chatHistory, buildSystemPrompt());
  if (reply) {
    chatHistory.push({ role: 'assistant', content: reply });
    return reply;
  }
  return "Sorry, I can't connect right now — please try again in a moment 😊";
}

// ═══════════════════════════════════════════════
//  USDA API
// ═══════════════════════════════════════════════
const ZH_EN = {
  '米饭':'white rice cooked','炒饭':'fried rice','粥':'rice porridge',
  '面条':'noodles cooked','饺子':'dumplings','包子':'steamed bun',
  '鸡蛋':'egg whole cooked','鸡胸肉':'chicken breast cooked',
  '猪肉':'pork loin cooked','牛肉':'ground beef cooked',
  '三文鱼':'salmon cooked','虾':'shrimp cooked','鱼':'tilapia cooked',
  '豆腐':'tofu firm','花生':'peanuts roasted','坚果':'mixed nuts',
  '苹果':'apple raw','香蕉':'banana raw','橙子':'orange raw',
  '草莓':'strawberries raw','葡萄':'grapes raw','西瓜':'watermelon raw',
  '牛奶':'whole milk','酸奶':'yogurt plain','豆浆':'soy milk',
  '面包':'white bread','全麦面包':'whole wheat bread',
  '燕麦':'oatmeal cooked','沙拉':'garden salad',
  '汉堡':'hamburger','薯条':'french fries','披萨':'pizza',
};

async function searchUSDA(query) {
  try {
    const q = ZH_EN[query] || query;
    const url = `${USDA_URL}?query=${encodeURIComponent(q)}&pageSize=5&dataType=Foundation,SR%20Legacy&api_key=${USDA_KEY}`;
    const r = await fetch(url);
    if (!r.ok) return [];
    const d = await r.json();
    return d.foods || [];
  } catch { return []; }
}

function parseNutrients(food, grams) {
  const ns = food.foodNutrients || [];
  const f = (kw) => {
    const n = ns.find(n => n.nutrientName?.toLowerCase().includes(kw));
    return n ? Math.round((n.value || 0) * grams / 100) : 0;
  };
  return { cal: f('energy'), protein: f('protein'), fat: f('total lipid'), carbs: f('carbohydrate'), grams };
}

// ═══════════════════════════════════════════════
//  GOAL CONFIGS
// ═══════════════════════════════════════════════
const GOALS = {
  'healthy':       { label:'Stay Healthy',   kcal:2000, protein:100, carbs:250, fat:65 },
  'lose-weight':   { label:'Lose Weight',    kcal:1600, protein:120, carbs:160, fat:50 },
  'senior-health': { label:'Senior Health',  kcal:1800, protein:90,  carbs:220, fat:55 },
};

const GOAL_META = {
  'healthy':       { icon:'', label:'Stay Healthy',  desc:'Balanced nutrition, more energy' },
  'lose-weight':   { icon:'', label:'Lose Weight',   desc:'Manage calories, no crash diets' },
  'senior-health': { icon:'', label:'Senior Health', desc:'Bones, heart & chronic conditions' },
};

const MEAL_LABEL  = { breakfast:'Breakfast', lunch:'Lunch', dinner:'Dinner', snack:'Snack' };
const PORTION_G   = { small:150, medium:280, large:420 };
const PORTION_TXT = { small:'Small\n150g', medium:'Medium\n280g', large:'Large\n420g' };
const DAY_NAMES   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MON_NAMES   = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ═══════════════════════════════════════════════
//  STATE
// ═══════════════════════════════════════════════
let S = { profile: null, logs: {}, watchList: [] };
let pendingFood    = null;
let pendingPhotoUrl = null;

function load() {
  try { const r = localStorage.getItem('nutriai'); if (r) S = JSON.parse(r); } catch(e) {}
  if (!S.watchList) S.watchList = [];
}
function save() { localStorage.setItem('nutriai', JSON.stringify(S)); }
function todayKey()  { return new Date().toISOString().slice(0,10); }
function todayLogs() { return S.logs[todayKey()] || []; }

function mealNow() {
  const h = new Date().getHours();
  if (h >= 5  && h < 10) return 'breakfast';
  if (h >= 10 && h < 15) return 'lunch';
  if (h >= 15 && h < 18) return 'snack';
  if (h >= 18 && h < 22) return 'dinner';
  return 'snack';
}

// ═══════════════════════════════════════════════
//  LOG
// ═══════════════════════════════════════════════
function logFood(name, mealTime, nutrients, emoji, photoUrl) {
  const key = todayKey();
  if (!S.logs[key]) S.logs[key] = [];
  const id = Date.now();
  S.logs[key].push({ id, name, mealTime, emoji: emoji||'🍽️', photoUrl: photoUrl||null, ...nutrients, time: new Date().toISOString() });
  save();
  return id;
}

function updateLog(id, nutrients) {
  const key = todayKey();
  const e = (S.logs[key]||[]).find(e => e.id === id);
  if (e) { Object.assign(e, nutrients); save(); }
}

function totals(logs) {
  return logs.reduce((a,l) => ({ cal:a.cal+(l.cal||0), protein:a.protein+(l.protein||0), carbs:a.carbs+(l.carbs||0), fat:a.fat+(l.fat||0) }), {cal:0,protein:0,carbs:0,fat:0});
}

// ═══════════════════════════════════════════════
//  CHAT UI HELPERS
// ═══════════════════════════════════════════════
const $chat = () => document.getElementById('chat');

function scroll() {
  requestAnimationFrame(() => { const c = $chat(); c.scrollTop = c.scrollHeight; });
}

function appendMsg(role, content) {
  const row = document.createElement('div');
  row.className = `msg ${role}`;
  const av = document.createElement('div');
  av.className = 'avatar';
  av.textContent = role === 'ai' ? 'AI' : 'Me';

  if (typeof content === 'string') {
    const bub = document.createElement('div');
    bub.className = 'bubble';
    bub.innerHTML = content.replace(/\n/g,'<br>').replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
    row.appendChild(av); row.appendChild(bub);
  } else {
    const shell = document.createElement('div');
    shell.style.cssText = 'padding:0;background:transparent;box-shadow:none;';
    shell.appendChild(content);
    row.appendChild(av); row.appendChild(shell);
  }

  $chat().appendChild(row);
  scroll();
  return row;
}

let typingRow = null;

function showTyping() {
  typingRow = document.createElement('div');
  typingRow.className = 'msg ai';
  typingRow.innerHTML = `<div class="avatar">AI</div><div class="dots"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>`;
  $chat().appendChild(typingRow);
  scroll();
}

function hideTyping() { if (typingRow) { typingRow.remove(); typingRow = null; } }

const wait = ms => new Promise(r => setTimeout(r, ms));

// ═══════════════════════════════════════════════
//  PHOTO FLOW  ← 真实 Claude Vision
// ═══════════════════════════════════════════════
async function handlePhoto(input) {
  if (!input.files?.[0]) return;
  const file = input.files[0];
  input.value = '';

  const photoUrl = URL.createObjectURL(file);
  pendingPhotoUrl = photoUrl;

  // Show user photo bubble
  const row = document.createElement('div');
  row.className = 'msg user';
  row.innerHTML = `<div class="avatar">Me</div>`;
  const pb = document.createElement('div');
  pb.className = 'photo-bubble';
  pb.innerHTML = `<img src="${photoUrl}" alt="food">`;
  row.appendChild(pb);
  $chat().appendChild(row);
  scroll();

  showTyping();

  // Convert to base64 and call Claude Vision
  const { base64, mimeType } = await fileToBase64(file);
  const detected = await recognizeFood(base64, mimeType);

  hideTyping();

  const meal = mealNow();

  if (!detected) {
    // Vision failed → ask user to type
    appendMsg('ai', "I couldn't recognise that image — could you tell me what you ate?");
    pendingFood = { mealTime: meal, awaitingCorrection: true };
    return;
  }

  pendingFood = { ...detected, mealTime: meal };

  const card = document.createElement('div');
  card.className = 'n-card';
  card.innerHTML = `
    <div class="meal-tag">Detected · ${MEAL_LABEL[meal]}</div>
    <div style="font-size:14px;margin:8px 0 12px;color:var(--text)">I see <strong>${detected.zh}</strong> — is that right?</div>
    <div class="confirm-wrap">
      <button class="c-btn yes" onclick="confirmFood()">Yes</button>
      <button class="c-btn no"  onclick="denyFood()">No</button>
    </div>`;
  appendMsg('ai', card);
}

async function confirmFood() {
  if (!pendingFood) return;
  disableConfirmBtns();
  appendMsg('user', 'Yes');
  showTyping();

  const [foods] = await Promise.all([searchUSDA(pendingFood.en || pendingFood.zh), wait(400)]);
  hideTyping();

  if (!foods.length) {
    // USDA miss → Claude estimates calories
    const est = await estimateWithClaude(pendingFood.zh);
    if (est) {
      buildNutritionCardManual(pendingFood.zh, est, pendingFood.mealTime, pendingFood.emoji || '🍽️', pendingPhotoUrl);
    } else {
      appendMsg('ai', `Got it! Logged "${pendingFood.zh}" — couldn't fetch nutrition data right now.`);
      logFood(pendingFood.zh, pendingFood.mealTime, {cal:0,protein:0,carbs:0,fat:0,grams:0}, pendingFood.emoji||'🍽️', pendingPhotoUrl);
    }
  } else {
    buildNutritionCard(pendingFood.zh, foods[0], pendingFood.mealTime, pendingFood.emoji||'🍽️', pendingPhotoUrl);
  }
  pendingFood = null; pendingPhotoUrl = null;
}

function denyFood() {
  disableConfirmBtns();
  pendingFood.awaitingCorrection = true;
  appendMsg('ai', "My mistake! What did you actually eat?");
  document.getElementById('text-in').focus();
}

function disableConfirmBtns() {
  document.querySelectorAll('.c-btn').forEach(b => b.disabled = true);
}

// ─── Claude 估算营养（USDA 找不到时备用）────────
async function estimateWithClaude(foodName) {
  const text = await callClaude(
    [{ role:'user', content:`请估算"${foodName}"（标准份量约 280g）的营养成分，只返回 JSON，不要其他文字：{"cal":数字,"protein":数字,"carbs":数字,"fat":数字,"grams":280}` }],
    'You are a nutrition database. Output only a JSON object with single numbers, no ranges.',
    100
  );
  if (!text) return null;
  try { return JSON.parse(text.match(/\{[\s\S]*\}/)?.[0]); } catch { return null; }
}

// ═══════════════════════════════════════════════
//  NUTRITION CARD (USDA data)
// ═══════════════════════════════════════════════
function buildNutritionCard(zhName, usdaFood, mealTime, emoji, photoUrl, initGrams = 280) {
  _buildCard(zhName, () => parseNutrients(usdaFood, initGrams), (g) => parseNutrients(usdaFood, g), mealTime, emoji, photoUrl, `Source: USDA FoodData Central`);
}

// USDA miss → Claude estimate
function buildNutritionCardManual(zhName, nutrients, mealTime, emoji, photoUrl) {
  _buildCard(zhName, () => nutrients, (g) => {
    const scale = g / (nutrients.grams || 280);
    return { cal: Math.round(nutrients.cal*scale), protein: Math.round(nutrients.protein*scale), carbs: Math.round(nutrients.carbs*scale), fat: Math.round(nutrients.fat*scale), grams: g };
  }, mealTime, emoji, photoUrl, 'Source: AI estimate (approximate)');
}

function _buildCard(zhName, initFn, scaleFn, mealTime, emoji, photoUrl, srcLabel) {
  const card = document.createElement('div');
  card.className = 'n-card';

  const tag  = document.createElement('div'); tag.className = 'meal-tag'; tag.textContent = 'Logged · ' + MEAL_LABEL[mealTime];
  const name = document.createElement('div'); name.className = 'n-name'; name.textContent = zhName;
  const src  = document.createElement('div'); src.className = 'n-source';
  const calN = document.createElement('div'); calN.className = 'n-cal';
  const calU = document.createElement('div'); calU.className = 'n-cal-unit'; calU.textContent = '千卡 (kcal)';

  const macroRow = document.createElement('div'); macroRow.className = 'macros';
  const mEls = ['Protein','Carbs','Fat'].map(lbl => {
    const m = document.createElement('div'); m.className = 'macro';
    const v = document.createElement('div'); v.className = 'm-val';
    const l = document.createElement('div'); l.className = 'm-lbl'; l.textContent = lbl;
    m.appendChild(v); m.appendChild(l); macroRow.appendChild(m); return v;
  });

  const pLabel = document.createElement('div');
  pLabel.style.cssText = 'font-size:11px;color:var(--sub);margin-bottom:5px;';
  pLabel.textContent = '调整份量';

  const pRow = document.createElement('div'); pRow.className = 'portion-row';

  let n = initFn();
  const entryId = logFood(zhName, mealTime, n, emoji, photoUrl);

  function refresh(nutrients) {
    calN.textContent = nutrients.cal;
    src.textContent  = `${srcLabel} · ${nutrients.grams}g`;
    mEls[0].textContent = nutrients.protein + 'g';
    mEls[1].textContent = nutrients.carbs   + 'g';
    mEls[2].textContent = nutrients.fat     + 'g';
  }
  refresh(n);

  ['small','medium','large'].forEach(size => {
    const btn = document.createElement('button');
    btn.className = 'p-btn' + (size === 'medium' ? ' active' : '');
    btn.textContent = PORTION_TXT[size];
    btn.onclick = () => {
      pRow.querySelectorAll('.p-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      n = scaleFn(PORTION_G[size]);
      refresh(n);
      updateLog(entryId, n);
    };
    pRow.appendChild(btn);
  });

  card.appendChild(tag); card.appendChild(name); card.appendChild(src);
  card.appendChild(calN); card.appendChild(calU); card.appendChild(macroRow);
  card.appendChild(pLabel); card.appendChild(pRow);
  appendMsg('ai', card);

  // Claude follow-up comment
  setTimeout(async () => {
    const reply = await claudeChat(`The user just logged "${zhName}" (${n.cal} kcal). Give one short encouraging comment or tip.`);
    if (reply) appendMsg('ai', reply);
  }, 300);
}

// ═══════════════════════════════════════════════
//  TEXT INPUT  ← Claude 处理所有对话
// ═══════════════════════════════════════════════
function onKey(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); } }

async function onSend() {
  const el  = document.getElementById('text-in');
  const txt = el.value.trim();
  if (!txt) return;
  el.value = '';
  appendMsg('user', txt);

  // ── 纠正食物识别 ──
  if (pendingFood?.awaitingCorrection) {
    pendingFood.awaitingCorrection = false;
    showTyping();
    const foods = await searchUSDA(txt);
    hideTyping();
    if (foods.length) {
      buildNutritionCard(txt, foods[0], pendingFood.mealTime, '🍽️', pendingPhotoUrl);
    } else {
      const est = await estimateWithClaude(txt);
      if (est) buildNutritionCardManual(txt, est, pendingFood.mealTime, '🍽️', pendingPhotoUrl);
      else appendMsg('ai', `No data found for "${txt}" — try a different description?`);
    }
    pendingFood = null; pendingPhotoUrl = null;
    return;
  }

  // ── 判断是否是记录食物 ──
  const isFoodLog = /(吃了|吃的|刚吃|刚刚吃|eat|ate)/.test(txt.toLowerCase()) || txt.length < 12;

  if (isFoodLog) {
    const foodName = txt.replace(/我|吃了|吃的|刚吃了|刚刚吃了|刚吃|一碗|一个|一份|一片|一杯/g,'').trim() || txt;
    showTyping();
    const foods = await searchUSDA(foodName);
    hideTyping();
    if (foods.length) {
      buildNutritionCard(foodName, foods[0], mealNow(), '🍽️', null);
    } else {
      // USDA miss → Claude estimate
      showTyping();
      const est = await estimateWithClaude(foodName);
      hideTyping();
      if (est) buildNutritionCardManual(foodName, est, mealNow(), '🍽️', null);
      else {
        const reply = await claudeChat(txt);
        appendMsg('ai', reply || "I couldn't find that food — try describing it differently.");
      }
    }
    return;
  }

  // ── 所有其他情况 → Claude 对话 ──
  showTyping();
  const reply = await claudeChat(txt);
  hideTyping();
  appendMsg('ai', reply || "Sorry, I can't connect right now — try again in a moment.");
}

// ═══════════════════════════════════════════════
//  TODAY SUMMARY
// ═══════════════════════════════════════════════
async function todaySummary() {
  const logs = todayLogs();
  if (!logs.length) { appendMsg('ai', "No meals logged today yet — take a photo to get started."); return; }

  const t   = totals(logs);
  const cfg = GOALS[S.profile.goal];
  const pct = Math.round(t.cal / cfg.kcal * 100);

  const card = document.createElement('div');
  card.className = 'r-card';
  card.innerHTML = `
    <div class="r-title">Today's Summary</div>
    <div class="r-row"><span class="r-lbl">Calories eaten</span><span class="r-val">${t.cal} kcal</span></div>
    <div class="r-row"><span class="r-lbl">Daily goal</span><span class="r-val">${cfg.kcal} kcal</span></div>
    <div class="r-row"><span class="r-lbl">Progress</span><span class="r-val">${pct}%</span></div>
    <div class="r-row"><span class="r-lbl">Protein</span><span class="r-val">${t.protein}g / ${cfg.protein}g</span></div>
    <div class="r-row"><span class="r-lbl">Carbs</span><span class="r-val">${t.carbs}g</span></div>
    <div class="r-row"><span class="r-lbl">Fat</span><span class="r-val">${t.fat}g</span></div>`;
  appendMsg('ai', card);

  // Claude 个性化评价
  showTyping();
  const aiComment = await claudeChat(`Today the user ate ${t.cal} kcal (goal ${cfg.kcal}) and ${t.protein}g protein (goal ${cfg.protein}g). Give one short evaluation and tip.`);
  hideTyping();
  if (aiComment) appendMsg('ai', aiComment);
}

// ═══════════════════════════════════════════════
//  WEEKLY REPORT  ← Claude 分析 + 询问是否添加注意事项
// ═══════════════════════════════════════════════
async function showReportWithWatchPrompt() {
  const cfg = GOALS[S.profile.goal];
  let sumCal=0, sumP=0, sumCarbs=0, sumFat=0, days=0;

  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate()-i);
    const t = totals(S.logs[d.toISOString().slice(0,10)] || []);
    if (t.cal > 0) { sumCal+=t.cal; sumP+=t.protein; sumCarbs+=t.carbs; sumFat+=t.fat; days++; }
  }
  const avgCal=days?Math.round(sumCal/days):0, avgP=days?Math.round(sumP/days):0;
  const avgCarbs=days?Math.round(sumCarbs/days):0, avgFat=days?Math.round(sumFat/days):0;

  // Show data card first
  const card = document.createElement('div');
  card.className = 'r-card';
  card.innerHTML = `
    <div class="r-title">Weekly Report</div>
    <div class="r-row"><span class="r-lbl">Days logged</span><span class="r-val">${days} / 7</span></div>
    <div class="r-row"><span class="r-lbl">Avg calories</span><span class="r-val">${avgCal} <small style="color:#94A3B8">/ goal ${cfg.kcal}</small></span></div>
    <div class="r-row"><span class="r-lbl">Avg protein</span><span class="r-val">${avgP}g <small style="color:#94A3B8">/ goal ${cfg.protein}g</small></span></div>
    <div class="r-row"><span class="r-lbl">Avg carbs</span><span class="r-val">${avgCarbs}g</span></div>
    <div class="r-row"><span class="r-lbl">Avg fat</span><span class="r-val">${avgFat}g</span></div>`;
  appendMsg('ai', card);

  // Claude generates personalised analysis
  showTyping();
  const statsStr = JSON.stringify({ goal: cfg.label, kcal_target: cfg.kcal, avg_cal: avgCal, avg_protein: avgP, avg_carbs: avgCarbs, avg_fat: avgFat, record_days: days, protein_target: cfg.protein });
  const analysisPrompt = `Based on this week's diet data, give 2-3 personalised tips in English (encouraging tone, not critical), and list 1-2 nutrients to watch.
Data: ${statsStr}
Return only JSON: {"tips":["tip1","tip2"],"watchNutrients":[{"name":"nutrient name","reason":"one-sentence reason"}]}`;

  const text = await callClaude([{ role:'user', content: analysisPrompt }], 'You are a nutrition analyst. Output only JSON.', 600);
  hideTyping();

  let tips = [], watchNutrients = [];

  if (text) {
    try {
      const json = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0]);
      tips = json.tips || [];
      watchNutrients = json.watchNutrients || [];
    } catch { tips = [text]; }
  }

  // Fallback tips if Claude fails
  if (!tips.length) {
    if (days < 3) tips.push('Try logging every day — a quick photo is all it takes!');
    if (avgP > 0 && avgP < cfg.protein * 0.75) tips.push('Protein is a bit low — try adding eggs, tofu or chicken breast.');
    if (!tips.length) tips.push('Great week overall — keep it up!');
  }

  // Append tips to card
  const wrap = document.createElement('div'); wrap.className = 'r-suggestions';
  tips.forEach(t => { const d = document.createElement('div'); d.className = 'r-tip'; d.textContent = t; wrap.appendChild(d); });
  card.appendChild(wrap);
  scroll();

  // Ask to add watch items (filter already-watching ones)
  const newItems = watchNutrients.filter(w => !(S.watchList||[]).find(e => e.name === w.name));
  if (!newItems.length) return;

  setTimeout(() => {
    window._pendingWatchItems = newItems;
    const askCard = document.createElement('div');
    askCard.className = 'add-watch-card';
    const tagRow = document.createElement('div'); tagRow.className = 'add-watch-items';
    newItems.forEach(item => {
      const tag = document.createElement('span'); tag.className = 'add-watch-tag'; tag.textContent = item.name;
      tagRow.appendChild(tag);
    });
    askCard.innerHTML = `<div class="add-watch-title">Add to Watch List?</div><div class="add-watch-body">Based on your week, AI suggests keeping an eye on:</div>`;
    askCard.appendChild(tagRow);
    const btns = document.createElement('div'); btns.className = 'confirm-wrap';
    btns.innerHTML = `<button class="c-btn yes" onclick="confirmAddWatch(event)">Add</button><button class="c-btn no" onclick="denyAddWatch(event)">Maybe later</button>`;
    askCard.appendChild(btns);
    appendMsg('ai', askCard);
  }, 500);
}

function showReport() { showReportWithWatchPrompt(); }

// ═══════════════════════════════════════════════
//  MEAL SUGGESTION  ← Claude
// ═══════════════════════════════════════════════
async function mealSuggestion() {
  const cfg = GOALS[S.profile.goal];
  const rem = cfg.kcal - totals(todayLogs()).cal;
  showTyping();
  const reply = await claudeChat(`The user has ${rem} kcal left today, goal is "${cfg.label}", it's ${MEAL_LABEL[mealNow()]} time. Suggest 2-3 good food options with approximate calories.`);
  hideTyping();
  appendMsg('ai', reply || `About ${rem} kcal left today — try high-protein, lower-fat options.`);
}

// ═══════════════════════════════════════════════
//  TAB SWITCHING
// ═══════════════════════════════════════════════
function switchTab(tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');

  document.getElementById('chat-screen').classList.toggle('hidden',    tab !== 'chat');
  document.getElementById('stats-screen').classList.toggle('hidden',   tab !== 'stats');
  document.getElementById('profile-screen').classList.toggle('hidden', tab !== 'profile');

  const barRight = document.getElementById('bar-right');
  barRight.innerHTML = tab === 'stats'
    ? `<button class="report-btn" onclick="chatReport()">Weekly Report</button>`
    : '';

  if (tab === 'stats')   renderStats();
  if (tab === 'profile') renderProfile();
}

function chatReport() {
  switchTab('chat');
  appendMsg('user', 'Generate my weekly report');
  showTyping();
  setTimeout(() => { hideTyping(); showReportWithWatchPrompt(); }, 600);
}

// ═══════════════════════════════════════════════
//  STATS SCREEN
// ═══════════════════════════════════════════════
function renderStats() {
  const container = document.getElementById('stats-content');
  container.innerHTML = '';
  const cfg = GOALS[S.profile.goal];

  let totalCal7=0, recordDays=0;
  for (let i=6;i>=0;i--) {
    const d=new Date(); d.setDate(d.getDate()-i);
    const t=totals(S.logs[d.toISOString().slice(0,10)]||[]);
    if (t.cal>0){totalCal7+=t.cal;recordDays++;}
  }
  const avgCal7 = recordDays ? Math.round(totalCal7/recordDays) : 0;

  const summary = document.createElement('div');
  summary.className = 'stats-summary';
  summary.innerHTML = `
    <div class="sum-item"><div class="sum-val">${recordDays}</div><div class="sum-lbl">Days logged</div></div>
    <div class="sum-item"><div class="sum-val">${avgCal7}</div><div class="sum-lbl">Avg calories</div></div>
    <div class="sum-item"><div class="sum-val">${cfg.kcal}</div><div class="sum-lbl">Daily goal</div></div>`;
  container.appendChild(summary);

  for (let i=0;i<=6;i++) {
    const d=new Date(); d.setDate(d.getDate()-i);
    const key  = d.toISOString().slice(0,10);
    const logs = S.logs[key]||[];
    const t    = totals(logs);
    const pct  = Math.min(Math.round(t.cal/cfg.kcal*100),100);
    const label = i===0?'Today':i===1?'Yesterday':`${MON_NAMES[d.getMonth()]} ${d.getDate()} ${DAY_NAMES[d.getDay()]}`;

    const block = document.createElement('div');
    block.className = 'day-block';
    block.innerHTML = `
      <div class="day-header">
        <span class="day-label">${label}</span>
        <span class="day-cal">${t.cal>0?t.cal+' kcal':'Not logged'}</span>
      </div>
      <div class="day-goal-bar-bg"><div class="day-goal-bar-fill" style="width:${pct}%"></div></div>`;

    const items = document.createElement('div'); items.className = 'day-items';
    if (!logs.length) {
      items.innerHTML = `<div class="empty-day">Nothing logged — take a photo to record a meal!</div>`;
    } else {
      logs.forEach(entry => {
        const item = document.createElement('div'); item.className = 'stat-item';
        let visual;
        if (entry.photoUrl) {
          visual = document.createElement('div'); visual.className = 'stat-photo';
          visual.innerHTML = `<img src="${entry.photoUrl}" alt="${entry.name}">`;
        } else {
          visual = document.createElement('div'); visual.className = 'stat-emoji-box';
          visual.textContent = entry.emoji||'🍽️';
        }
        const badge = document.createElement('div'); badge.className = 'stat-meal-badge'; badge.textContent = MEAL_LABEL[entry.mealType]||'';
        const nm = document.createElement('div'); nm.className = 'stat-name'; nm.textContent = entry.name;
        const kc = document.createElement('div'); kc.className = 'stat-kcal'; kc.textContent = (entry.cal||0)+' kcal';
        item.appendChild(visual); item.appendChild(badge); item.appendChild(nm); item.appendChild(kc);
        items.appendChild(item);
      });
    }
    block.appendChild(items);
    container.appendChild(block);
  }
}

// ═══════════════════════════════════════════════
//  PROFILE SCREEN
// ═══════════════════════════════════════════════
let openProPanel = null;

function togglePro(panel) {
  if (openProPanel === panel) { closePro(panel); openProPanel = null; }
  else { if (openProPanel) closePro(openProPanel); openProPanel = panel; openPro(panel); }
}
function openPro(panel)  { document.getElementById(`pro-${panel}-expand`).classList.remove('hidden'); document.getElementById(`pro-${panel}-chev`)?.classList.add('open'); }
function closePro(panel) { document.getElementById(`pro-${panel}-expand`).classList.add('hidden');    document.getElementById(`pro-${panel}-chev`)?.classList.remove('open'); }

function renderProfile() {
  if (!S.profile) return;
  const meta = GOAL_META[S.profile.goal];
  document.getElementById('pro-goal-sub').textContent = meta.label;
  document.getElementById('pro-cal-sub').textContent  = `${S.profile.kcal} kcal / day`;

  const opts = document.getElementById('goal-opts');
  opts.innerHTML = '';
  Object.entries(GOAL_META).forEach(([key, m]) => {
    const isCurrent = key === S.profile.goal;
    const btn = document.createElement('button');
    btn.className = 'goal-opt' + (isCurrent ? ' current' : '');
    btn.innerHTML = `
      <div><div class="goal-opt-label">${m.label}</div><div class="goal-opt-desc">${m.desc}</div></div>
      ${isCurrent ? '<span class="goal-opt-check">✓</span>' : ''}`;
    btn.onclick = (e) => { e.stopPropagation(); changeGoal(key); };
    opts.appendChild(btn);
  });

  const slider = document.getElementById('cal-slider');
  slider.value = S.profile.kcal;
  document.getElementById('cal-val-display').textContent = S.profile.kcal + ' kcal';
  renderWatchList();
}

function changeGoal(goal) {
  const cfg = GOALS[goal];
  Object.assign(S.profile, { goal, kcal: cfg.kcal, protein: cfg.protein, carbs: cfg.carbs, fat: cfg.fat });
  save();
  renderProfile();
  const meta = GOAL_META[goal];
  setTimeout(async () => {
    const reply = await claudeChat(`The user just switched their goal to "${meta.label}", daily calorie target updated to ${cfg.kcal} kcal. Give a short encouraging message.`);
    appendMsg('ai', reply || `Goal switched to "${meta.label}" — daily target ${cfg.kcal} kcal. You've got this!`);
  }, 100);
}

function onCalSlider(val) { document.getElementById('cal-val-display').textContent = val + ' kcal'; }

function saveCalTarget(e) {
  e.stopPropagation();
  const val = parseInt(document.getElementById('cal-slider').value);
  S.profile.kcal = val; save();
  document.getElementById('pro-cal-sub').textContent = `${val} kcal / day`;
  closePro('cal'); openProPanel = null;
  setTimeout(async () => {
    const reply = await claudeChat(`The user updated their daily calorie target to ${val} kcal. Give a short confirmation and encouragement.`);
    appendMsg('ai', reply || `Daily calorie target updated to ${val} kcal ✅`);
    switchTab('chat');
  }, 100);
}

function renderWatchList() {
  const list = document.getElementById('watch-list');
  list.innerHTML = '';
  const wl = S.watchList||[];
  document.getElementById('pro-watch-sub').textContent = wl.length ? wl.map(w=>w.name).join(', ') : 'None yet';
  wl.forEach((item, idx) => {
    const row = document.createElement('div'); row.className = 'watch-item';
    row.innerHTML = `
      <div class="watch-left">
        <div class="watch-name">${item.name}</div>
        <div class="watch-reason">${item.reason}</div>
      </div>
      <button class="watch-del" onclick="removeWatch(${idx},event)">×</button>`;
    list.appendChild(row);
  });
}

function removeWatch(idx, e) {
  e.stopPropagation();
  S.watchList.splice(idx,1); save(); renderWatchList();
}

function addWatchItems(items) {
  if (!S.watchList) S.watchList=[];
  items.forEach(item => { if (!S.watchList.find(w=>w.name===item.name)) S.watchList.push(item); });
  save();
}

function confirmAddWatch(e) {
  e.stopPropagation();
  document.querySelectorAll('.c-btn').forEach(b=>b.disabled=true);
  addWatchItems(window._pendingWatchItems||[]);
  window._pendingWatchItems = null;
  appendMsg('user','Add');
  appendMsg('ai','Added to My Profile — Nutrients to Watch.\nYou can view or remove them anytime in the Profile tab.');
}

function denyAddWatch(e) {
  e.stopPropagation();
  document.querySelectorAll('.c-btn').forEach(b=>b.disabled=true);
  window._pendingWatchItems = null;
  appendMsg('ai','Got it! You can always check the Profile tab later 😊');
}

// ═══════════════════════════════════════════════
//  ONBOARDING
// ═══════════════════════════════════════════════
let selectedGroup = null;

function selectGroup(group) {
  selectedGroup = group;
  document.querySelectorAll('#ob-1 .ob-option').forEach(b => b.classList.toggle('selected', b.dataset.val===group));
  setTimeout(() => { document.getElementById('ob-1').classList.add('hidden'); document.getElementById('ob-2').classList.remove('hidden'); }, 260);
}

function selectGoal(goal) {
  document.querySelectorAll('#ob-2 .ob-option').forEach(b => b.classList.toggle('selected', b.dataset.val===goal));
  const cfg = GOALS[goal];
  S.profile = { group: selectedGroup||'worker', goal, kcal:cfg.kcal, protein:cfg.protein, carbs:cfg.carbs, fat:cfg.fat };
  save();
  setTimeout(() => { document.getElementById('onboarding').style.display='none'; startApp(); }, 300);
}

// ═══════════════════════════════════════════════
//  APP INIT
// ═══════════════════════════════════════════════
function setTodayLabel() {
  const d = new Date();
  document.getElementById('today-str').textContent = `${MON_NAMES[d.getMonth()]} ${d.getDate()} ${DAY_NAMES[d.getDay()]}`;
}

async function startApp() {
  document.getElementById('main').classList.remove('hidden');
  setTodayLabel();

  const cfg = GOALS[S.profile.goal];
  const h   = new Date().getHours();
  const gr  = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';

  if (!S._greeted) {
    S._greeted = true; save();
    // Claude generates a personalised welcome
    showTyping();
    const welcome = await claudeChat(`The user just opened Nourish for the first time. Their goal is "${cfg.label}". Start with "${gr}" and write 2-3 friendly sentences introducing the core features: photo food logging, AI chat, and diet reports.`);
    hideTyping();
    appendMsg('ai', welcome || `${gr}! I'm Nourish, your nutrition assistant.\nGoal: "${cfg.label}" — ${cfg.kcal} kcal/day\n\nUpload a photo to auto-log meals, or just tell me what you ate.\nTap the tabs below to view your daily log.`);
  } else {
    const t   = totals(todayLogs());
    const rem = cfg.kcal - t.cal;
    if (t.cal===0) {
      appendMsg('ai', `${gr}! Nothing logged yet today — take a photo to get started.`);
    } else {
      showTyping();
      const reply = await claudeChat(`The user has logged ${t.cal} kcal today, with ${Math.max(0,rem)} kcal remaining. It is ${gr.toLowerCase()} time. Give a short greeting and status update.`);
      hideTyping();
      appendMsg('ai', reply || `${gr}! You've logged **${t.cal} kcal** today — **${Math.max(0,rem)} kcal** remaining.`);
    }
  }
}

function init() {
  load();
  if (S.profile) { document.getElementById('onboarding').style.display='none'; startApp(); }
}

init();
