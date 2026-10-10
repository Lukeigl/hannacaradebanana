// Configuração da surpresa. Datas sempre interpretadas em America/Sao_Paulo.
export const CONFIG = Object.freeze({ day: 17, month: 10, questionSeconds: 20, lives: 3 });

export const CHAPTERS = [
  { number: 'I', book: 'Quarta Asa', title: 'O primeiro voo', location: 'Basgiath',
    lead: 'O vento não espera por quem hesita.',
    story: 'À sua frente, o parapeito desaparece entre as nuvens. Atrás, fica tudo o que você já conhece. Do outro lado, asas imensas cruzam o céu. Respire. A sua história começa com um passo.',
    victory: 'Você atravessou. O céu acaba de ficar um pouco mais perto.' },
  { number: 'II', book: 'Chama de Ferro', title: 'Entre fogo e segredos', location: 'Aretia',
    lead: 'Algumas verdades precisam atravessar o fogo.',
    story: 'As muralhas de Aretia guardam mais do que uma resistência. Guardam escolhas, alianças e a coragem de questionar o que parecia verdade. Agora, conhecimento também é uma arma.',
    victory: 'A chama resistiu. Nem todo poder faz barulho.' },
  { number: 'III', book: 'Tempestade de Ônix', title: 'Além da tempestade', location: 'O desconhecido',
    lead: 'Há respostas que só existem além das fronteiras.',
    story: 'O céu escurece. O mundo se torna maior, os segredos se tornam mais profundos. Confie no que aprendeu e em quem decidiu ser. A última parte desta jornada espera por você.',
    victory: 'Você encontrou o caminho. Agora, uma última surpresa.' }
];

export const QUESTIONS = [
  { book: 'Quarta Asa', prompt: 'Antes de entrar no Quadrante dos Cavaleiros, qual caminho Violet pretendia seguir?',
    choices: ['O dos curandeiros', 'O dos escribas', 'O da infantaria', 'O dos cavaleiros desde o início'], correct: 1,
    explanation: 'Violet se preparava para ser escriba. Sua mãe a obriga a seguir o caminho dos cavaleiros.' },
  { book: 'Quarta Asa', prompt: 'Quais dragões criam um vínculo com Violet no primeiro livro?',
    choices: ['Sgaeyl e Codagh', 'Tairn e Sgaeyl', 'Tairn e Andarna', 'Andarna e Deigh'], correct: 2,
    explanation: 'Tairn e Andarna escolhem Violet. O vínculo com dois dragões torna sua trajetória extraordinária.' },
  { book: 'Chama de Ferro', prompt: 'Qual cidade se torna o centro da resistência e recebe os cadetes que deixam Basgiath?',
    choices: ['Aretia', 'Samara', 'Resson', 'Draithus'], correct: 0,
    explanation: 'Aretia abriga a resistência e passa a acolher os cavaleiros que escolhem lutar ao seu lado.' },
  { book: 'Chama de Ferro', prompt: 'Qual segredo de Andarna é essencial para ativar plenamente as proteções?',
    choices: ['Ela é filha de Tairn', 'Ela controla todas as runas', 'Ela pode ressuscitar dragões', 'Ela pertence a uma sétima linhagem'], correct: 3,
    explanation: 'É necessário o fogo das sete linhagens. Andarna representa a sétima, até então desconhecida por Violet.' },
  { book: 'Tempestade de Ônix', prompt: 'Qual é o verdadeiro poder de Theophanie, percebido por Violet durante o confronto?',
    choices: ['Apagar memórias', 'Manipular tempestades', 'Parar o tempo', 'Ler intenções'], correct: 1,
    explanation: 'Theophanie manipula tempestades. Seu poder vai além de controlar raios.' },
  { book: 'Tempestade de Ônix', prompt: 'Qual é o segundo sinete de Violet, confirmado no terceiro livro?',
    choices: ['Controlar sombras', 'Curar ferimentos', 'Entrar nos sonhos de outras pessoas', 'Prever todos os futuros'], correct: 2,
    explanation: 'Violet é capaz de caminhar nos sonhos. Esse segundo sinete vem de seu vínculo com Andarna.' }
];

const dateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Sao_Paulo', year: 'numeric', month: 'numeric', day: 'numeric'
});

export function birthdayCountdown(now = new Date()) {
  const local = Object.fromEntries(dateFormatter.formatToParts(now).map(p => [p.type, p.value]));
  const open = +local.month === CONFIG.month && +local.day === CONFIG.day;
  const passed = +local.month > CONFIG.month || (+local.month === CONFIG.month && +local.day > CONFIG.day);
  const year = +local.year + Number(passed);
  const target = new Date(`${year}-${String(CONFIG.month).padStart(2, '0')}-${String(CONFIG.day).padStart(2, '0')}T00:00:00-03:00`);
  const seconds = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
  return { open, year, target, units: [Math.floor(seconds / 86400), Math.floor(seconds / 3600) % 24, Math.floor(seconds / 60) % 60, seconds % 60] };
}

// Relógio absoluto: atrasos do navegador nunca adicionam segundos à prova.
// Feedback e capítulos são estados sem relógio; cliques duplicados são ignorados.
export function createExpedition() {
  let s;
  let deadline = 0;
  let pausedMs = 0;
  const initial = () => ({ status: 'ready', questionIndex: 0, lives: CONFIG.lives, correct: 0,
    remaining: CONFIG.questionSeconds, result: null, selected: null, paused: false });
  s = initial();
  const beginQuestion = now => {
    s = { ...s, status: 'playing', result: null, selected: null, paused: false, remaining: CONFIG.questionSeconds };
    deadline = now + CONFIG.questionSeconds * 1000;
  };
  const lose = result => {
    s.lives = Math.max(0, s.lives - 1);
    s.result = result;
    s.status = s.lives ? 'feedback' : 'fallen';
  };
  const tick = now => {
    if (s.status !== 'playing' || s.paused) return;
    s.remaining = Math.max(0, Math.ceil((deadline - now) / 1000));
    if (now >= deadline) lose('timeout');
  };
  return {
    get state() { return { ...s }; },
    start() { s = { ...initial(), status: 'briefing' }; },
    begin(now = Date.now()) { if (s.status === 'briefing') beginQuestion(now); },
    tick(now = Date.now()) { tick(now); },
    answer(index, now = Date.now()) {
      tick(now);
      if (s.status !== 'playing' || s.paused || !Number.isInteger(index) || index < 0 || index >= QUESTIONS[s.questionIndex].choices.length) return;
      s.selected = index;
      if (index === QUESTIONS[s.questionIndex].correct) { s.correct++; s.result = 'correct'; s.status = 'feedback'; }
      else lose('wrong');
    },
    skip(now = Date.now()) { tick(now); if (s.status === 'playing' && !s.paused) lose('skip'); },
    advance(now = Date.now()) {
      if (s.status !== 'feedback') return;
      if (s.result === 'correct' || s.result === 'skip') {
        s.questionIndex++;
        if (s.questionIndex >= QUESTIONS.length) { s.status = 'won'; return; }
        if (s.questionIndex % 2 === 0) { s.status = 'briefing'; s.result = null; return; }
      }
      beginQuestion(now);
    },
    pause(now = Date.now()) {
      tick(now);
      if (s.status !== 'playing' || s.paused) return;
      pausedMs = Math.max(0, deadline - now); s.paused = true;
    },
    resume(now = Date.now()) {
      if (s.status !== 'playing' || !s.paused) return;
      deadline = now + pausedMs; s.paused = false;
    }
  };
}
