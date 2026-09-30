const $ = id => document.getElementById(id);
const ICON = {veg:'🧅',meat:'🥩',oil:'🛢️',sauce:'🫙',sugar:'🍬',water:'💧',noodle:'🍜',fried:'🍲',jjang:'🟤',boiled:'🍥'};
const GOOD_MIN = 40, GOOD_MAX = 75;   // 잘익힘 구간 (게이지 %)
let s;

function init() {
  s = {wok:[], pot:[], bowl:[], heat:{wok:0, pot:0}, tray:{fried:0, jjang:0, boiled:0}, lives:3, score:0, speed:1, on:true};
  say('자, 야채랑 고기랑 식용유를 웍에 넣게!', '😄');
  render();
}

function say(text, face) {
  $('say').textContent = text;
  if (face) $('react').textContent = face;
}

function shake() {
  const c = $('chef');
  c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake');
}

function put(v, i) { if (!s[v].includes(i)) s[v].push(i); }

function add(i) {
  if (!s.on) return;
  if (['veg', 'meat', 'oil', 'sauce', 'sugar'].includes(i)) put('wok', i);
  else if (i === 'water') put('pot', i);
  else if (i === 'noodle') {
    if (!s.pot.includes('water')) return say('물부터 붓고 면을 넣게!', '😠');
    put('pot', i);
  } else if (i === 'fried') {
    if (!s.tray.fried) return;
    s.tray.fried--; put('wok', 'fried');
  } else if (s.tray[i]) {
    s.tray[i]--; put('bowl', i);
  }
  render();
}

function recipe(v) {
  const c = [...s[v]].sort().join();
  if (v === 'pot') return c === 'noodle,water' ? 'boiled' : null;
  if (c === 'meat,oil,veg') return 'fried';
  if (c === 'fried,oil,sauce,sugar') return 'jjang';
  return null;
}

const PRAISE = {fried:'오호, 잘 볶았구먼! 이제 짜장을 만들게!', jjang:'짜장 좋네! 면을 삶아보게!', boiled:'면 쫄깃하겠어! 그릇에 담게!'};

function take(v) {
  if (!s.on || !s[v].length) return;
  const h = s.heat[v], k = recipe(v);
  if (!k) return fail(v, '그건 레시피가 아니여! 재료가 틀렸네!');
  if (h < GOOD_MIN) return fail(v, '설익었잖아!');
  if (h > GOOD_MAX) return fail(v, '탔어! 탔다고!');
  s.tray[k]++; s[v] = []; s.heat[v] = 0;
  say(PRAISE[k], '👍');
  render();
}

function finish() {
  if (!s.on) return;
  const c = [...s.bowl].sort().join();
  if (c !== 'boiled,jjang') return fail('bowl', '면이랑 짜장을 함께 담아야지!');
  s.score++; s.speed *= 1.15; s.bowl = [];
  say('최고의 짜장면이구먼! 다음 손님!', '🤩');
  render();
}

function fail(v, msg) {
  s[v] = []; if (s.heat[v] !== undefined) s.heat[v] = 0;
  s.lives--; shake();
  say(msg, '😡');
  render();
  if (s.lives <= 0) end();
}

function end() {
  s.on = false;
  say('제발… 다시 한 번 기회를 주세요…', '😭');
  overlay('끝!', `만든 짜장면: ${s.score}그릇`, '다시하기');
}

function overlay(title, text, btn) {
  $('ov-title').textContent = title;
  $('ov-text').textContent = text;
  $('start').textContent = btn;
  $('overlay').classList.remove('hide');
}

function render() {
  for (const v of ['wok', 'pot', 'bowl']) $(v).textContent = s[v].map(i => ICON[i]).join(' ');
  for (const k of ['fried', 'jjang', 'boiled']) {
    $('t-' + k).textContent = s.tray[k] ? '×' + s.tray[k] : '';
    document.querySelector(`#tray [data-i="${k}"]`).disabled = !s.tray[k];
  }
  $('hud').textContent = '❤️'.repeat(Math.max(s.lives, 0)) + '  🍜 ' + s.score;
  for (const v of ['wok', 'pot']) $('g-' + v).style.left = `calc(${s.heat[v]}% - ${s.heat[v] * 0.06}px)`;
}

setInterval(() => {
  if (!s || !s.on) return;
  for (const v of ['wok', 'pot']) {
    if (!s[v].length) continue;
    s.heat[v] += 1.2 * s.speed;
    if (s.heat[v] >= 100) return fail(v, '다 타버렸네!');
  }
  render();
}, 100);

document.querySelectorAll('[data-i]').forEach(b => b.onclick = () => add(b.dataset.i));
document.querySelectorAll('[data-take]').forEach(b => b.onclick = () => take(b.dataset.take));
$('done').onclick = finish;
$('start').onclick = () => { $('overlay').classList.add('hide'); init(); };

init();
s.on = false;
overlay('재민과 주방장', '오늘의 메뉴: 짜장면', '바로시작!');
