/* =============================================
   HEALTH PROFILE MODULE
   Manages chronic condition input and
   exposes buildHealthContext() for prompts.
   ============================================= */

const CONDITIONS = [
  { id: 'diabetes',     label: 'Type 2 Diabetes' },
  { id: 'hypertension', label: 'Hypertension' },
  { id: 'heart',        label: 'Heart Disease' },
  { id: 'cholesterol',  label: 'High Cholesterol' },
  { id: 'kidney',       label: 'Kidney Disease' },
  { id: 'osteoporosis', label: 'Osteoporosis' },
];

const HEALTH_STORAGE_KEY = 'nutrition_health_profile';

/* --- Storage --- */

function loadHealthProfile() {
  try {
    return JSON.parse(localStorage.getItem(HEALTH_STORAGE_KEY)) || { conditions: [], notes: '' };
  } catch {
    return { conditions: [], notes: '' };
  }
}

function saveHealthProfile(profile) {
  localStorage.setItem(HEALTH_STORAGE_KEY, JSON.stringify(profile));
}

/* --- Public: build context string for API prompts --- */

function buildHealthContext() {
  const profile = loadHealthProfile();
  const parts   = [];

  if (profile.conditions.length > 0) {
    const names = profile.conditions.map(id => {
      const c = CONDITIONS.find(x => x.id === id);
      return c ? c.label : id;
    });
    parts.push('The user has the following chronic conditions: ' + names.join(', ') + '.');
  }

  if (profile.notes && profile.notes.trim()) {
    parts.push('Additional health notes: ' + profile.notes.trim());
  }

  return parts.join(' ');
}

/* --- UI Init --- */

function initHealthUI() {
  const grid     = document.getElementById('conditionsGrid');
  const notes    = document.getElementById('healthNotes');
  const saveBtn  = document.getElementById('healthSaveBtn');
  const noteEl   = document.getElementById('healthNote');

  const profile = loadHealthProfile();

  // Render checkboxes
  grid.innerHTML = '';
  CONDITIONS.forEach(c => {
    const label = document.createElement('label');
    label.className = 'condition-item';

    const cb = document.createElement('input');
    cb.type    = 'checkbox';
    cb.id      = 'cond-' + c.id;
    cb.value   = c.id;
    cb.checked = profile.conditions.includes(c.id);

    label.appendChild(cb);
    label.appendChild(document.createTextNode('\u00a0' + c.label));
    grid.appendChild(label);
  });

  notes.value = profile.notes || '';

  // Show current state
  if (profile.conditions.length > 0 || profile.notes) {
    noteEl.textContent = 'Profile saved.';
    noteEl.className   = 'field-note saved';
  }

  saveBtn.addEventListener('click', () => {
    const conditions = CONDITIONS
      .filter(c => document.getElementById('cond-' + c.id).checked)
      .map(c => c.id);

    saveHealthProfile({ conditions, notes: notes.value.trim() });
    noteEl.textContent = 'Profile saved.';
    noteEl.className   = 'field-note saved';
  });
}
