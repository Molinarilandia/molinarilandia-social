(() => {
const W = 1080, H = 1350;
function rng(seed){ let s = (seed * 9301 + 49297) % 233280 || 1; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
const PAL = [[[178,28,40],[110,12,22]], [[32,52,104],[18,28,62]], [[34,112,70],[10,48,30]], [[150,74,34],[60,24,10]]];
const rgb = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
function radial(ctx, cin, cout, cy = 0.42){
  const g = ctx.createRadialGradient(W/2, H*cy, 0, W/2, H*cy, Math.hypot(W, H) * 0.62);
  g.addColorStop(0, rgb(cin)); g.addColorStop(1, rgb(cout)); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
function snow(ctx, n, seed, alpha = 0.8){
  const r = rng(seed); ctx.save(); ctx.filter = 'blur(1.2px)';
  for (let i = 0; i < n; i++){ const x = r()*W, y = r()*H, s = [2,3,3,4,5,7][Math.floor(r()*6)];
    ctx.fillStyle = `rgba(255,255,255,${alpha*(0.35+0.65*r())})`; ctx.beginPath(); ctx.arc(x, y, s, 0, 7); ctx.fill(); }
  ctx.restore();
}
function sparkle(ctx, x, y, s, col = 'rgb(255,230,160)'){
  const pts = [[0,-1],[.14,-.14],[1,0],[.14,.14],[0,1],[-.14,.14],[-1,0],[-.14,-.14]];
  for (const blur of [s*.35, 0]){ ctx.save(); if (blur) ctx.filter = `blur(${blur}px)`; ctx.fillStyle = col; ctx.beginPath();
    pts.forEach(([a,b],k)=> k ? ctx.lineTo(x+a*s, y+b*s) : ctx.moveTo(x+a*s, y+b*s)); ctx.closePath(); ctx.fill(); ctx.restore(); }
}
function textC(ctx, t, font, cy, fill, shadow = true, x = null){
  ctx.font = font; ctx.textBaseline = 'middle'; ctx.textAlign = x === null ? 'center' : 'left';
  const px = x === null ? W/2 : x;
  if (shadow){ ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 3; ctx.fillStyle = fill; ctx.fillText(t, px, cy); ctx.restore(); }
  else { ctx.fillStyle = fill; ctx.fillText(t, px, cy); }
}
function wrap(ctx, t, font, maxw){ ctx.font = font; const w = t.split(' '); const out = []; let cur = '';
  for (const x of w){ const tt = (cur + ' ' + x).trim(); if (ctx.measureText(tt).width <= maxw) cur = tt; else { out.push(cur); cur = x; } }
  if (cur) out.push(cur); return out; }
function footer(ctx, dark){ textC(ctx, "Molinarilandia.it  ·  Calendario dell'Avvento da colorare", '500 28px Fredoka', H-48, dark ? 'rgb(255,240,220)' : 'rgb(120,70,50)', dark); }
const SERIF = s => `italic 500 ${s}px "Playfair Display"`;
function quote(ctx, sp, i){
  const [cin, cout] = PAL[i % 4]; radial(ctx, cin, cout); snow(ctx, 110, i + 1);
  const lines = sp.lines; const size = lines.length <= 3 ? 104 : lines.length === 4 ? 92 : 84; const lh = size * 1.22;
  const top = H*0.46 - lh*lines.length/2;
  lines.forEach((ln,k) => textC(ctx, ln, SERIF(size), top + lh*k + lh/2, (k < lines.length-1 || lines.length < 3) ? 'rgb(255,246,228)' : 'rgb(255,214,130)'));
  sparkle(ctx, W/2, top - 70, 26);
  if (sp.sub) textC(ctx, sp.sub, '500 40px Fredoka', top + lh*lines.length + 70, 'rgb(255,214,130)');
  footer(ctx, true);
}
function list(ctx, sp, i){
  const g = ctx.createRadialGradient(W/2, H*.45, 0, W/2, H*.45, Math.hypot(W,H)*.62); g.addColorStop(0,'rgb(255,249,238)'); g.addColorStop(1,'rgb(238,220,196)');
  ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
  const tf = '650 70px Fredoka'; const tl = wrap(ctx, sp.title, tf, W-140);
  const band = 90 + 84*tl.length + 30; ctx.fillStyle = 'rgb(178,28,40)'; ctx.fillRect(0,0,W,band);
  tl.forEach((ln,k)=> textC(ctx, ln, tf, 90 + 84*k, '#fff'));
  snow(ctx, 25, i + 8, 0.5);
  const n = sp.items.length; const fs = n <= 5 ? 50 : n <= 7 ? 42 : 36; const f = `500 ${fs}px Fredoka`;
  const rows = sp.items.map(it => wrap(ctx, it, f, W-300));
  const total = rows.reduce((a,r)=>a+r.length,0)*fs*1.25 + (n-1)*fs*0.8;
  let y = band + (H-140-band-total)/2;
  rows.forEach((r,k) => { const cy = y + fs*0.65;
    ctx.fillStyle = k % 2 ? 'rgb(30,110,64)' : 'rgb(178,28,40)'; ctx.beginPath(); ctx.arc(126, cy, 36, 0, 7); ctx.fill();
    textC(ctx, String(k+1), '650 40px Fredoka', cy+1, '#fff', false);
    for (const ln of r){ ctx.font = f; ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillStyle = 'rgb(60,30,20)'; ctx.fillText(ln, 196, y); y += fs*1.25; }
    y += fs*0.8; });
  sparkle(ctx, W-90, H-170, 22, 'rgb(244,190,80)');
  footer(ctx, false);
}
window.__fonts = async () => {
  if (!document.getElementById('cl-fonts')){ const l = document.createElement('link'); l.id='cl-fonts'; l.rel='stylesheet';
    l.href='https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,500&family=Fredoka:wght@500;600;700&display=block';
    document.head.appendChild(l); await new Promise(r=>{l.onload=r;l.onerror=r;setTimeout(r,5000)}); }
  for (const f of ['italic 500 60px "Playfair Display"','500 60px Fredoka','650 60px Fredoka']) await document.fonts.load(f);
};
window.__render = async (sp, i, name) => {
  await window.__fonts();
  const c = document.createElement('canvas'); c.width = W; c.height = H; const ctx = c.getContext('2d');
  (sp.t === 'quote' ? quote : list)(ctx, sp, i);
  const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', 0.9));
  return new File([blob], name, {type: 'image/jpeg'});
};
const sleep = ms => new Promise(r => setTimeout(r, ms));
const until = async (fn, t = 15000) => { const s = Date.now(); while (Date.now() - s < t) { const v = fn(); if (v) return v; await sleep(250); } return null; };
const byText = (t, sel = '[role=button],button,a') => [...document.querySelectorAll(sel)].find(x => x.textContent.trim() === t && x.offsetParent !== null);
window.__fetchMedia = (name) => new Promise((res, rej) => {
  const h = (e) => { const d = e.data || {}; if (d.name !== name) return; removeEventListener('message', h);
    if (d.type === 'img') res(new File([d.blob], name, {type: name.endsWith('.mp4') ? 'video/mp4' : 'image/jpeg'})); else rej(new Error(d.msg)); };
  addEventListener('message', h); window.__bridge.contentWindow.postMessage({type: 'want', name}, '*'); setTimeout(() => rej(new Error('timeout')), 60000);
});
window.__hook = () => { if (window.__hooked) return; const orig = HTMLInputElement.prototype.click;
  HTMLInputElement.prototype.click = function(){ if (this.type === 'file'){ window.__fi = this; return; } return orig.apply(this, arguments); }; window.__hooked = true; };
window.__prep2 = async (file) => {
  window.__hook(); window.__fi = null;
  const b = [...document.querySelectorAll('[role=button],button')].find(x => x.textContent.trim() === 'Aggiungi foto/video' && x.offsetParent);
  if (!b) return 'no add button'; b.click();
  for (let k = 0; k < 20 && !window.__fi; k++) await sleep(150);
  const fi = window.__fi; if (!fi) return 'no input';
  const dt = new DataTransfer(); dt.items.add(file); fi.files = dt.files;
  if (!fi.isConnected) { fi.style.display='none'; document.body.appendChild(fi); }
  fi.dispatchEvent(new Event('input', {bubbles: true})); fi.dispatchEvent(new Event('change', {bubbles: true}));
  return 'ready';
};
window.__caption = async (txt) => {
  const ed = [...document.querySelectorAll('[contenteditable=true]')].find(e => (e.getAttribute('aria-label')||'').startsWith('Scrivi qualcosa')) || document.querySelector('[contenteditable=true]');
  if (!ed) return 0; ed.focus(); await sleep(200);
  const dt = new DataTransfer(); dt.setData('text/plain', txt);
  ed.dispatchEvent(new ClipboardEvent('paste', {clipboardData: dt, bubbles: true, cancelable: true}));
  await sleep(600); return ed.innerText.length;
};
window.__spinTo = async (el, target) => {
  const k = (up) => el.dispatchEvent(new KeyboardEvent('keydown', {key: up ? 'ArrowUp' : 'ArrowDown', code: up ? 'ArrowUp' : 'ArrowDown', keyCode: up ? 38 : 40, which: up ? 38 : 40, bubbles: true, cancelable: true}));
  el.focus(); for (let n = 0; n < 80; n++) { const cur = +el.getAttribute('aria-valuenow'); if (cur === target) return true; k(cur < target); await sleep(25); }
  return false;
};
const setVal = (el, v) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, v); el.dispatchEvent(new Event('input', {bubbles: true})); };
const key = (el, k) => { for (const ty of ['keydown','keyup']) el.dispatchEvent(new KeyboardEvent(ty, {key: k, code: k, keyCode: k==='Enter'?13:27, bubbles: true, cancelable: true})); };
window.__setSchedule = async (date, hh, mm) => {
  const sw = await until(() => document.querySelector('input[aria-label="Imposta data e ora"]'), 5000); if (!sw) return {err: 'no switch'};
  if (!sw.checked) { sw.click(); await sleep(800); }
  const dates = [...document.querySelectorAll('input[placeholder="gg/mm/aaaa"]')];
  for (const d of dates) { d.focus(); setVal(d, date); await sleep(150); key(d, 'Enter'); await sleep(150); key(d, 'Escape'); d.blur(); await sleep(200); }
  const sp = [...document.querySelectorAll('[role=spinbutton]')];
  for (let k = 0; k < sp.length; k++) await window.__spinTo(sp[k], +(k % 2 === 0 ? hh : mm));
  document.activeElement && document.activeElement.blur(); await sleep(300);
  return {dates: dates.map(d => d.value), spins: sp.map(s => s.getAttribute('aria-valuenow'))};
};
window.__openComposer = async () => {
  if (!byText('Aggiungi foto/video')) { const c = byText('Crea post'); if (!c) return 'no crea post'; c.click();
    if (!await until(() => byText('Aggiungi foto/video'))) return 'composer not open'; }
  await sleep(800); return 'open';
};
window.__submit = async () => {
  const btn = byText('Programma', 'div[role=button],button'); if (!btn) return 'no programma btn';
  btn.click(); const done = await until(() => byText('Forse più tardi'), 120000);
  if (!done) return 'no confirmation';
  const txt = (done.closest('[role=dialog]')||document.body).innerText.match(/\d+ \w+ 2026, \d+:\d+/);
  done.click(); await sleep(2500); return 'scheduled ' + (txt ? txt[0] : '');
};
const attached = (video) => [...document.querySelectorAll('*')].some(e => e.childElementCount === 0 && (video ? /^\d+:\d\d$|Modifica video|Miniatura/.test(e.textContent.trim()) : /^\d+ x \d+$/.test(e.textContent.trim())));
window.__post = async (p) => {
  const o = await window.__openComposer(); if (o !== 'open') return o;
  const file = p.media ? await window.__fetchMedia(p.media) : await window.__render(p.sp, p.i, p.name);
  const a = await window.__prep2(file); if (a !== 'ready') return a;
  const video = file.type.startsWith('video');
  const ok = await until(() => attached(video) || byText('Rimuovi video'), video ? 120000 : 20000);
  if (!ok) return 'media not attached';
  await sleep(video ? 4000 : 500);
  const capLen = await window.__caption(p.caption);
  const sch = await window.__setSchedule(p.date, p.hh, p.mm);
  const want = +p.hh + '|' + +p.mm;
  if (!sch.spins || sch.spins.length < 2 || sch.spins[0]+'|'+sch.spins[1] !== want || (sch.spins.length === 4 && sch.spins[2]+'|'+sch.spins[3] !== want)) return {err: 'time mismatch', sch};
  if (capLen < p.caption.length * 0.85) return {err: 'caption short', capLen};
  return p.name + ' ' + await window.__submit();
};
window.__run = async () => {
  if (window.__running) return; window.__running = true;
  try { while (window.__queue.length) { const p = window.__queue[0]; let r; try { r = await window.__post(p); } catch (e) { r = 'ERR ' + e.message; }
      const ok = typeof r === 'string' && /scheduled/.test(r); window.__log.push(ok ? r : p.name + ' FAIL ' + JSON.stringify(r));
      try { localStorage.__cl_done = JSON.stringify(window.__log.filter(s => /scheduled/.test(s)).map(s => s.split(' ')[0])); } catch (e) {}
      if (!ok) break; window.__queue.shift(); } } finally { window.__running = false; }
};
})();
