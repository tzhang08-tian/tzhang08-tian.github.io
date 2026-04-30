// ===================== FOOD DATABASE =====================
const FOODS = [
  // Breakfast
  {id:'eggs',name:'Scrambled Eggs',emoji:'🍳',category:'Breakfast',cal:200,protein:14,carbs:2,fat:15},
  {id:'oatmeal',name:'Oatmeal',emoji:'🥣',category:'Breakfast',cal:150,protein:5,carbs:27,fat:3},
  {id:'toast',name:'Toast with Butter',emoji:'🍞',category:'Breakfast',cal:160,protein:4,carbs:24,fat:6},
  {id:'pancakes',name:'Pancakes',emoji:'🥞',category:'Breakfast',cal:350,protein:8,carbs:56,fat:11},
  {id:'yogurt',name:'Greek Yogurt',emoji:'🫙',category:'Breakfast',cal:130,protein:12,carbs:10,fat:4},
  {id:'avocado_toast',name:'Avocado Toast',emoji:'🥑',category:'Breakfast',cal:290,protein:8,carbs:30,fat:16},
  {id:'bagel',name:'Bagel with Cream Cheese',emoji:'🥯',category:'Breakfast',cal:340,protein:10,carbs:58,fat:8},
  {id:'pb_toast',name:'Peanut Butter Toast',emoji:'🍞',category:'Breakfast',cal:280,protein:10,carbs:28,fat:16},
  {id:'waffles',name:'Waffles',emoji:'🧇',category:'Breakfast',cal:310,protein:8,carbs:48,fat:10},
  {id:'muffin',name:'Blueberry Muffin',emoji:'🫐',category:'Breakfast',cal:290,protein:5,carbs:45,fat:10},
  // Lunch
  {id:'sandwich',name:'Turkey Sandwich',emoji:'🥪',category:'Lunch',cal:350,protein:22,carbs:38,fat:12},
  {id:'salad',name:'Garden Salad',emoji:'🥗',category:'Lunch',cal:120,protein:4,carbs:14,fat:6},
  {id:'caesar_salad',name:'Caesar Salad',emoji:'🥗',category:'Lunch',cal:280,protein:10,carbs:18,fat:18},
  {id:'soup',name:'Vegetable Soup',emoji:'🍲',category:'Lunch',cal:140,protein:6,carbs:22,fat:3},
  {id:'burger',name:'Hamburger',emoji:'🍔',category:'Lunch',cal:550,protein:30,carbs:45,fat:28},
  {id:'pizza',name:'Pizza 2 slices',emoji:'🍕',category:'Lunch',cal:500,protein:20,carbs:60,fat:20},
  {id:'burrito',name:'Burrito',emoji:'🌯',category:'Lunch',cal:480,protein:22,carbs:62,fat:16},
  {id:'wrap',name:'Chicken Wrap',emoji:'🌮',category:'Lunch',cal:380,protein:26,carbs:40,fat:13},
  {id:'sushi',name:'Sushi Roll 6pcs',emoji:'🍣',category:'Lunch',cal:300,protein:15,carbs:45,fat:7},
  {id:'pasta_lunch',name:'Pasta Salad',emoji:'🍝',category:'Lunch',cal:320,protein:10,carbs:52,fat:9},
  // Dinner
  {id:'chicken_breast',name:'Grilled Chicken Breast',emoji:'🍗',category:'Dinner',cal:280,protein:53,carbs:0,fat:6},
  {id:'salmon',name:'Baked Salmon',emoji:'🐟',category:'Dinner',cal:350,protein:46,carbs:0,fat:17},
  {id:'steak',name:'Beef Steak',emoji:'🥩',category:'Dinner',cal:450,protein:48,carbs:0,fat:27},
  {id:'pasta',name:'Spaghetti Meatballs',emoji:'🍝',category:'Dinner',cal:520,protein:28,carbs:65,fat:16},
  {id:'rice_bowl',name:'Rice Bowl',emoji:'🍚',category:'Dinner',cal:380,protein:18,carbs:62,fat:7},
  {id:'stir_fry',name:'Vegetable Stir Fry',emoji:'🥘',category:'Dinner',cal:280,protein:12,carbs:35,fat:10},
  {id:'tacos',name:'Tacos 2',emoji:'🌮',category:'Dinner',cal:420,protein:24,carbs:44,fat:16},
  {id:'ramen',name:'Ramen',emoji:'🍜',category:'Dinner',cal:430,protein:18,carbs:60,fat:14},
  {id:'poke_bowl',name:'Poke Bowl',emoji:'🥙',category:'Dinner',cal:450,protein:28,carbs:55,fat:14},
  {id:'chicken_soup',name:'Chicken Noodle Soup',emoji:'🍲',category:'Dinner',cal:200,protein:16,carbs:24,fat:5},
  {id:'fried_rice',name:'Fried Rice',emoji:'🍳',category:'Dinner',cal:400,protein:12,carbs:58,fat:14},
  {id:'dumplings',name:'Dumplings 6',emoji:'🥟',category:'Dinner',cal:280,protein:14,carbs:34,fat:9},
  {id:'tofu_stir_fry',name:'Tofu Stir Fry',emoji:'🥘',category:'Dinner',cal:200,protein:16,carbs:12,fat:11},
  {id:'shrimp',name:'Grilled Shrimp',emoji:'🦐',category:'Dinner',cal:200,protein:38,carbs:2,fat:3},
  // Snacks
  {id:'nuts',name:'Mixed Nuts',emoji:'🥜',category:'Snack',cal:170,protein:5,carbs:7,fat:15},
  {id:'chips',name:'Potato Chips',emoji:'🥔',category:'Snack',cal:160,protein:2,carbs:15,fat:10},
  {id:'granola_bar',name:'Granola Bar',emoji:'🍫',category:'Snack',cal:190,protein:4,carbs:30,fat:7},
  {id:'fruit_yogurt',name:'Fruit Yogurt Cup',emoji:'🫙',category:'Snack',cal:150,protein:5,carbs:28,fat:2},
  {id:'protein_bar',name:'Protein Bar',emoji:'🍫',category:'Snack',cal:220,protein:20,carbs:25,fat:7},
  {id:'hummus',name:'Hummus & Veggies',emoji:'🫘',category:'Snack',cal:160,protein:6,carbs:18,fat:8},
  {id:'edamame',name:'Edamame',emoji:'🫘',category:'Snack',cal:120,protein:11,carbs:10,fat:5},
  {id:'cookie',name:'Chocolate Chip Cookie',emoji:'🍪',category:'Snack',cal:150,protein:2,carbs:21,fat:7},
  {id:'ice_cream',name:'Ice Cream scoop',emoji:'🍦',category:'Snack',cal:270,protein:5,carbs:33,fat:14},
  {id:'dark_chocolate',name:'Dark Chocolate',emoji:'🍫',category:'Snack',cal:170,protein:2,carbs:20,fat:10},
  {id:'cheese',name:'Cheese slice',emoji:'🧀',category:'Snack',cal:110,protein:7,carbs:0,fat:9},
  // Fruits
  {id:'banana',name:'Banana',emoji:'🍌',category:'Fruit',cal:105,protein:1,carbs:27,fat:0},
  {id:'apple',name:'Apple',emoji:'🍎',category:'Fruit',cal:95,protein:0,carbs:25,fat:0},
  {id:'orange',name:'Orange',emoji:'🍊',category:'Fruit',cal:62,protein:1,carbs:15,fat:0},
  {id:'grapes',name:'Grapes bunch',emoji:'🍇',category:'Fruit',cal:100,protein:1,carbs:27,fat:0},
  {id:'strawberries',name:'Strawberries cup',emoji:'🍓',category:'Fruit',cal:50,protein:1,carbs:12,fat:0},
  // Sides
  {id:'white_rice',name:'White Rice cup',emoji:'🍚',category:'Side',cal:200,protein:4,carbs:45,fat:0},
  {id:'brown_rice',name:'Brown Rice cup',emoji:'🍚',category:'Side',cal:215,protein:5,carbs:45,fat:2},
  {id:'sweet_potato',name:'Sweet Potato',emoji:'🍠',category:'Side',cal:130,protein:3,carbs:30,fat:0},
  {id:'fries',name:'French Fries',emoji:'🍟',category:'Side',cal:380,protein:4,carbs:50,fat:18},
  {id:'broccoli',name:'Broccoli steamed',emoji:'🥦',category:'Side',cal:55,protein:4,carbs:11,fat:0},
  {id:'corn',name:'Corn on Cob',emoji:'🌽',category:'Side',cal:130,protein:5,carbs:29,fat:2},
  // Drinks
  {id:'coffee',name:'Coffee black',emoji:'☕',category:'Drink',cal:5,protein:0,carbs:1,fat:0},
  {id:'latte',name:'Latte',emoji:'☕',category:'Drink',cal:190,protein:10,carbs:20,fat:7},
  {id:'oj',name:'Orange Juice',emoji:'🥤',category:'Drink',cal:110,protein:2,carbs:26,fat:0},
  {id:'soda',name:'Soda can',emoji:'🥤',category:'Drink',cal:140,protein:0,carbs:39,fat:0},
  {id:'milk',name:'Milk glass',emoji:'🥛',category:'Drink',cal:150,protein:8,carbs:12,fat:8},
  {id:'protein_shake',name:'Protein Shake',emoji:'🥛',category:'Drink',cal:200,protein:30,carbs:10,fat:4},
  {id:'smoothie',name:'Fruit Smoothie',emoji:'🥤',category:'Drink',cal:180,protein:4,carbs:38,fat:1},
  {id:'beer',name:'Beer can',emoji:'🍺',category:'Drink',cal:150,protein:1,carbs:13,fat:0},
  {id:'wine',name:'Wine glass',emoji:'🍷',category:'Drink',cal:125,protein:0,carbs:4,fat:0},
  {id:'water',name:'Water',emoji:'💧',category:'Drink',cal:0,protein:0,carbs:0,fat:0},
];

const GOAL_CONFIGS = {
  'lose-weight': {
    name:'Lose Weight', emoji:'⚖️',
    calorieTarget:1500, protein:120, carbs:130, fat:50,
    tips:[
      'Fill half your plate with vegetables at every meal.',
      'Drink a glass of water before meals to feel fuller.',
      'Choose grilled, baked, or steamed over fried options.',
      'Eat slowly — it takes 20 minutes to feel full.',
      'Prep snacks in advance to avoid impulse eating.'
    ],
    insights:[
      'Cutting 200 kcal/day leads to ~0.5 lb loss per week.',
      'High-protein foods keep you fuller longer.',
      'Don\'t skip breakfast — it helps regulate hunger all day.'
    ]
  },
  'gain-muscle': {
    name:'Gain Muscle', emoji:'💪',
    calorieTarget:2500, protein:180, carbs:270, fat:75,
    tips:[
      'Aim for ~1g of protein per pound of bodyweight daily.',
      'Eat within 30–60 minutes after your workout.',
      'Don\'t fear carbs — they fuel your training sessions.',
      'Prioritize sleep: muscle grows during recovery.',
      'Spread protein intake across 3–4 meals for best absorption.'
    ],
    insights:[
      'Muscle gain requires a consistent calorie surplus.',
      'Protein timing matters — spread it throughout the day.',
      'Creatine from meat and fish supports muscle performance.'
    ]
  },
  'balanced': {
    name:'Stay Healthy', emoji:'🥗',
    calorieTarget:2000, protein:100, carbs:225, fat:65,
    tips:[
      'Eat a rainbow of colorful fruits and vegetables.',
      'Limit added sugars and ultra-processed foods.',
      'Aim for 3 balanced meals with consistent timing.',
      'Include fiber-rich foods like beans, oats, and greens.',
      'Stay hydrated — aim for 8 glasses of water daily.'
    ],
    insights:[
      'A varied diet covers most micronutrient needs naturally.',
      'Whole foods are more satisfying than processed alternatives.',
      'Consistent meal timing helps regulate energy levels.'
    ]
  },
  'senior': {
    name:'Senior Health', emoji:'🌿',
    calorieTarget:1800, protein:90, carbs:200, fat:60,
    tips:[
      'Include calcium-rich foods: milk, yogurt, leafy greens.',
      'Get enough fiber from fruits, vegetables, and whole grains.',
      'Stay hydrated — the sensation of thirst decreases with age.',
      'Vitamin D helps absorb calcium — get some daily sunlight.',
      'Smaller, more frequent meals can be easier to digest.'
    ],
    insights:[
      'Protein needs stay high with age to preserve muscle mass.',
      'Calcium + vitamin D together support bone density.',
      'Omega-3s from fish support heart and brain health.'
    ]
  },
  'student': {
    name:'Student Budget', emoji:'📚',
    calorieTarget:1800, protein:80, carbs:220, fat:60,
    tips:[
      'Eggs, canned beans, and rice are cheap protein powerhouses.',
      'Frozen vegetables are as nutritious as fresh — and cheaper.',
      'Batch cook on weekends to save time and money all week.',
      'Oatmeal is one of the cheapest and most filling breakfasts.',
      'Buying store-brand staples can cut your grocery bill in half.'
    ],
    insights:[
      'Beans + rice together form a complete protein.',
      'Peanut butter is calorie-dense and very affordable.',
      'Meal prepping 2× a week saves both time and money.'
    ]
  }
};

const MEAL_SUGGESTIONS = {
  breakfast: ['eggs','oatmeal','toast','yogurt','smoothie','banana','muffin','waffles','avocado_toast','pb_toast'],
  lunch: ['sandwich','salad','caesar_salad','soup','burger','wrap','sushi','burrito','pasta_lunch'],
  dinner: ['chicken_breast','salmon','steak','pasta','rice_bowl','stir_fry','tacos','ramen','poke_bowl'],
  snack: ['nuts','chips','granola_bar','fruit_yogurt','cheese','protein_bar','hummus','banana','apple','cookie']
};

const MEAL_TYPES = {
  breakfast: { label: 'Breakfast', emoji: '🌅' },
  lunch:     { label: 'Lunch',     emoji: '☀️' },
  dinner:    { label: 'Dinner',    emoji: '🌙' },
  snack:     { label: 'Snack',     emoji: '🍎' }
};

const PORTION_MULTIPLIERS = { small: 0.6, medium: 1.0, large: 1.5 };

// ===================== STATE =====================
let state = { profile: null, logs: {} };
let selectedGoal = null;
let currentMealTab = 'breakfast';
let modalFood = null;
let modalPortion = 'medium';
let toastTimer = null;

function loadState() {
  try {
    const saved = localStorage.getItem('nutrieasy_state');
    if (saved) state = JSON.parse(saved);
  } catch(e) {
    state = { profile: null, logs: {} };
  }
}

function saveState() {
  localStorage.setItem('nutrieasy_state', JSON.stringify(state));
}

function todayKey() {
  return new Date().toISOString().split('T')[0];
}

function todayLogs() {
  return state.logs[todayKey()] || [];
}

// ===================== ONBOARDING =====================
function obNext(step) {
  document.querySelectorAll('.ob-step').forEach(s => s.classList.remove('active'));
  document.getElementById('ob-step-' + step).classList.add('active');
  if (step === 3 && selectedGoal) {
    const cfg = GOAL_CONFIGS[selectedGoal];
    const slider = document.getElementById('kcal-slider');
    slider.value = cfg.calorieTarget;
    updateSlider(cfg.calorieTarget);
  }
}

function selectGoal(goal) {
  selectedGoal = goal;
  document.querySelectorAll('.goal-card').forEach(c => {
    c.classList.toggle('selected', c.dataset.goal === goal);
  });
  document.getElementById('ob-btn-2').disabled = false;
}

function updateSlider(val) {
  document.getElementById('kcal-display').textContent = val;
}

function finishOnboarding() {
  const goal = selectedGoal || 'balanced';
  const cfg = GOAL_CONFIGS[goal];
  const calorieTarget = parseInt(document.getElementById('kcal-slider').value);
  state.profile = {
    goal,
    calorieTarget,
    protein: cfg.protein,
    carbs: cfg.carbs,
    fat: cfg.fat
  };
  saveState();
  document.getElementById('onboarding').classList.add('hidden');
  showMainApp();
  navigate('home');
}

// ===================== APP INIT =====================
function init() {
  loadState();
  if (!state.profile) {
    // Show onboarding (it's already visible by default)
  } else {
    document.getElementById('onboarding').classList.add('hidden');
    showMainApp();
    navigate('home');
  }
}

function showMainApp() {
  document.getElementById('bottom-nav').classList.add('visible');
  setGreeting();
  setDate();
}

function setGreeting() {
  const h = new Date().getHours();
  let g = 'Good evening!';
  if (h < 12) g = 'Good morning!';
  else if (h < 17) g = 'Good afternoon!';
  document.getElementById('greeting').textContent = g;
}

function setDate() {
  const d = new Date();
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  document.getElementById('today-date').textContent =
    `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
}

// ===================== NAVIGATION =====================
function navigate(screen) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screen).classList.add('active');

  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navEl = document.getElementById('nav-' + screen);
  if (navEl) navEl.classList.add('active');

  if (screen === 'home') renderDashboard();
  if (screen === 'log') renderLogScreen();
  if (screen === 'reports') renderReports();
}

// ===================== DASHBOARD =====================
function renderDashboard() {
  if (!state.profile) return;

  const logs = todayLogs();
  const totals = calcTotals(logs);
  const goal = state.profile.calorieTarget;
  const pct = Math.min(totals.cal / goal, 1);

  // Ring progress
  const circumference = 282.7;
  const offset = circumference * (1 - pct);
  const ringEl = document.getElementById('ring-progress');
  ringEl.style.strokeDashoffset = offset;

  let ringColor = '#FF6B35';
  if (totals.cal > goal) ringColor = '#FF3B30';
  else if (pct >= 0.9) ringColor = '#34C759';
  ringEl.style.stroke = ringColor;

  document.getElementById('ring-eaten').textContent = Math.round(totals.cal);
  document.getElementById('stat-goal').textContent = goal;
  document.getElementById('stat-eaten').textContent = Math.round(totals.cal);

  const remaining = goal - Math.round(totals.cal);
  const remEl = document.getElementById('stat-remaining');
  remEl.textContent = Math.abs(remaining);
  remEl.classList.toggle('negative', remaining < 0);

  // Status badge
  const badge = document.getElementById('status-badge');
  badge.className = 'status-badge';
  if (logs.length === 0) {
    badge.textContent = '📝 No meals logged yet';
    badge.classList.add('badge-gray');
  } else if (totals.cal > goal) {
    badge.textContent = '⚠️ Over your goal';
    badge.classList.add('badge-red');
  } else if (pct >= 0.9) {
    badge.textContent = '✓ On track!';
    badge.classList.add('badge-green');
  } else {
    badge.textContent = '👍 Keep eating!';
    badge.classList.add('badge-yellow');
  }

  // Macros
  const p = state.profile;
  document.getElementById('macro-protein-val').textContent = `${Math.round(totals.protein)} / ${p.protein}g`;
  document.getElementById('macro-carbs-val').textContent = `${Math.round(totals.carbs)} / ${p.carbs}g`;
  document.getElementById('macro-fat-val').textContent = `${Math.round(totals.fat)} / ${p.fat}g`;

  document.getElementById('macro-protein-bar').style.width = Math.min(totals.protein / p.protein * 100, 100) + '%';
  document.getElementById('macro-carbs-bar').style.width = Math.min(totals.carbs / p.carbs * 100, 100) + '%';
  document.getElementById('macro-fat-bar').style.width = Math.min(totals.fat / p.fat * 100, 100) + '%';

  // Meals list
  renderMealsList(logs);

  // Tip
  renderTip();
}

function calcTotals(logs) {
  return logs.reduce((acc, l) => {
    acc.cal += l.cal;
    acc.protein += l.protein;
    acc.carbs += l.carbs;
    acc.fat += l.fat;
    return acc;
  }, { cal: 0, protein: 0, carbs: 0, fat: 0 });
}

function renderMealsList(logs) {
  const container = document.getElementById('meals-list');
  if (logs.length === 0) {
    container.innerHTML = `<div class="empty-meals">
      <div class="empty-icon">🍽️</div>
      <div class="empty-text">No meals logged yet.<br>Tap + to add food!</div>
    </div>`;
    return;
  }

  const groups = { breakfast: [], lunch: [], dinner: [], snack: [] };
  logs.forEach((l, i) => {
    if (groups[l.mealType] !== undefined) groups[l.mealType].push({ ...l, idx: i });
  });

  let html = '';
  ['breakfast','lunch','dinner','snack'].forEach(type => {
    if (groups[type].length === 0) return;
    const mt = MEAL_TYPES[type];
    html += `<div class="meal-group">
      <div class="meal-group-header">
        <span class="meal-group-emoji">${mt.emoji}</span>
        <span class="meal-group-name">${mt.label}</span>
      </div>`;
    groups[type].forEach(l => {
      const portionLabel = l.portion.charAt(0).toUpperCase() + l.portion.slice(1);
      html += `<div class="meal-item">
        <span class="meal-emoji">${l.emoji}</span>
        <div class="meal-info">
          <div class="meal-name">${l.name}</div>
          <div class="meal-portion">${portionLabel} • ${Math.round(l.protein)}g protein</div>
        </div>
        <span class="meal-cal">${Math.round(l.cal)} kcal</span>
        <button class="meal-delete" onclick="deleteMeal(${l.idx})" aria-label="Delete">&#x2715;</button>
      </div>`;
    });
    html += `</div>`;
  });
  container.innerHTML = html;
}

function renderTip() {
  if (!state.profile) return;
  const cfg = GOAL_CONFIGS[state.profile.goal];
  const idx = new Date().getDate() % cfg.tips.length;
  document.getElementById('tip-text').textContent = cfg.tips[idx];
}

function deleteMeal(idx) {
  const key = todayKey();
  if (!state.logs[key]) return;
  state.logs[key].splice(idx, 1);
  saveState();
  renderDashboard();
  showToast('Meal removed');
}

// ===================== LOG SCREEN =====================
function getAutoMealType() {
  const h = new Date().getHours();
  if (h < 10) return 'breakfast';
  if (h < 15) return 'lunch';
  if (h < 18) return 'snack';
  return 'dinner';
}

function renderLogScreen() {
  const auto = getAutoMealType();
  currentMealTab = auto;
  document.querySelectorAll('.meal-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.meal === auto);
  });
  document.getElementById('suggested-title').textContent = `Suggested for ${MEAL_TYPES[auto].label}`;
  renderSuggested();
  renderRecent();

  // Reset search
  const inp = document.getElementById('search-input');
  inp.value = '';
  document.getElementById('search-clear').classList.remove('visible');
  document.getElementById('search-results-section').style.display = 'none';
  document.getElementById('default-sections').style.display = 'block';
}

function selectMealTab(meal) {
  currentMealTab = meal;
  document.querySelectorAll('.meal-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.meal === meal);
  });
  document.getElementById('suggested-title').textContent = `Suggested for ${MEAL_TYPES[meal].label}`;
  renderSuggested();
  renderRecent();
  // If modal is open, update its button
  if (modalFood) {
    document.getElementById('add-meal-btn').textContent = `Add to ${MEAL_TYPES[meal].label}`;
  }
}

function renderSuggested() {
  const ids = MEAL_SUGGESTIONS[currentMealTab] || [];
  const foods = ids.map(id => FOODS.find(f => f.id === id)).filter(Boolean);
  document.getElementById('suggested-list').innerHTML = foods.map(f => foodItemHTML(f)).join('');
}

function renderRecent() {
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - 7);
  const cutoffKey = cutoff.toISOString().split('T')[0];

  const seen = new Set();
  const recent = [];
  const keys = Object.keys(state.logs).filter(k => k >= cutoffKey).sort().reverse();

  outer:
  for (const key of keys) {
    const dayLogs = (state.logs[key] || []).slice().reverse();
    for (const l of dayLogs) {
      if (!seen.has(l.foodId)) {
        seen.add(l.foodId);
        const food = FOODS.find(f => f.id === l.foodId);
        if (food) { recent.push(food); }
        if (recent.length >= 5) break outer;
      }
    }
  }

  const section = document.getElementById('recent-section');
  if (recent.length === 0) { section.style.display = 'none'; return; }
  section.style.display = 'block';
  document.getElementById('recent-list').innerHTML = recent.map(f => foodItemHTML(f)).join('');
}

function foodItemHTML(food) {
  const safeId = food.id.replace(/'/g, "\\'");
  return `<div class="food-item" onclick="openModal('${safeId}')">
    <span class="food-emoji">${food.emoji}</span>
    <div class="food-info">
      <div class="food-name">${food.name}</div>
      <div class="food-meta">${food.cal} kcal &bull; ${food.protein}g protein</div>
    </div>
    <button class="food-add-btn" onclick="event.stopPropagation();openModal('${safeId}')" aria-label="Add">+</button>
  </div>`;
}

function handleSearch(val) {
  const clearBtn = document.getElementById('search-clear');
  clearBtn.classList.toggle('visible', val.length > 0);

  if (!val.trim()) {
    document.getElementById('search-results-section').style.display = 'none';
    document.getElementById('default-sections').style.display = 'block';
    return;
  }

  document.getElementById('search-results-section').style.display = 'block';
  document.getElementById('default-sections').style.display = 'none';

  const q = val.toLowerCase();
  const results = FOODS.filter(f =>
    f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q)
  );

  const list = document.getElementById('search-results-list');
  if (results.length === 0) {
    list.innerHTML = `<div class="no-results">No foods found for "${val}"</div>`;
    document.getElementById('search-results-title').textContent = 'Results';
  } else {
    document.getElementById('search-results-title').textContent = `Results (${results.length})`;
    list.innerHTML = results.map(f => foodItemHTML(f)).join('');
  }
}

function clearSearch() {
  document.getElementById('search-input').value = '';
  document.getElementById('search-clear').classList.remove('visible');
  document.getElementById('search-results-section').style.display = 'none';
  document.getElementById('default-sections').style.display = 'block';
}

// ===================== MODAL =====================
function openModal(foodId) {
  modalFood = FOODS.find(f => f.id === foodId);
  if (!modalFood) return;
  modalPortion = 'medium';

  document.getElementById('modal-emoji').textContent = modalFood.emoji;
  document.getElementById('modal-food-name').textContent = modalFood.name;
  document.getElementById('modal-food-category').textContent = modalFood.category;

  updatePortionUI();
  document.getElementById('add-meal-btn').textContent = `Add to ${MEAL_TYPES[currentMealTab].label}`;

  document.getElementById('modal-overlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  modalFood = null;
}

function handleOverlayClick(e) {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
}

function selectPortion(size) {
  modalPortion = size;
  updatePortionUI();
}

function updatePortionUI() {
  if (!modalFood) return;
  ['small','medium','large'].forEach(s => {
    document.getElementById('portion-' + s).classList.toggle('active', s === modalPortion);
    const mult = PORTION_MULTIPLIERS[s];
    document.getElementById(s + '-kcal').textContent = Math.round(modalFood.cal * mult) + ' kcal';
  });

  const mult = PORTION_MULTIPLIERS[modalPortion];
  document.getElementById('nutri-protein').textContent = Math.round(modalFood.protein * mult) + 'g';
  document.getElementById('nutri-carbs').textContent = Math.round(modalFood.carbs * mult) + 'g';
  document.getElementById('nutri-fat').textContent = Math.round(modalFood.fat * mult) + 'g';
}

function confirmAddMeal() {
  if (!modalFood) return;
  const mult = PORTION_MULTIPLIERS[modalPortion];
  const entry = {
    foodId: modalFood.id,
    name: modalFood.name,
    emoji: modalFood.emoji,
    mealType: currentMealTab,
    portion: modalPortion,
    cal: Math.round(modalFood.cal * mult),
    protein: Math.round(modalFood.protein * mult),
    carbs: Math.round(modalFood.carbs * mult),
    fat: Math.round(modalFood.fat * mult),
    timestamp: Date.now()
  };

  const key = todayKey();
  if (!state.logs[key]) state.logs[key] = [];
  state.logs[key].push(entry);
  saveState();

  const addedName = modalFood.name;
  const addedEmoji = modalFood.emoji;
  closeModal();
  showToast(`${addedEmoji} ${addedName} added!`);
  setTimeout(() => navigate('home'), 280);
}

// ===================== REPORTS =====================
function renderReports() {
  if (!state.profile) return;

  const goal = state.profile.calorieTarget;

  // Build 7 days array (oldest first)
  const days7 = [];
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const logs = state.logs[key] || [];
    const totals = calcTotals(logs);
    days7.push({ key, date: d, label: dayNames[d.getDay()], totals, hasData: logs.length > 0 });
  }

  // Streak: count consecutive days from today backwards with at least 1 log
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    if ((state.logs[key] || []).length > 0) streak++;
    else break;
  }
  document.getElementById('streak-val').textContent = streak + ' 🔥';

  // Avg calories (only days with data)
  const daysWithData = days7.filter(d => d.hasData);
  const avgCal = daysWithData.length > 0
    ? Math.round(daysWithData.reduce((s, d) => s + d.totals.cal, 0) / daysWithData.length)
    : 0;
  document.getElementById('avg-cal-val').textContent = avgCal;

  // Bar chart
  const maxCal = Math.max(...days7.map(d => d.totals.cal), goal, 1);
  const maxBarHeight = 90;
  const today = todayKey();

  let barsHTML = '';
  days7.forEach(d => {
    let barHeight = 3;
    if (d.hasData) {
      barHeight = Math.max(Math.round((d.totals.cal / maxCal) * maxBarHeight), 3);
    }

    let barColor = '#E5E5EA';
    if (d.hasData) {
      const pct = d.totals.cal / goal;
      if (pct > 1.0) barColor = '#FF3B30';
      else if (pct >= 0.9) barColor = '#34C759';
      else barColor = '#FF9500';
    }

    const valText = d.hasData
      ? (d.totals.cal >= 1000 ? (Math.round(d.totals.cal / 100) / 10) + 'k' : String(Math.round(d.totals.cal)))
      : '';

    const isToday = d.key === today;
    barsHTML += `<div class="chart-bar-wrap">
      <div class="chart-bar-val">${valText}</div>
      <div class="chart-bar" style="height:${barHeight}px;background:${barColor}"></div>
      <div class="chart-bar-day" style="font-weight:${isToday ? 700 : 400};color:${isToday ? 'var(--primary)' : 'var(--text-secondary)'}">${d.label}</div>
    </div>`;
  });
  document.getElementById('chart-bars').innerHTML = barsHTML;

  // Avg macros
  const avgProtein = daysWithData.length > 0
    ? Math.round(daysWithData.reduce((s, d) => s + d.totals.protein, 0) / daysWithData.length) : 0;
  const avgCarbs = daysWithData.length > 0
    ? Math.round(daysWithData.reduce((s, d) => s + d.totals.carbs, 0) / daysWithData.length) : 0;
  const avgFat = daysWithData.length > 0
    ? Math.round(daysWithData.reduce((s, d) => s + d.totals.fat, 0) / daysWithData.length) : 0;

  document.getElementById('avg-protein').textContent = avgProtein + 'g';
  document.getElementById('avg-carbs').textContent = avgCarbs + 'g';
  document.getElementById('avg-fat').textContent = avgFat + 'g';

  // Insights
  const cfg = GOAL_CONFIGS[state.profile.goal];
  document.getElementById('insights-list').innerHTML = cfg.insights.map(i =>
    `<div class="insight-item"><span class="insight-bullet">&bull;</span><span class="insight-text">${i}</span></div>`
  ).join('');
}

// ===================== TOAST =====================
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2500);
}

// ===================== RESET =====================
function resetApp() {
  if (confirm('Reset all data? This cannot be undone.')) {
    localStorage.removeItem('nutrieasy_state');
    location.reload();
  }
}

// ===================== BOOT =====================
init();
