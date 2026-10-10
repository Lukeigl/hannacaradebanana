import test from 'node:test';
import assert from 'node:assert/strict';
import { birthdayCountdown, createExpedition, QUESTIONS } from '../quest.mjs';

test('o portão abre à meia-noite de São Paulo, sem recarregar a página', () => {
  const before = birthdayCountdown(new Date('2026-10-17T02:59:59.000Z'));
  assert.equal(before.open, false);
  assert.deepEqual(before.units, [0, 0, 0, 1]);
  assert.equal(birthdayCountdown(new Date('2026-10-17T03:00:00.000Z')).open, true);
  assert.equal(birthdayCountdown(new Date('2026-10-18T02:59:59.000Z')).open, true);
  const after = birthdayCountdown(new Date('2026-10-18T03:00:00.000Z'));
  assert.equal(after.open, false);
  assert.equal(after.year, 2027);
  assert.ok(after.units[0] > 360);
});

test('nenhuma vida se perde na espera nem durante a apresentação de um capítulo', () => {
  const game = createExpedition();
  game.tick(100000);
  assert.equal(game.state.lives, 3);
  game.start();
  game.tick(500000);
  assert.equal(game.state.status, 'briefing');
  assert.equal(game.state.lives, 3);
  game.begin(500000);
  assert.equal(game.state.remaining, 20);
  game.tick(501000);
  assert.equal(game.state.remaining, 19);
});

test('tempo esgotado e cliques repetidos retiram apenas uma vida', () => {
  const game = createExpedition(); game.start(); game.begin(1000);
  game.answer(QUESTIONS[0].correct, 21000);
  game.tick(22000); game.skip(22000); game.answer(0, 22000);
  assert.equal(game.state.result, 'timeout');
  assert.equal(game.state.lives, 2);
  assert.equal(game.state.questionIndex, 0);
  game.advance(25000);
  assert.equal(game.state.remaining, 20);
});

test('a pausa preserva o tempo restante e não reinicia os vinte segundos', () => {
  const game = createExpedition(); game.start(); game.begin(1000);
  game.pause(8500); game.tick(900000);
  assert.equal(game.state.remaining, 13);
  assert.equal(game.state.lives, 3);
  game.resume(900000); game.tick(901000);
  assert.equal(game.state.remaining, 12);
});

test('errar, pular e esgotar o tempo encerram a tentativa sem liberar a carta', () => {
  const game = createExpedition(); game.start(); game.begin(0);
  game.answer((QUESTIONS[0].correct + 1) % 4, 1);
  assert.equal(game.state.lives, 2);
  game.advance(2); game.skip(3); game.advance(4);
  game.tick(25000);
  assert.equal(game.state.status, 'fallen');
  assert.equal(game.state.lives, 0);
  game.advance(26000); game.begin(26000);
  assert.equal(game.state.status, 'fallen');
  game.start();
  assert.equal(game.state.lives, 3);
  assert.equal(game.state.questionIndex, 0);
});

test('os três livros são percorridos e a carta só é liberada ao concluir a jornada', () => {
  const game = createExpedition(); game.start();
  let now = 0;
  const books = new Set();
  for (let i = 0; i < QUESTIONS.length; i++) {
    if (game.state.status === 'briefing') game.begin(now);
    books.add(QUESTIONS[i].book);
    assert.equal(game.state.questionIndex, i);
    game.answer(QUESTIONS[i].correct, now + 500);
    assert.equal(game.state.status, 'feedback');
    game.answer(QUESTIONS[i].correct, now + 600);
    game.advance(now + 1000);
    now += 2000;
  }
  assert.equal(books.size, 3);
  assert.equal(game.state.status, 'won');
  assert.equal(game.state.correct, QUESTIONS.length);
  assert.equal(game.state.lives, 3);
  game.tick(now + 999999);
  assert.equal(game.state.status, 'won');
});
