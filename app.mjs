import { CONFIG, CHAPTERS, QUESTIONS, birthdayCountdown, createExpedition } from './quest.mjs';

const $ = id => document.getElementById(id);
const preview = new URLSearchParams(location.search).has('preview');
const game = createExpedition();
let screen = 'home';
let oath = 'coragem';
let lastQuestionRender = '';
let lastTickSound = -1;
const pauseDialog = $('pause-dialog');
const icon = (name, className = '') => `<svg aria-hidden="true" class="${className}"><use href="#i-${name}"/></svg>`;
const oathMessages = {
  coragem: 'Você levou coragem. Mesmo com medo, escolheu continuar. Que essa chama te acompanhe em cada novo capítulo.',
  lealdade: 'Você levou lealdade. Os vínculos que escolhemos tornam a travessia mais bonita. Que nunca te falte companhia para voar.',
  liberdade: 'Você levou liberdade. Nenhuma página pode conter todos os caminhos que existem em você. Que o céu seja sempre um começo.'
};

function announce(message) { $('announcement').textContent = message; }
function showScreen(name) {
  if (screen === name) return;
  for (const section of document.querySelectorAll('main > .screen')) section.hidden = section.id !== `screen-${name}`;
  screen = name;
  document.body.dataset.scene = name;
  window.scrollTo({ top: 0, behavior: 'instant' });
  const heading = $(`screen-${name}`).querySelector('h1');
  if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
}

function updateGate() {
  const state = birthdayCountdown();
  const open = state.open || preview;
  ['days', 'hours', 'minutes', 'seconds'].forEach((id, i) => { $(id).textContent = String(state.units[i]).padStart(2, '0'); });
  $('enter').disabled = !open;
  $('preview-badge').hidden = !preview;
  $('enter-label').textContent = open ? 'Aceitar a convocação' : 'Aguardando a convocação';
  $('enter-icon').innerHTML = `<use href="#i-${open ? 'arrow' : 'lock'}"/>`;
  $('gate-label').textContent = state.open ? 'OS PORTÕES SE ABRIRAM. ESTE DIA É SEU.' : 'OS PORTÕES DE BASGIATH SE ABREM EM';
  $('gate-note').textContent = preview && !state.open
    ? 'Modo prévia · A surpresa continua marcada para 17 de outubro.'
    : state.open ? 'Feliz aniversário. Há uma jornada esperando por você.' : '17 de outubro, à meia-noite · Horário de São Paulo';
}

function startJourney() {
  if (!preview && !birthdayCountdown().open) { returnHome(); return; }
  game.start(); lastQuestionRender = ''; lastTickSound = -1;
  render();
  playTone('start');
}

function returnHome() {
  game.pause();
  if (pauseDialog.open) pauseDialog.close();
  showScreen('home');
  document.body.dataset.chapter = '';
  updateGate();
}

function render() {
  const state = game.state;
  const chapterIndex = Math.min(2, Math.floor(state.questionIndex / 2));
  const chapter = CHAPTERS[chapterIndex];
  document.body.dataset.chapter = chapterIndex;
  if (state.status === 'briefing') {
    $('intro-roman').textContent = chapter.number;
    $('intro-location').textContent = chapter.location.toUpperCase();
    $('intro-book').textContent = `CAPÍTULO ${chapter.number} · ${chapter.book.toUpperCase()}`;
    $('intro-title').textContent = chapter.title;
    $('intro-lead').textContent = chapter.lead;
    $('intro-story').textContent = chapter.story;
    $('intro-lives').textContent = `${state.lives} ${state.lives === 1 ? 'chama' : 'chamas'}`;
    $('oath-picker').hidden = chapterIndex !== 0;
    $('begin-chapter').innerHTML = `${['Cruzar o parapeito', 'Seguir através do fogo', 'Enfrentar a tempestade'][chapterIndex]} ${icon('arrow')}`;
    showScreen('briefing');
    $('intro-title').focus({ preventScroll: true });
    return;
  }
  if (state.status === 'fallen') {
    showScreen('fallen'); playTone('fallen');
    return;
  }
  if (state.status === 'won') {
    $('oath-message').textContent = oathMessages[oath];
    $('result-correct').textContent = state.correct;
    $('result-lives').textContent = state.lives;
    showScreen('bond'); playTone('won');
    return;
  }
  if (state.status !== 'playing' && state.status !== 'feedback') return;
  const key = [state.questionIndex, state.status, state.result, state.selected, state.lives].join('|');
  if (key !== lastQuestionRender) {
    lastQuestionRender = key;
    drawQuestion(state, chapterIndex);
  }
  showScreen('quiz');
  updateClock();
}

function drawQuestion(state, chapterIndex) {
  const question = QUESTIONS[state.questionIndex];
  $('question-book').textContent = question.book.toUpperCase();
  $('question-number').textContent = String(state.questionIndex + 1).padStart(2, '0');
  $('question-title').textContent = question.prompt;
  for (const item of $('route').children) {
    const index = +item.dataset.chapter;
    item.classList.toggle('active', index === chapterIndex);
    item.classList.toggle('complete', index < chapterIndex);
    if (index === chapterIndex) item.setAttribute('aria-current', 'step');
    else item.removeAttribute('aria-current');
  }
  $('answers').replaceChildren();
  question.choices.forEach((choice, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'answer';
    button.disabled = state.status !== 'playing';
    const letter = document.createElement('span');
    letter.className = 'answer-key'; letter.textContent = 'ABCD'[index]; letter.setAttribute('aria-hidden', 'true');
    const text = document.createElement('span'); text.textContent = choice;
    button.append(letter, text);
    if (state.status === 'feedback') {
      if (index === question.correct) { button.classList.add('correct'); letter.textContent = '✓'; }
      else if (state.selected === index) { button.classList.add('wrong'); letter.textContent = '×'; }
    }
    button.addEventListener('click', () => submitAnswer(index));
    $('answers').append(button);
  });
  $('lives').innerHTML = [0, 1, 2].map(i => icon('flame', i >= state.lives ? 'lost' : '')).join('') + `<span>${state.lives} / ${CONFIG.lives} chamas</span>`;
  $('lives').setAttribute('aria-label', `${state.lives} ${state.lives === 1 ? 'chama restante' : 'chamas restantes'}`);
  $('feedback').hidden = state.status !== 'feedback';
  $('skip').hidden = state.status !== 'playing';
  $('next-question').hidden = state.status !== 'feedback';
  $('pause').hidden = state.status !== 'playing';
  $('question-note').hidden = state.status !== 'playing';
  if (state.status === 'feedback') {
    const headings = { correct: 'A chama continua acesa.', wrong: 'Um tropeço não encerra a jornada.', timeout: 'O vento foi mais rápido desta vez.', skip: 'Passagem concedida. Uma chama ficou pelo caminho.' };
    $('feedback').dataset.result = state.result;
    $('feedback-title').textContent = headings[state.result];
    $('feedback-text').textContent = question.explanation + ((state.result === 'wrong' || state.result === 'timeout') ? ' Você perdeu uma chama. Respire e tente de novo.' : '');
    $('feedback-icon').innerHTML = `<use href="#i-${state.result === 'correct' ? 'check' : 'flame'}"/>`;
    const retry = state.result === 'wrong' || state.result === 'timeout';
    const text = retry ? 'Tentar de novo' : state.questionIndex === QUESTIONS.length - 1 ? 'Concluir meu voo' : 'Continuar';
    $('next-question').innerHTML = `${text} ${icon('arrow')}`;
    playTone(state.result === 'correct' ? 'correct' : 'wrong');
    // Move focus from a disabled answer to the next available action.
    queueMicrotask(() => { if (screen === 'quiz') $('next-question').focus({ preventScroll: true }); });
  } else {
    lastTickSound = -1;
    queueMicrotask(() => { if (screen === 'quiz') $('question-title').focus({ preventScroll: true }); });
  }
}

function submitAnswer(index) { game.answer(index); render(); }
function updateClock() {
  const { remaining, status, paused } = game.state;
  $('time').textContent = remaining;
  $('question-timer').setAttribute('aria-label', `${remaining} segundos restantes${paused ? ', pausado' : ''}`);
  $('question-timer').classList.toggle('urgent', remaining <= 5 && status === 'playing');
  $('timer-ring').style.strokeDashoffset = 219.912 * (1 - remaining / CONFIG.questionSeconds);
  if (remaining <= 5 && status === 'playing' && !paused && lastTickSound !== remaining) {
    lastTickSound = remaining;
    playTone('tick');
    if (remaining === 5) announce('Restam cinco segundos.');
  }
}

function pauseGame() {
  game.pause(); render();
  if (game.state.paused && !pauseDialog.open) pauseDialog.showModal();
  updateClock();
}
function resumeGame() {
  game.resume();
  if (pauseDialog.open) pauseDialog.close();
  render();
  $('answers').querySelector('button:not(:disabled)')?.focus({ preventScroll: true });
}

$('enter').addEventListener('click', startJourney);
$('brand-home').addEventListener('click', () => screen === 'quiz' && game.state.status === 'playing' ? pauseGame() : returnHome());
$('begin-chapter').addEventListener('click', () => { game.begin(); render(); });
$('skip').addEventListener('click', () => { game.skip(); render(); });
$('next-question').addEventListener('click', () => { game.advance(); render(); });
$('pause').addEventListener('click', pauseGame);
$('resume').addEventListener('click', resumeGame);
$('pause-home').addEventListener('click', returnHome);
pauseDialog.addEventListener('cancel', event => { event.preventDefault(); resumeGame(); });
$('retry').addEventListener('click', startJourney);
$('fallen-home').addEventListener('click', returnHome);
$('replay').addEventListener('click', startJourney);
$('open-letter').addEventListener('click', () => { if (game.state.status === 'won') { showScreen('letter'); playTone('won'); } });
for (const button of document.querySelectorAll('[data-oath]')) {
  button.addEventListener('click', () => {
    oath = button.dataset.oath;
    for (const item of document.querySelectorAll('[data-oath]')) {
      item.classList.toggle('selected', item === button);
      item.setAttribute('aria-pressed', String(item === button));
    }
  });
}

document.addEventListener('keydown', event => {
  if (event.repeat || event.ctrlKey || event.metaKey || event.altKey || screen !== 'quiz' || pauseDialog.open) return;
  if (/^[1-4]$/.test(event.key) && game.state.status === 'playing') {
    event.preventDefault(); submitAnswer(+event.key - 1);
  }
  if (event.key === 'Escape' && game.state.status === 'playing') { event.preventDefault(); pauseGame(); }
});

$('copy-letter').addEventListener('click', async () => {
  const paragraphs = [...document.querySelectorAll('.letter-dedication, #personal-message p, .letter-signature > span:first-child, .letter-signature strong')].map(p => p.textContent.trim());
  try {
    await navigator.clipboard.writeText(paragraphs.join('\n\n'));
    $('copy-status').textContent = 'Carta copiada. Agora você pode guardar essas palavras onde quiser.';
  } catch {
    $('copy-status').textContent = 'Não foi possível copiar automaticamente. Selecione o texto da carta e use a opção Copiar do seu dispositivo.';
    try { const range = document.createRange(); range.selectNodeContents($('personal-message')); const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range); } catch { /* Manual selection remains available. */ }
  }
});

// Som original sintetizado: ambiente de vento e notas sutis, sempre opcional.
let audioContext;
let masterGain;
let soundOn = false;
function initializeAudio() {
  if (audioContext) return;
  const AudioConstructor = window.AudioContext || window.webkitAudioContext;
  if (!AudioConstructor) throw new Error('Web Audio não disponível');
  audioContext = new AudioConstructor();
  masterGain = audioContext.createGain(); masterGain.gain.value = 0; masterGain.connect(audioContext.destination);
  const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 3, audioContext.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
  const wind = audioContext.createBufferSource(); wind.buffer = buffer; wind.loop = true;
  const filter = audioContext.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 280;
  const windGain = audioContext.createGain(); windGain.gain.value = .11;
  wind.connect(filter); filter.connect(windGain); windGain.connect(masterGain); wind.start();
  [65.41, 98].forEach(frequency => {
    const oscillator = audioContext.createOscillator(); oscillator.type = 'sine'; oscillator.frequency.value = frequency;
    const gain = audioContext.createGain(); gain.gain.value = .012;
    oscillator.connect(gain); gain.connect(masterGain); oscillator.start();
  });
}
function updateSoundButton() {
  $('sound-toggle').setAttribute('aria-pressed', String(soundOn));
  const label = soundOn ? 'Desativar som ambiente' : 'Ativar som ambiente';
  $('sound-toggle').setAttribute('aria-label', label); $('sound-toggle').title = label;
  $('sound-icon').setAttribute('href', soundOn ? '#i-sound' : '#i-mute');
  $('sound-label').textContent = soundOn ? 'Som ligado' : 'Som desligado';
}
$('sound-toggle').addEventListener('click', async () => {
  $('sound-toggle').disabled = true;
  try {
    initializeAudio(); await audioContext.resume();
    soundOn = !soundOn;
    masterGain.gain.setTargetAtTime(soundOn ? .65 : 0, audioContext.currentTime, .15);
    updateSoundButton();
  } catch { soundOn = false; updateSoundButton(); announce('O som ambiente não está disponível neste navegador.'); }
  finally { $('sound-toggle').disabled = false; }
});
function playTone(kind) {
  if (!soundOn || !audioContext || audioContext.state !== 'running') return;
  const notes = { start: [196, 293.66], correct: [329.63, 440, 659.25], wrong: [164.81, 146.83], fallen: [130.81, 98], won: [261.63, 329.63, 392, 523.25], tick: [660] }[kind] || [];
  notes.forEach((frequency, index) => {
    const start = audioContext.currentTime + index * .09;
    const oscillator = audioContext.createOscillator(); const gain = audioContext.createGain();
    oscillator.type = 'sine'; oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0, start); gain.gain.linearRampToValueAtTime(kind === 'tick' ? .012 : .04, start + .02);
    gain.gain.exponentialRampToValueAtTime(.0001, start + .45);
    oscillator.connect(gain); gain.connect(masterGain); oscillator.start(start); oscillator.stop(start + .5);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  });
}

// Brasas leves, limitadas a 30 FPS; sem animação quando a aba está oculta.
const canvas = $('embers');
const context = canvas.getContext('2d');
const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let motionEnabled = !motionQuery.matches;
try { if (localStorage.getItem('quarta-asa-motion') === 'off') motionEnabled = false; } catch { /* Storage is optional. */ }
let frame = 0;
let lastFrameTime = 0;
let width = 0;
let height = 0;
let sparks = [];
function resizeCanvas() {
  width = window.innerWidth; height = window.innerHeight;
  const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
  canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
  if (context) context.setTransform(ratio, 0, 0, ratio, 0, 0);
  sparks = Array.from({ length: Math.min(42, Math.round(width / 30)) }, () => ({ x: Math.random() * width, y: Math.random() * height, r: .4 + Math.random() * 1.1, speed: .22 + Math.random() * .5, opacity: .15 + Math.random() * .5 }));
}
function drawEmbers(timestamp) {
  frame = 0;
  if (!motionEnabled || document.hidden || !context) return;
  frame = requestAnimationFrame(drawEmbers);
  if (timestamp - lastFrameTime < 33) return;
  const elapsed = Math.min(50, timestamp - lastFrameTime) / 16.667;
  lastFrameTime = timestamp;
  context.clearRect(0, 0, width, height);
  for (const spark of sparks) {
    spark.y -= spark.speed * elapsed; spark.x += .09 * elapsed;
    if (spark.y < -5) { spark.y = height + 5; spark.x = Math.random() * width; }
    context.beginPath(); context.fillStyle = `rgba(234,179,92,${spark.opacity})`;
    context.arc(spark.x, spark.y, spark.r, 0, Math.PI * 2); context.fill();
  }
}
function syncMotion() {
  cancelAnimationFrame(frame); frame = 0;
  document.body.classList.toggle('motion-off', !motionEnabled);
  canvas.hidden = !motionEnabled;
  $('motion-toggle').setAttribute('aria-pressed', String(motionEnabled));
  const label = motionEnabled ? 'Desativar animações' : 'Ativar animações';
  $('motion-toggle').setAttribute('aria-label', label); $('motion-toggle').title = label;
  if (motionEnabled && !document.hidden && context) { lastFrameTime = performance.now(); frame = requestAnimationFrame(drawEmbers); }
}
$('motion-toggle').addEventListener('click', () => {
  motionEnabled = !motionEnabled;
  try { localStorage.setItem('quarta-asa-motion', motionEnabled ? 'on' : 'off'); } catch { /* Storage is optional. */ }
  syncMotion();
});
motionQuery.addEventListener('change', event => { if (event.matches) motionEnabled = false; syncMotion(); });
window.addEventListener('resize', resizeCanvas);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (screen === 'quiz' && game.state.status === 'playing' && !game.state.paused) pauseGame();
    audioContext?.suspend().catch(() => {});
  } else if (soundOn) audioContext?.resume().catch(() => {});
  syncMotion(); updateGate();
});

updateGate(); resizeCanvas(); syncMotion();
setInterval(updateGate, 1000);
setInterval(() => {
  if (screen !== 'quiz') return;
  const previousStatus = game.state.status;
  game.tick();
  if (game.state.status !== previousStatus) render();
  else updateClock();
}, 200);
