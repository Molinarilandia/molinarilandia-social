(() => {
const sleep = ms => new Promise(r => setTimeout(r, ms));
const until = async (fn, t = 15000) => { const s = Date.now(); while (Date.now() - s < t) { const v = fn(); if (v) return v; await sleep(250); } return null; };
const vis = sel => [...document.querySelectorAll(sel)].filter(x => x.offsetParent);
const dlg = () => vis('[role=dialog]').pop();
const btnIn = (root, re) => [...root.querySelectorAll('[role=button],button')].find(x => x.offsetParent && re.test((x.getAttribute('aria-label') || '') + '|' + x.textContent.trim()));
const setVal = (el, v) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, v); el.dispatchEvent(new Event('input', {bubbles: true})); };
const ent = el => { for (const t of ['keydown','keyup']) el.dispatchEvent(new KeyboardEvent(t, {key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true, cancelable: true})); };
window.__gpost = async (p, go = true) => {
  const open = vis('[role=button]').find(x => /^Scrivi qualcosa/.test(x.textContent.trim()));
  if (!open) return 'no composer';
  open.click(); const d = await until(() => { const x = dlg(); return x && x.querySelector('[contenteditable=true]') ? x : null; }); if (!d) return 'no dialog';
  const file = p.media ? await window.__fetchMedia(p.media) : await window.__render(p.sp, p.i, p.name);
  window.__hook(); window.__fi = null;
  const ph = btnIn(d, /^Foto\/video|Foto\/video\|/); if (!ph) return 'no photo btn'; ph.click(); await sleep(800);
  if (!window.__fi) { const add = btnIn(dlg(), /Aggiungi foto\/video/); add && add.click(); await sleep(800); }
  const fi = window.__fi; if (!fi) return 'no input';
  const dt = new DataTransfer(); dt.items.add(file); fi.files = dt.files; if (!fi.isConnected) { fi.style.display = 'none'; document.body.appendChild(fi); }
  fi.dispatchEvent(new Event('input', {bubbles: true})); fi.dispatchEvent(new Event('change', {bubbles: true}));
  if (!await until(() => [...dlg().querySelectorAll('img')].some(i => i.src.startsWith('blob:') || /scontent/.test(i.src) && i.width > 150), 20000)) return 'img not attached';
  const ed = dlg().querySelector('[contenteditable=true]'); ed.focus(); await sleep(200);
  const tdt = new DataTransfer(); tdt.setData('text/plain', p.caption);
  ed.dispatchEvent(new ClipboardEvent('paste', {clipboardData: tdt, bubbles: true, cancelable: true})); await sleep(700);
  const capLen = ed.innerText.length; if (capLen < p.caption.length * 0.85) return {err: 'caption short', capLen};
  const sch = btnIn(dlg(), /Programma|Pianifica/); if (!sch) return 'no schedule btn'; sch.click();
  const sd = await until(() => { const x = dlg(); return x && /Programma il post/.test(x.innerText) ? x : null; }, 8000); if (!sd) return 'no schedule dialog';
  const ins = [...sd.querySelectorAll('input[type=text]')].filter(i => i.offsetParent);
  ins[0].focus(); setVal(ins[0], p.date); await sleep(200); ent(ins[0]); await sleep(300);
  ins[1].focus(); setVal(ins[1], p.hh + ':' + p.mm); await sleep(300); ent(ins[1]); await sleep(300); ins[1].blur(); await sleep(300);
  const vals = ins.map(i => i.value);
  if (!go) return {vals};
  const ok1 = [...sd.querySelectorAll('[role=button]')].find(b => b.textContent.trim() === 'Programma'); ok1.click(); await sleep(1500);
  const fin = await until(() => { const x = dlg(); return x && btnIn(x, /^\|?Programma$|\|Programma$/); }, 8000);
  if (!fin) return {err: 'no final btn', vals};
  fin.click();
  const closed = await until(() => !vis('[role=dialog]').some(x => x.querySelector('[contenteditable=true]')), 60000);
  await sleep(2000);
  return p.name + ' group scheduled ' + vals.join(' ') + (closed ? '' : ' (dialog still open?)');
};
window.__grun = async () => {
  if (window.__grunning) return; window.__grunning = true;
  try { while (window.__gqueue.length) { const p = window.__gqueue[0]; let r; try { r = await window.__gpost(p); } catch (e) { r = 'ERR ' + e.message; }
      const ok = typeof r === 'string' && /scheduled/.test(r); window.__glog.push(ok ? r : p.name + ' FAIL ' + JSON.stringify(r));
      if (!ok) break; window.__gqueue.shift(); } } finally { window.__grunning = false; }
};
})();
