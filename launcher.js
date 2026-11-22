/* ArtCraft OS · botón flotante para abrir cualquier app desde otra app.
   Uso: <script src="../launcher.js"></script> en el index.html de cada app. */
(function(){
  if (window.__craftNav) return; window.__craftNav = 1;
  const APPS = [ // [nombre, carpeta, ícono]
    ['PhotoCraft','photocraft-web-0.23.1','photocraft'],['FontCraft','fontcraft-web-0.1.0','fontcraft'],['DesignCraft','designcraft-web-0.20.1','designcraft'],['VectorCraft','vectorcraft-web-0.24.1','vectorcraft'],
    ['FigCraft','figcraft-web-0.18.1','figcraft'],['LightCraft','lightcraft-web-0.21.1','lightcraft'],
    ['WordCraft','wordcraft-web-0.18.1','wordcraft'],['GridCraft','gridcraft-web-0.19.1','gridcraft'],
    ['DeckCraft','deckcraft-web-0.18.1','deckcraft'],['PdfCraft','pdfcraft-web-0.21.1','pdfcraft'],
    ['FilmCraft','filmcraft-web-0.20.1','filmcraft'],['EffectCraft','effectcraft-web-0.24.1','effectcraft'],
    ['SoundCraft','soundcraft-web-0.20.1','soundcraft'],['CADCraft','cadcraft-web-0.20.1','cadcraft'],
    ['MaterialCraft','materialcraft-web-0.4.1','materialcraft'],['TextureCraft','texturecraft-web-0.6.1','texturecraft'],
    ['Craft Anything','craft-anything-web-0.6.1','craft-anything']];
  const STANDALONE = matchMedia('(display-mode: standalone), (display-mode: fullscreen)').matches;
  const here = APPS.find(a => location.pathname.includes('/' + a[1] + '/'));

  /* ---- pantalla completa ---- */
  const KEY_AUTO = 'craftnav.autofs';
  const de = document.documentElement;
  const FS_OK = !!(de.requestFullscreen || de.webkitRequestFullscreen);
  const isFS = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
  const enterFS = () => { const f = de.requestFullscreen || de.webkitRequestFullscreen; if (f) { try { const r = f.call(de); if (r && r.catch) r.catch(() => {}); } catch (e) {} } };
  const exitFS = () => { const f = document.exitFullscreen || document.webkitExitFullscreen; if (f) { try { const r = f.call(document); if (r && r.catch) r.catch(() => {}); } catch (e) {} } };
  let auto = true; try { auto = localStorage.getItem(KEY_AUTO) !== '0'; } catch (e) {}
  let userExited = false, wasFS = false;

  /* ---- color de la barra del navegador (theme-color) ---- */
  const setTheme = () => {
    let c = '';
    for (const el of [document.body, document.documentElement]) {
      if (!el) continue;
      const v = getComputedStyle(el).backgroundColor;
      if (v && v !== 'transparent' && !/rgba\(.*,\s*0\)$/.test(v)) { c = v; break; }
    }
    c = c || '#0e1118';
    let m = document.querySelector('meta[name="theme-color"]');
    if (!m) { m = document.createElement('meta'); m.name = 'theme-color'; document.head.appendChild(m); }
    m.content = c;
  };
  const themeSoon = () => { setTheme(); setTimeout(setTheme, 2000); };
  if (document.readyState === 'complete') themeSoon(); else addEventListener('load', themeSoon);

  const host = document.createElement('div');
  host.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;z-index:2147483647';
  const root = host.attachShadow({mode:'open'});
  root.innerHTML = `<style>
   *{box-sizing:border-box;font-family:system-ui,sans-serif}
   #b{position:fixed;width:44px;height:44px;border-radius:50%;border:1px solid #00e5a0;background:rgba(14,17,24,.82);
      color:#00e5a0;display:flex;align-items:center;justify-content:center;cursor:grab;touch-action:none;padding:0;opacity:.75}
   #b:hover,#b:focus-visible{opacity:1;outline:2px solid #00e5a0;outline-offset:2px}
   #o{position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:flex-end;justify-content:center}
   #o[hidden]{display:none}
   #p{width:min(720px,100%);max-height:80vh;overflow:auto;background:#0e1118;border:1px solid rgba(255,255,255,.14);
      border-radius:16px 16px 0 0;padding:16px 16px calc(16px + env(safe-area-inset-bottom))}
   @media(min-width:760px){#o{align-items:center}#p{border-radius:16px}}
   h2{font-size:13px;letter-spacing:2px;color:#6b7f95;margin:0 0 12px;font-weight:600}
   .g{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px}
   a{display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 6px;border-radius:12px;background:#131822;
     border:1px solid rgba(255,255,255,.07);color:#d8e4f0;text-decoration:none;font-size:13px;text-align:center}
   a:hover,a:focus-visible{border-color:#00e5a0;outline:none}
   a.cur{border-color:#00e5a0;color:#00e5a0}
   img,.f{width:48px;height:48px;border-radius:12px;object-fit:cover}
   .f{display:flex;align-items:center;justify-content:center;background:#0e1118;color:#00e5a0;font-weight:700}
   .home{flex-direction:row;justify-content:center;margin-bottom:10px;width:100%;color:#00e5a0}
   .fs{display:flex;flex-wrap:wrap;align-items:center;gap:12px;margin-bottom:12px}
   .fs[hidden]{display:none}
   .fs button{padding:10px 14px;border-radius:10px;background:#131822;border:1px solid rgba(255,255,255,.14);color:#d8e4f0;font-size:13px;cursor:pointer}
   .fs button:hover,.fs button:focus-visible{border-color:#00e5a0;outline:none}
   .fs label{display:flex;align-items:center;gap:8px;color:#9fb0c1;font-size:13px}
  </style>
  <button id="b" aria-label="Abrir otra app" title="Abrir otra app"><svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><circle cx="4" cy="4" r="2"/><circle cx="10" cy="4" r="2"/><circle cx="16" cy="4" r="2"/><circle cx="4" cy="10" r="2"/><circle cx="10" cy="10" r="2"/><circle cx="16" cy="10" r="2"/><circle cx="4" cy="16" r="2"/><circle cx="10" cy="16" r="2"/><circle cx="16" cy="16" r="2"/></svg></button>
  <div id="o" hidden><div id="p" role="dialog" aria-label="Apps de ArtCraft"><h2>ABRIR OTRA APP (SE ABRE EN PESTAÑA NUEVA)</h2>
  <div class="fs" id="fsrow"><button id="fsb" type="button"></button><label><input type="checkbox" id="fsa"> Pantalla completa automática al primer toque</label></div>
  <a class="home" href="../" rel="noopener">⌂ Inicio de ArtCraft OS</a><div class="g"></div></div></div>`;
  const grid = root.querySelector('.g');
  for (const [name, dir, ico] of APPS) {
    const a = document.createElement('a');
    a.href = '../' + dir + '/'; a.target = '_blank'; a.rel = 'noopener';
    if (here && here[1] === dir) a.className = 'cur';
    const img = document.createElement('img');
    img.alt = ''; img.src = 'https://getartcraft.com/images/apps/' + ico + '/icon.webp';
    img.onerror = () => { const f = document.createElement('div'); f.className = 'f'; f.textContent = name[0]; img.replaceWith(f); };
    const s = document.createElement('span'); s.textContent = name;
    a.append(img, s); grid.appendChild(a);
  }
  const b = root.getElementById('b'), o = root.getElementById('o');

  /* controles de pantalla completa en el panel */
  const fsb = root.getElementById('fsb'), fsa = root.getElementById('fsa'), fsrow = root.getElementById('fsrow');
  fsrow.hidden = !FS_OK;
  const updFS = () => { fsb.textContent = isFS() ? 'Salir de pantalla completa' : 'Pantalla completa'; };
  fsa.checked = auto; updFS();
  fsb.addEventListener('click', () => { if (isFS()) exitFS(); else { userExited = false; enterFS(); } o.hidden = true; });
  fsa.addEventListener('change', () => { auto = fsa.checked; try { localStorage.setItem(KEY_AUTO, auto ? '1' : '0'); } catch (e) {} });
  const onFS = () => { const now = isFS(); if (wasFS && !now) userExited = true; if (now) userExited = false; wasFS = now; updFS(); };
  document.addEventListener('fullscreenchange', onFS); document.addEventListener('webkitfullscreenchange', onFS);
  /* el primer toque dentro de la app activa la pantalla completa (el navegador exige un gesto) */
  const autoFS = () => { if (!auto || userExited || isFS() || !FS_OK || STANDALONE) return; enterFS(); };
  addEventListener('pointerup', autoFS, true); addEventListener('click', autoFS, true);

  const clamp = (v, max) => Math.max(4, Math.min(max - 48, v));
  let pos; try { pos = JSON.parse(localStorage.getItem('craftnav.pos.' + (here ? here[1] : 'x'))); } catch (e) {}
  pos = pos || {x: innerWidth - 56, y: innerHeight - 56};
  const place = () => { b.style.left = clamp(pos.x, innerWidth) + 'px'; b.style.top = clamp(pos.y, innerHeight) + 'px'; };
  place(); addEventListener('resize', place);
  let sx, sy, ox, oy, moved = false;
  b.addEventListener('pointerdown', e => { b.setPointerCapture(e.pointerId); sx = e.clientX; sy = e.clientY; ox = pos.x; oy = pos.y; moved = false; });
  b.addEventListener('pointermove', e => {
    if (!b.hasPointerCapture(e.pointerId)) return;
    if (Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy) > 8) moved = true;
    if (moved) { pos = {x: ox + e.clientX - sx, y: oy + e.clientY - sy}; place(); }
  });
  b.addEventListener('pointerup', () => {
    if (moved) { try { localStorage.setItem('craftnav.pos.' + (here ? here[1] : 'x'), JSON.stringify(pos)); } catch (e) {} }
    else o.hidden = false;
  });
  o.addEventListener('click', e => { if (e.target === o) o.hidden = true; });
  addEventListener('keydown', e => { if (e.key === 'Escape') o.hidden = true; });
  const mount = () => document.body.appendChild(host);
  document.body ? mount() : addEventListener('DOMContentLoaded', mount);
})();
