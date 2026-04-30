/* =============================================
   APP.JS — Main Coordinator
   Depends on: health.js, history.js (loaded first)
   ============================================= */

/* =============================================
   SYSTEM PROMPT (single meal analysis)
   Injects health profile from health.js
   ============================================= */

function buildAnalysisPrompt() {
  const health = buildHealthContext(); // health.js

  return `You are a friendly and caring nutrition assistant helping older adults (ages 65+) manage their diet.
${health ? '\n' + health + '\n' : ''}
When a user sends you a photo of their meal or supplements, respond in valid JSON with exactly this shape:
{
  "isFood": true,
  "description": "<1 sentence describing what you see>",
  "suggestion": "<ONE specific, actionable tip for today or tomorrow — tailor it to any health conditions listed above>",
  "encouragement": "<ONE thing they did well in this meal>"
}

If the photo is NOT food (selfie, landscape, etc.), respond with:
{
  "isFood": false,
  "message": "<a warm, kind request to take a photo of their meal or supplements instead>"
}

Rules:
- Simple, plain English. No medical jargon.
- Each field under 40 words.
- Never say "consult your doctor". Warm and conversational.
- Always encouraging, never critical.
- Output ONLY the JSON object — no markdown, no extra text.`;
}

/* =============================================
   DOM REFERENCES
   ============================================= */
const apiKeyInput       = document.getElementById('apiKeyInput');
const apiSaveBtn        = document.getElementById('apiSaveBtn');
const apiNote           = document.getElementById('apiNote');

const photoInput        = document.getElementById('photoInput');
const uploadLabel       = document.getElementById('uploadLabel');
const previewWrapper    = document.getElementById('previewWrapper');
const previewImage      = document.getElementById('previewImage');
const changePhotoBtn    = document.getElementById('changePhotoBtn');
const analyseBtn        = document.getElementById('analyseBtn');

const loading           = document.getElementById('loading');

const resultCard        = document.getElementById('resultCard');
const descriptionText   = document.getElementById('descriptionText');
const suggestionText    = document.getElementById('suggestionText');
const encouragementText = document.getElementById('encouragementText');
const savedNote         = document.getElementById('savedNote');
const newPhotoBtn       = document.getElementById('newPhotoBtn');

const errorBanner       = document.getElementById('errorBanner');
const errorText         = document.getElementById('errorText');

/* =============================================
   STATE
   ============================================= */
let selectedImageBase64 = null;
let selectedMimeType    = null;

/* =============================================
   UI HELPERS
   ============================================= */
function show(el) { el.hidden = false; }
function hide(el) { el.hidden = true; }

function resetUI() {
  hide(loading);
  hide(resultCard);
  hide(errorBanner);
}

function showError(msg) {
  resetUI();
  errorText.textContent = msg;
  show(errorBanner);
}

/* =============================================
   API KEY
   ============================================= */
const API_KEY_STORAGE = 'nutrition_helper_api_key';

function loadApiKey() {
  const saved = localStorage.getItem(API_KEY_STORAGE) || '';
  if (saved) {
    apiKeyInput.value = saved;
    setApiNote('Using: ' + saved.slice(0, 18) + '…', true);
  }
}

function setApiNote(msg, isSaved = false) {
  apiNote.textContent = msg;
  apiNote.className   = 'field-note' + (isSaved ? ' saved' : '');
}

function getApiKey() {
  return (apiKeyInput.value.trim() || localStorage.getItem(API_KEY_STORAGE) || '').trim();
}

apiSaveBtn.addEventListener('click', () => {
  const key = apiKeyInput.value.trim();
  if (!key) { setApiNote('Please enter your API key.'); return; }
  localStorage.setItem(API_KEY_STORAGE, key);
  setApiNote('Using: ' + key.slice(0, 18) + '…', true);
});

/* =============================================
   PHOTO SELECTION
   ============================================= */
photoInput.addEventListener('change', handlePhotoSelected);
changePhotoBtn.addEventListener('click', () => photoInput.click());

function handlePhotoSelected(e) {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    showError('Please choose an image file.');
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    showError('Photo is too large. Please choose one under 10 MB.');
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    const dataUrl   = event.target.result;
    const [hdr, b64] = dataUrl.split(',');
    selectedMimeType    = hdr.match(/:(.*?);/)[1];
    selectedImageBase64 = b64;

    previewImage.src = dataUrl;
    hide(uploadLabel);
    show(previewWrapper);
    show(analyseBtn);
    resetUI();
  };
  reader.readAsDataURL(file);
}

/* =============================================
   ANALYSE
   ============================================= */
analyseBtn.addEventListener('click', analysePhoto);

async function analysePhoto() {
  if (!selectedImageBase64) return;

  const apiKey = getApiKey();
  if (!apiKey) {
    showError('Please enter and save your Anthropic API key above first.');
    return;
  }

  hide(analyseBtn);
  resetUI();
  show(loading);

  try {
    const result = await callClaudeVision(selectedImageBase64, selectedMimeType, apiKey);
    displayResult(result);
  } catch (err) {
    showError(err.message || 'Something went wrong — please try again.');
    console.error(err);
  } finally {
    hide(loading);
    show(analyseBtn);
  }
}

/* =============================================
   CLAUDE API — VISION
   ============================================= */
async function callClaudeVision(base64Image, mimeType, apiKey) {
  const body = {
    model: 'claude-opus-4-6',
    max_tokens: 512,
    system: buildAnalysisPrompt(),
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: { type: 'base64', media_type: mimeType, data: base64Image }
        },
        {
          type: 'text',
          text: 'Here is a photo of my meal. Please analyse it.'
        }
      ]
    }]
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
  return JSON.parse(data?.content?.[0]?.text ?? '{}');
}

/* =============================================
   DISPLAY RESULT & AUTO-SAVE TO HISTORY
   ============================================= */
function displayResult(parsed) {
  resetUI();

  if (!parsed.isFood) {
    showError(parsed.message || 'Please take a photo of your meal or supplements.');
    return;
  }

  descriptionText.textContent   = parsed.description   || '';
  suggestionText.textContent    = parsed.suggestion    || '';
  encouragementText.textContent = parsed.encouragement || '';

  // Auto-save to history (history.js)
  const meal = {
    id:           generateId(),
    timestamp:    new Date().toISOString(),
    mealType:     getMealType(),
    description:  parsed.description   || '',
    suggestion:   parsed.suggestion    || '',
    encouragement: parsed.encouragement || ''
  };
  saveMeal(meal);

  const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  savedNote.textContent = 'Saved as ' + meal.mealType + ' at ' + timeStr;

  show(resultCard);
}

/* =============================================
   NEW PHOTO
   ============================================= */
newPhotoBtn.addEventListener('click', resetToUpload);

function resetToUpload() {
  selectedImageBase64 = null;
  selectedMimeType    = null;
  photoInput.value    = '';
  hide(previewWrapper);
  hide(analyseBtn);
  hide(resultCard);
  hide(errorBanner);
  show(uploadLabel);
}

/* =============================================
   TAB NAVIGATION
   ============================================= */
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const tab = btn.dataset.tab;
    document.getElementById('tab-analysis').hidden = (tab !== 'analysis');
    document.getElementById('tab-history').hidden  = (tab !== 'history');

    // Refresh calendar when switching to history
    if (tab === 'history') renderCalendar();
  });
});

/* =============================================
   INIT
   ============================================= */
loadApiKey();
initHealthUI();          // health.js
initHistoryUI(getApiKey); // history.js
