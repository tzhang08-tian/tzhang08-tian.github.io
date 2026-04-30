/* =============================================
   MEAL HISTORY MODULE
   Handles:
   - Meal storage (localStorage)
   - Calendar rendering
   - Day detail view
   - Report generation via Claude API
   ============================================= */

const HISTORY_STORAGE_KEY = 'nutrition_meal_history';

/* =============================================
   STORAGE
   ============================================= */

function getAllMeals() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveMeal(meal) {
  const meals = getAllMeals();
  meals.push(meal);
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(meals));
}

function getMealsForDate(dateStr) {
  return getAllMeals().filter(m => m.timestamp.startsWith(dateStr));
}

function getMealsInRange(startStr, endStr) {
  const start = new Date(startStr + 'T00:00:00');
  const end   = new Date(endStr   + 'T23:59:59');
  return getAllMeals().filter(m => {
    const d = new Date(m.timestamp);
    return d >= start && d <= end;
  });
}

/* =============================================
   HELPERS (also used by app.js)
   ============================================= */

function getMealType() {
  const h = new Date().getHours();
  if (h >= 5  && h < 10) return 'Breakfast';
  if (h >= 10 && h < 12) return 'Morning Snack';
  if (h >= 12 && h < 14) return 'Lunch';
  if (h >= 14 && h < 17) return 'Afternoon Snack';
  if (h >= 17 && h < 21) return 'Dinner';
  return 'Evening Snack';
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

/* =============================================
   CALENDAR
   ============================================= */

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];
const DAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

let calYear       = new Date().getFullYear();
let calMonth      = new Date().getMonth();
let calSelected   = null;

function renderCalendar() {
  const grid  = document.getElementById('calendarGrid');
  const label = document.getElementById('calMonthLabel');

  label.textContent = MONTH_NAMES[calMonth] + ' ' + calYear;

  // Which days this month have meals?
  const monthPrefix = calYear + '-' + String(calMonth + 1).padStart(2, '0');
  const daysWithMeals = new Set(
    getAllMeals()
      .filter(m => m.timestamp.startsWith(monthPrefix))
      .map(m => m.timestamp.slice(0, 10))
  );

  const todayStr = new Date().toISOString().slice(0, 10);

  grid.innerHTML = '';

  // Day-of-week headers
  DAY_LABELS.forEach(d => {
    const cell = document.createElement('div');
    cell.className   = 'cal-day-header';
    cell.textContent = d;
    grid.appendChild(cell);
  });

  // Empty leading cells
  const firstDow = new Date(calYear, calMonth, 1).getDay();
  for (let i = 0; i < firstDow; i++) {
    const cell = document.createElement('div');
    cell.className = 'cal-cell empty';
    grid.appendChild(cell);
  }

  // Day cells
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = calYear + '-'
      + String(calMonth + 1).padStart(2, '0') + '-'
      + String(d).padStart(2, '0');

    const cell = document.createElement('div');
    cell.className = 'cal-cell';
    if (dateStr === todayStr)  cell.classList.add('today');
    if (dateStr === calSelected) cell.classList.add('selected');

    const num = document.createElement('span');
    num.className   = 'cal-day-num';
    num.textContent = d;
    cell.appendChild(num);

    if (daysWithMeals.has(dateStr)) {
      const dot = document.createElement('span');
      dot.className = 'cal-dot';
      cell.appendChild(dot);
    }

    cell.addEventListener('click', () => selectCalDay(dateStr));
    grid.appendChild(cell);
  }
}

function selectCalDay(dateStr) {
  calSelected = dateStr;
  renderCalendar();
  renderDayDetail(dateStr);
}

function renderDayDetail(dateStr) {
  const section = document.getElementById('dayDetail');
  const title   = document.getElementById('dayDetailTitle');
  const list    = document.getElementById('dayMealsList');

  const meals = getMealsForDate(dateStr);

  // Friendly date string, avoid timezone shift
  const d = new Date(dateStr + 'T12:00:00');
  title.textContent = d.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  });

  list.innerHTML = '';

  if (meals.length === 0) {
    const msg = document.createElement('p');
    msg.className   = 'no-meals';
    msg.textContent = 'No meals recorded for this day.';
    list.appendChild(msg);
  } else {
    meals.forEach(meal => {
      const card = document.createElement('div');
      card.className = 'history-meal-card';

      const time = new Date(meal.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit'
      });

      card.innerHTML = `
        <div class="hm-header">
          <span class="hm-type">${meal.mealType}</span>
          <span class="hm-time">${time}</span>
        </div>
        <p class="hm-desc">${meal.description}</p>
        <p class="hm-tip"><strong>Tip:</strong> ${meal.suggestion}</p>
        <p class="hm-good"><strong>Well done:</strong> ${meal.encouragement}</p>
      `;
      list.appendChild(card);
    });
  }

  section.hidden = false;
  section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* =============================================
   REPORT GENERATION
   ============================================= */

async function generateReport(startStr, endStr, apiKey) {
  const meals = getMealsInRange(startStr, endStr);

  if (meals.length === 0) {
    throw new Error('No meals were recorded in this date range. Please log some meals first.');
  }

  const healthContext = buildHealthContext(); // from health.js

  const mealLog = meals.map(m => {
    const date = new Date(m.timestamp).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric'
    });
    const time = new Date(m.timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit'
    });
    return `• ${date} ${time} (${m.mealType}): ${m.description}`;
  }).join('\n');

  const startLabel = new Date(startStr + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'long', day: 'numeric'
  });
  const endLabel = new Date(endStr + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'long', day: 'numeric'
  });

  const systemPrompt = `You are a warm, encouraging nutrition expert for older adults (ages 65+).
${healthContext ? healthContext + '\n' : ''}
Write a personal dietary report based on the meal log below. Structure it with these four sections — use the exact headings:

Overall Patterns
What They Did Well
Gentle Suggestions
Encouragement

Under each heading write 2–3 sentences. Keep the total under 280 words. Use plain English, no medical jargon. Be warm and supportive. Tailor any suggestions to the user's health conditions if provided.`;

  const userMessage = `Here are my meals from ${startLabel} to ${endLabel}:\n\n${mealLog}\n\nPlease write my dietary report.`;

  const body = {
    model: 'claude-opus-4-6',
    max_tokens: 700,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }]
  };

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type':      'application/json',
      'x-api-key':         apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`API ${res.status}: ${err?.error?.message || JSON.stringify(err)}`);
  }

  const data = await res.json();
  return data?.content?.[0]?.text ?? '';
}

/* =============================================
   REPORT UI
   ============================================= */

function initReportUI(getApiKey) {
  // Default range: last 7 days
  const today   = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(today.getDate() - 6);

  document.getElementById('reportEnd').value   = today.toISOString().slice(0, 10);
  document.getElementById('reportStart').value = weekAgo.toISOString().slice(0, 10);

  document.getElementById('generateReportBtn').addEventListener('click', async () => {
    const startStr = document.getElementById('reportStart').value;
    const endStr   = document.getElementById('reportEnd').value;
    const apiKey   = getApiKey();

    if (!startStr || !endStr) {
      alert('Please select both a start and end date.');
      return;
    }
    if (new Date(startStr) > new Date(endStr)) {
      alert('Start date must be before end date.');
      return;
    }
    if (!apiKey) {
      alert('Please save your API key first.');
      return;
    }

    const loadingEl = document.getElementById('reportLoading');
    const outputEl  = document.getElementById('reportOutput');
    const titleEl   = document.getElementById('reportTitle');
    const bodyEl    = document.getElementById('reportBody');
    const btn       = document.getElementById('generateReportBtn');

    btn.disabled        = true;
    outputEl.hidden     = true;
    loadingEl.hidden    = false;

    try {
      const reportText = await generateReport(startStr, endStr, apiKey);

      const s = new Date(startStr + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const e = new Date(endStr   + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      titleEl.textContent = `Your Report: ${s} – ${e}`;

      // Render sections: headings become styled, body as paragraphs
      const HEADINGS = ['Overall Patterns', 'What They Did Well', 'Gentle Suggestions', 'Encouragement'];
      const lines = reportText.split('\n').filter(l => l.trim());

      bodyEl.innerHTML = lines.map(line => {
        const trimmed = line.trim();
        if (HEADINGS.some(h => trimmed.toLowerCase().startsWith(h.toLowerCase()))) {
          return `<p class="report-heading">${trimmed}</p>`;
        }
        return `<p>${trimmed}</p>`;
      }).join('');

      outputEl.hidden = false;
      outputEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    } catch (err) {
      alert(err.message);
    } finally {
      loadingEl.hidden = true;
      btn.disabled     = false;
    }
  });
}

/* =============================================
   CALENDAR CONTROLS INIT
   ============================================= */

function initCalendar() {
  document.getElementById('calPrev').addEventListener('click', () => {
    calMonth--;
    if (calMonth < 0) { calMonth = 11; calYear--; }
    renderCalendar();
  });

  document.getElementById('calNext').addEventListener('click', () => {
    calMonth++;
    if (calMonth > 11) { calMonth = 0; calYear++; }
    renderCalendar();
  });

  renderCalendar();
}

/* =============================================
   ENTRY POINT
   ============================================= */

function initHistoryUI(getApiKey) {
  initCalendar();
  initReportUI(getApiKey);
}
