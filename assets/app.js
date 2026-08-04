/* ============================================================
   Ajedrez en el Aula · Capa de aplicación compartida
   - Rol del usuario (maestro / estudiante / niño) con persistencia
   - Reconfigura el inicio y la navegación según el rol
   - Progreso con medallas (almacenamiento local, sin cuenta)
   - Modal de selección de rol accesible (teclado + ARIA)
   Se carga en todas las páginas y se ejecuta solo.
   ============================================================ */
(function(global){
'use strict';
var LS_ROLE='aa_role', LS_PROG='aa_prog';

/* ---------- almacenamiento seguro (por si el navegador lo bloquea) ---------- */
function lsGet(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
function lsSet(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }

/* ---------- ROL ---------- */
var ROLES={
  maestro:{icon:'👩‍🏫', label:'Maestro',
    nav:['guia','pedagogia','reglas','imprimibles','arbitraje','practicas','estrategias','jugar','ruta','nivel','aprende'],
    // el maestro ve todo
    allow:null,
    hero:'Bienvenido, maestro. Aquí tienes la guía, la pedagogía, el reglamento, los imprimibles y las prácticas para llevar el ajedrez a tu aula, aunque nunca hayas jugado.'},
  estudiante:{icon:'🧒', label:'Estudiante',
    nav:['aprende','practicas','jugar','ruta','estrategias','nivel','reglas','arbitraje'],
    // el estudiante no ve material docente (guía, pedagogía, imprimibles)
    allow:['aprende','practicas','jugar','ruta','estrategias','nivel','reglas','arbitraje'],
    hero:'¡Hola! Aprende, practica, juega contra la computadora y descubre tu nivel. Todo es como un juego: gana medallas y avanza en tu ruta.'},
  nino:{icon:'🧸', label:'Niño pequeño',
    nav:['aprende','jugar','practicas','ruta','reglas'],
    // para los pequeños, solo lo esencial y divertido
    allow:['aprende','jugar','practicas','ruta','reglas'],
    hero:'¡Vamos a jugar! Conoce las piezas, mira cómo se mueven y diviértete con los juegos. No necesitas saber nada todavía.'}
};
function getRole(){ var r=lsGet(LS_ROLE); return ROLES[r]?r:null; }
function setRole(r){ if(ROLES[r]){ lsSet(LS_ROLE,r); applyRole(); } }

function base(href){ return (href||'').split('/').pop().replace('.html','').split('#')[0]; }

function applyRole(){
  var r=getRole();
  document.body.setAttribute('data-role', r||'');
  var allow = r ? ROLES[r].allow : null; // null = ver todo
  // ---- reordena y filtra la navegación ----
  var navIn=document.querySelector('.nav-in');
  if(navIn){
    var order=(r?ROLES[r].nav:null);
    var links=Array.prototype.slice.call(navIn.querySelectorAll('a.lnk'));
    if(order){
      links.sort(function(a,b){
        var ia=order.indexOf(base(a.getAttribute('href'))); var ib=order.indexOf(base(b.getAttribute('href')));
        if(ia<0)ia=99; if(ib<0)ib=99; return ia-ib;
      });
      links.forEach(function(l){ navIn.appendChild(l); });
    }
    // oculta las secciones no permitidas para el rol (con clase, no estilo,
    // para que el menú móvil abierto tampoco las revele)
    links.forEach(function(l){
      var b=base(l.getAttribute('href'));
      l.classList.toggle('role-hidden', !!(allow && allow.indexOf(b)<0));
    });
    ensureBurger(navIn);
    ensureRoleChip(navIn, r);
    ensureLangChip(navIn);
  }
  // ---- reordena y filtra las tarjetas del inicio ----
  var cards=document.querySelector('.section-cards');
  if(cards && r){
    var order2=ROLES[r].nav;
    var kids=Array.prototype.slice.call(cards.children);
    kids.sort(function(a,b){
      var ha=a.getAttribute('href'), hb=b.getAttribute('href');
      var ia=ha?order2.indexOf(base(ha)):99, ib=hb?order2.indexOf(base(hb)):99;
      if(ia<0)ia=98; if(ib<0)ib=98; return ia-ib;
    });
    kids.forEach(function(k){ cards.appendChild(k); });
    // oculta las tarjetas de secciones no permitidas (deja las que no son enlaces)
    kids.forEach(function(k){
      var h=k.getAttribute('href');
      if(h && allow) k.style.display = (allow.indexOf(base(h))<0) ? 'none' : '';
      else if(h) k.style.display='';
    });
  }
  // ---- personaliza el hero del inicio ----
  var heroLead=document.getElementById('heroLead');
  if(heroLead && r){ heroLead.textContent=ROLES[r].hero; }
  // ---- muestra el muro de medallas si existe ----
  renderBadges();
}

/* botón hamburguesa para móviles: colapsa los enlaces */
function ensureBurger(navIn){
  var burger=document.getElementById('navBurger');
  if(!burger){
    burger=document.createElement('button');
    burger.id='navBurger'; burger.className='nav-burger'; burger.type='button';
    burger.setAttribute('aria-label','Abrir el menú'); burger.setAttribute('aria-expanded','false');
    burger.innerHTML='☰';
    burger.addEventListener('click',function(){
      var open=navIn.classList.toggle('open');
      burger.setAttribute('aria-expanded', open?'true':'false');
      burger.innerHTML=open?'✕':'☰';
    });
    // colapsa al tocar un enlace
    navIn.addEventListener('click',function(e){
      if(e.target.closest('a.lnk')){ navIn.classList.remove('open'); burger.setAttribute('aria-expanded','false'); burger.innerHTML='☰'; }
    });
  }
  navIn.appendChild(burger);
}

/* chip de rol en la barra: muestra el rol y permite cambiarlo */
function ensureRoleChip(navIn, r){
  var chip=document.getElementById('roleChip');
  if(!chip){
    chip=document.createElement('button');
    chip.id='roleChip'; chip.className='role-chip'; chip.type='button';
    chip.setAttribute('aria-haspopup','dialog');
    chip.addEventListener('click',function(){ openRoleModal(false); });
    navIn.appendChild(chip);
  } else { navIn.appendChild(chip); }
  chip.innerHTML = r ? (ROLES[r].icon+' '+t(ROLES[r].label)+' <span aria-hidden="true">▾</span>')
                     : ('👤 '+t('Elegir rol'));
  chip.setAttribute('aria-label', r ? ('Rol: '+t(ROLES[r].label)) : t('Elegir rol'));
}

/* ---------- MODAL DE ROL (accesible) ---------- */
var lastFocused=null;
function openRoleModal(firstTime){
  var ov=document.getElementById('roleModal');
  if(!ov){ ov=buildModal(); document.body.appendChild(ov); }
  ov.querySelector('.rm-skip').style.display = firstTime ? 'none' : 'inline-flex';
  lastFocused=document.activeElement;
  ov.classList.add('on');
  var first=ov.querySelector('button[data-role]');
  if(first) first.focus();
  document.addEventListener('keydown', modalKeydown, true);
}
function closeRoleModal(){
  var ov=document.getElementById('roleModal');
  if(ov) ov.classList.remove('on');
  document.removeEventListener('keydown', modalKeydown, true);
  if(lastFocused && lastFocused.focus) lastFocused.focus();
}
function modalKeydown(e){
  var ov=document.getElementById('roleModal'); if(!ov||!ov.classList.contains('on')) return;
  if(e.key==='Escape'){ e.preventDefault(); closeRoleModal(); return; }
  if(e.key==='Tab'){ // trampa de foco
    var f=Array.prototype.slice.call(ov.querySelectorAll('button'));
    if(!f.length) return;
    var i=f.indexOf(document.activeElement);
    if(e.shiftKey){ if(i<=0){ e.preventDefault(); f[f.length-1].focus(); } }
    else { if(i===f.length-1){ e.preventDefault(); f[0].focus(); } }
  }
}
function buildModal(){
  var ov=document.createElement('div');
  ov.id='roleModal'; ov.className='rm-overlay';
  ov.innerHTML=
    '<div class="rm-box" role="dialog" aria-modal="true" aria-labelledby="rmTitle" aria-describedby="rmDesc">'+
      '<h2 id="rmTitle" style="font-size:clamp(22px,4vw,32px)">'+t('¿Quién eres?')+'</h2>'+
      '<p id="rmDesc" class="note" style="margin:.3em 0 1em">'+t('Elige tu rol para acomodar la página a lo que necesitas. Puedes cambiarlo cuando quieras.')+'</p>'+
      '<div class="rm-opts">'+
        '<button data-role="maestro" type="button"><span class="rm-ic">👩‍🏫</span><b>'+t('Maestro')+'</b><small>'+t('Guía, reglamento e imprimibles')+'</small></button>'+
        '<button data-role="estudiante" type="button"><span class="rm-ic">🧒</span><b>'+t('Estudiante')+'</b><small>'+t('Practica, juega y sube de nivel')+'</small></button>'+
        '<button data-role="nino" type="button"><span class="rm-ic">🧸</span><b>'+t('Niño pequeño')+'</b><small>'+t('Aprende jugando desde cero')+'</small></button>'+
      '</div>'+
      '<button class="rm-skip btn ghost sm" type="button" style="margin-top:14px">'+t('Ahora no')+'</button>'+
    '</div>';
  ov.addEventListener('click',function(e){ if(e.target===ov) closeRoleModal(); });
  ov.querySelectorAll('button[data-role]').forEach(function(b){
    b.addEventListener('click',function(){ setRole(b.dataset.role); closeRoleModal(); });
  });
  ov.querySelector('.rm-skip').addEventListener('click', closeRoleModal);
  return ov;
}

/* ---------- PROGRESO Y MEDALLAS ---------- */
var BADGES=[
  {id:'aprende', icon:'🧸', label:'Explorador', desc:'Jugaste a conocer las piezas'},
  {id:'memoria', icon:'🃏', label:'Buena memoria', desc:'Ganaste el juego de memoria'},
  {id:'practica', icon:'🧩', label:'Primer acierto', desc:'Resolviste un ejercicio'},
  {id:'notacion', icon:'🔤', label:'Sé anotar', desc:'Acertaste una notación'},
  {id:'estrategia',icon:'♟️', label:'Estratega', desc:'Aplicaste una estrategia'},
  {id:'gana', icon:'🏆', label:'Ganador', desc:'Le ganaste a la IA'},
  {id:'nivel', icon:'🎯', label:'Me conozco', desc:'Completaste el test de nivel'},
  {id:'arbitro', icon:'⚖️', label:'Juez justo', desc:'Aprobaste las prácticas de árbitro'}
];
function getProg(){ try{ return JSON.parse(lsGet(LS_PROG)||'{}'); }catch(e){ return {}; } }
function award(id){
  var p=getProg(); if(p[id]) { return false; }
  p[id]=Date.now(); lsSet(LS_PROG, JSON.stringify(p));
  renderBadges();
  toast(id);
  return true;
}
function toast(id){
  var b=BADGES.filter(function(x){return x.id===id;})[0]; if(!b) return;
  var t=document.createElement('div'); t.className='badge-toast';
  t.innerHTML='<span class="bt-ic">'+b.icon+'</span><div><b>¡Medalla nueva!</b><br>'+b.label+'</div>';
  document.body.appendChild(t);
  requestAnimationFrame(function(){ t.classList.add('on'); });
  setTimeout(function(){ t.classList.remove('on'); setTimeout(function(){t.remove();},400); }, 3200);
  if(global.celebrate) global.celebrate(t);
}
function renderBadges(){
  var wall=document.getElementById('badgeWall'); if(!wall) return;
  var p=getProg();
  wall.innerHTML='';
  BADGES.forEach(function(b){
    var got=!!p[b.id];
    var d=document.createElement('div'); d.className='badge'+(got?' got':'');
    d.innerHTML='<span class="b-ic">'+b.icon+'</span><span class="b-lb">'+b.label+'</span>';
    d.title=b.desc+(got?' ✓':' (bloqueada)');
    wall.appendChild(d);
  });
  var n=BADGES.filter(function(b){return p[b.id];}).length;
  var cnt=document.getElementById('badgeCount'); if(cnt) cnt.textContent=n+' / '+BADGES.length;
}

/* ---------- API pública ---------- */
global.AA={ getRole:getRole, setRole:setRole, openRoleModal:openRoleModal, award:award,
            getProgress:getProg, badges:BADGES,
            lang:getLang,
            // traduce una cadena suelta generada por JS (usa el diccionario de página o el compartido)
            t:function(es){ if(getLang()!=='en') return es;
              var d=global.PAGE_I18N; if(d&&d[es]!=null) return d[es];
              if(COMMON[es]!=null) return COMMON[es];
              if(global.I18N_EXTRA&&global.I18N_EXTRA[es]!=null) return global.I18N_EXTRA[es];
              return DICT[es]||es; },
            // vuelve a traducir el contenido tras generar HTML nuevo dinámicamente
            translateEls:function(){ translateEls(); } };

/* enlace "saltar al contenido" para usuarios de teclado (WCAG 2.4.1) */
function injectSkipLink(){
  if(document.querySelector('.skip-link')) return;
  var main=document.querySelector('main, .wrap'); if(!main) return;
  if(!main.id) main.id='main';
  var a=document.createElement('a'); a.className='skip-link'; a.href='#'+main.id;
  a.textContent=t('Saltar al contenido');
  document.body.insertBefore(a, document.body.firstChild);
}

/* ---------- LOGO Y FAVICON ---------- */
var LOGO_SVG='<svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true">'+
  '<rect width="64" height="64" rx="15" fill="#4C7A58"/>'+
  '<rect x="6" y="6" width="52" height="52" rx="11" fill="none" stroke="#6FA37C" stroke-width="2" opacity=".6"/>'+
  '<text x="32" y="48" font-size="42" text-anchor="middle" fill="#F0E7D2" '+
  'font-family="DejaVu Sans,\'Segoe UI Symbol\',sans-serif">♞</text></svg>';
function injectBranding(){
  // favicon
  if(!document.querySelector('link[rel="icon"]')){
    var uri='data:image/svg+xml,'+encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="15" fill="#4C7A58"/>'+
      '<text x="32" y="48" font-size="42" text-anchor="middle" fill="#F0E7D2" font-family="sans-serif">♞</text></svg>');
    var link=document.createElement('link'); link.rel='icon'; link.type='image/svg+xml'; link.href=uri;
    document.head.appendChild(link);
  }
  // logo en la marca de la barra
  var brand=document.querySelector('.brand');
  if(brand && !brand.querySelector('.logo')){
    Array.prototype.slice.call(brand.childNodes).forEach(function(n){
      if(n.nodeType===3 && n.textContent.indexOf('♞')>=0) n.textContent=n.textContent.replace('♞','').replace(/^\s+/,'');
    });
    var logo=document.createElement('span'); logo.className='logo'; logo.innerHTML=LOGO_SVG;
    brand.insertBefore(logo, brand.firstChild);
  }
}

/* ---------- ANIMACIÓN DE CONTENIDO (scroll reveal) ---------- */
function setupReveal(){
  if(typeof IntersectionObserver==='undefined') return;
  if(matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  var sel='.card, .rule, .sec, .concept, .method, .move-mini, .badge-wall';
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  },{threshold:.06, rootMargin:'0px 0px -40px 0px'});
  Array.prototype.slice.call(document.querySelectorAll(sel)).forEach(function(el){
    if(el.closest('.rm-box')) return;                 // no animar el modal
    var top=el.getBoundingClientRect().top;
    if(top > window.innerHeight*0.9){ el.classList.add('reveal'); io.observe(el); } // solo lo que está más abajo
  });
}

/* ---------- IDIOMA (ES / EN) — traduce la interfaz compartida ---------- */
var LS_LANG='aa_lang';
var DICT={
  'Aprende':'Learn','Guía':'Guide','Pedagogía':'Pedagogy','Reglas':'Rules','Prácticas':'Practice',
  'Estrategias':'Strategies','Jugar':'Play','Ruta':'Path','Árbitro':'Referee','Imprimibles':'Printables','Nivel':'Level',
  'Saltar al contenido':'Skip to content','Elegir rol':'Choose role','Ahora no':'Not now',
  '¿Quién eres?':'Who are you?','Maestro':'Teacher','Estudiante':'Student','Niño pequeño':'Young child',
  'Guía, reglamento e imprimibles':'Guide, rules and printables','Practica, juega y sube de nivel':'Practice, play and level up',
  'Aprende jugando desde cero':'Learn by playing from scratch',
  'Elige tu rol para acomodar la página a lo que necesitas. Puedes cambiarlo cuando quieras.':
    'Choose your role to tailor the page to what you need. You can change it anytime.',
  'Ajedrez en el Aula · material educativo libre · sin fines de acreditación':
    'Chess in the Classroom · free educational material · not for accreditation'
};
/* cadenas que se repiten en todo el sitio (pie de página, avisos, botones comunes) */
var COMMON={
  'Ajedrez en el Aula · material educativo libre · alojado en GitHub':
    'Chess in the Classroom · free educational material · hosted on GitHub',
  'Solo para enseñar y aprender. Material educativo abierto. No otorga certificados ni acreditación. Publicado con GitHub Pages.':
    'For teaching and learning only. Open educational material. It grants no certificates or accreditation. Published with GitHub Pages.',
  'Siguiente':'Next','Siguiente →':'Next →','Reiniciar':'Restart','Empezar':'Start','Volver a empezar':'Start over',
  'Comprobar':'Check','Correcto':'Correct','Incorrecto':'Incorrect','¡Correcto!':'Correct!','¡Muy bien!':'Great!',
  'Pista':'Hint','Siguiente pregunta':'Next question','Reintentar':'Try again','Continuar':'Continue'
};
function getLang(){ return lsGet(LS_LANG)==='en' ? 'en' : 'es'; }
function t(es){ return getLang()==='en' && DICT[es] ? DICT[es] : es; }
function setLang(l){ lsSet(LS_LANG, l); location.reload(); }
function applyLang(){
  var en=getLang()==='en';
  document.documentElement.lang = en?'en':'es';
  if(!en) return; // el contenido base ya está en español
  // navegación
  Array.prototype.slice.call(document.querySelectorAll('.nav-in a.lnk')).forEach(function(a){
    var k=a.textContent.trim(); if(DICT[k]) a.textContent=DICT[k];
  });
  // marca: NO tocar el span del logo, solo el de "en el Aula"
  var bs=document.querySelector('.brand span:not(.logo)'); if(bs) bs.textContent='in the Classroom';
  var bt=document.querySelector('.brand');
  if(bt) Array.prototype.slice.call(bt.childNodes).forEach(function(n){ if(n.nodeType===3 && /Ajedrez/.test(n.textContent)) n.textContent=n.textContent.replace('Ajedrez','Chess'); });
  // elementos marcados con data-en (traducción manual por elemento, p. ej. títulos con <br>)
  Array.prototype.slice.call(document.querySelectorAll('[data-en]')).forEach(function(el){
    el.innerHTML=el.getAttribute('data-en');
  });
  // traducción por diccionario de página (contenido estático y generado por JS)
  translateEls();
}

/* Recorre el contenido y traduce cada elemento "hoja" cuyo texto esté en el
   diccionario de la página (global.PAGE_I18N). Se puede volver a llamar después
   de que el JS genere contenido nuevo (preguntas, planes, rangos…). */
function normTxt(s){ return (s||'').replace(/\s+/g,' ').trim(); }
function translateEls(){
  if(getLang()!=='en') return;
  var dict=global.PAGE_I18N; if(!dict) return;
  if(dict.__title) document.title=dict.__title;
  var sel='p,li,h1,h2,h3,h4,h5,h6,summary,figcaption,caption,th,td,button,label,dt,dd,'+
          'blockquote,span.tag,.eyebrow,.lead,.note,.disclaimer,.k,.foot,option,.pill,.chip-t,.toc a';
  Array.prototype.slice.call(document.querySelectorAll(sel)).forEach(function(el){
    if(el.closest('.nav')||el.closest('.rm-box')) return;      // barra y modal se traducen aparte
    if(el.hasAttribute('data-en')) return;                     // ya traducido a mano
    if(el.querySelector('p,li,ul,ol,h1,h2,h3,h4,h5,h6,table')) return; // no es una hoja de texto
    var key=normTxt(el.textContent); if(!key) return;
    var en=dict[key];
    if(en==null) en=COMMON[key];
    if(en==null && global.I18N_EXTRA) en=global.I18N_EXTRA[key];
    if(en!=null && normTxt(el.innerHTML)!==normTxt(en)) el.innerHTML=en;
  });
}
function ensureLangChip(navIn){
  var chip=document.getElementById('langChip');
  if(!chip){
    chip=document.createElement('button'); chip.id='langChip'; chip.className='role-chip'; chip.type='button';
    chip.style.background='var(--tinta3)'; chip.style.color='var(--marfil)';
    chip.addEventListener('click',function(){ setLang(getLang()==='en'?'es':'en'); });
    navIn.appendChild(chip);
  } else { navIn.appendChild(chip); }
  chip.textContent = getLang()==='en' ? '🌐 ES' : '🌐 EN';
  chip.setAttribute('aria-label', getLang()==='en'?'Cambiar a español':'Switch to English');
}

/* ---------- arranque ---------- */
function init(){
  injectBranding();
  injectSkipLink();
  applyRole();
  applyLang();
  setupReveal();
  // primera visita al inicio: pregunta el rol
  var isHome=!!document.querySelector('.section-cards');
  if(isHome && !getRole()){ setTimeout(function(){ openRoleModal(true); }, 350); }
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
else init();
})(typeof window!=='undefined'?window:this);
