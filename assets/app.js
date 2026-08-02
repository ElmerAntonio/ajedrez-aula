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
    nav:['guia','pedagogia','reglas','imprimibles','arbitraje','practicas','estrategias','jugar','nivel','aprende'],
    hero:'Bienvenido, maestro. Aquí tienes la guía, la pedagogía, el reglamento, los imprimibles y las prácticas para llevar el ajedrez a tu aula, aunque nunca hayas jugado.'},
  estudiante:{icon:'🧒', label:'Estudiante',
    nav:['aprende','practicas','jugar','estrategias','nivel','reglas','guia','pedagogia','arbitraje','imprimibles'],
    hero:'¡Hola! Aprende, practica, juega contra la computadora y descubre tu nivel. Todo es como un juego: gana medallas mientras avanzas.'},
  nino:{icon:'🧸', label:'Niño pequeño',
    nav:['aprende','jugar','practicas','reglas','estrategias','nivel','imprimibles','guia','pedagogia','arbitraje'],
    hero:'¡Vamos a jugar! Conoce las piezas, mira cómo se mueven y diviértete con los juegos. No necesitas saber nada todavía.'}
};
function getRole(){ var r=lsGet(LS_ROLE); return ROLES[r]?r:null; }
function setRole(r){ if(ROLES[r]){ lsSet(LS_ROLE,r); applyRole(); } }

function base(href){ return (href||'').split('/').pop().replace('.html','').split('#')[0]; }

function applyRole(){
  var r=getRole();
  document.body.setAttribute('data-role', r||'');
  // ---- reordena la navegación ----
  var navIn=document.querySelector('.nav-in');
  if(navIn){
    var order=(r?ROLES[r].nav:null);
    if(order){
      var links=Array.prototype.slice.call(navIn.querySelectorAll('a.lnk'));
      links.sort(function(a,b){
        var ia=order.indexOf(base(a.getAttribute('href'))); var ib=order.indexOf(base(b.getAttribute('href')));
        if(ia<0)ia=99; if(ib<0)ib=99; return ia-ib;
      });
      links.forEach(function(l){ navIn.appendChild(l); }); // reubica antes del chip
    }
    ensureRoleChip(navIn, r);
  }
  // ---- reordena las tarjetas del inicio ----
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
  }
  // ---- personaliza el hero del inicio ----
  var heroLead=document.getElementById('heroLead');
  if(heroLead && r){ heroLead.textContent=ROLES[r].hero; }
  // ---- muestra el muro de medallas si existe ----
  renderBadges();
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
  chip.innerHTML = r ? (ROLES[r].icon+' '+ROLES[r].label+' <span aria-hidden="true">▾</span>')
                     : '👤 Elegir rol';
  chip.setAttribute('aria-label', r ? ('Rol actual: '+ROLES[r].label+'. Pulsa para cambiarlo.') : 'Elegir tu rol');
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
      '<h2 id="rmTitle" style="font-size:clamp(22px,4vw,32px)">¿Quién eres?</h2>'+
      '<p id="rmDesc" class="note" style="margin:.3em 0 1em">Elige tu rol para acomodar la página a lo que necesitas. Puedes cambiarlo cuando quieras.</p>'+
      '<div class="rm-opts">'+
        '<button data-role="maestro" type="button"><span class="rm-ic">👩‍🏫</span><b>Maestro</b><small>Guía, reglamento e imprimibles</small></button>'+
        '<button data-role="estudiante" type="button"><span class="rm-ic">🧒</span><b>Estudiante</b><small>Practica, juega y sube de nivel</small></button>'+
        '<button data-role="nino" type="button"><span class="rm-ic">🧸</span><b>Niño pequeño</b><small>Aprende jugando desde cero</small></button>'+
      '</div>'+
      '<button class="rm-skip btn ghost sm" type="button" style="margin-top:14px">Ahora no</button>'+
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
            getProgress:getProg, badges:BADGES };

/* enlace "saltar al contenido" para usuarios de teclado (WCAG 2.4.1) */
function injectSkipLink(){
  if(document.querySelector('.skip-link')) return;
  var main=document.querySelector('main, .wrap'); if(!main) return;
  if(!main.id) main.id='main';
  var a=document.createElement('a'); a.className='skip-link'; a.href='#'+main.id;
  a.textContent='Saltar al contenido';
  document.body.insertBefore(a, document.body.firstChild);
}

/* ---------- arranque ---------- */
function init(){
  injectSkipLink();
  applyRole();
  // primera visita al inicio: pregunta el rol
  var isHome=!!document.querySelector('.section-cards');
  if(isHome && !getRole()){ setTimeout(function(){ openRoleModal(true); }, 350); }
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
else init();
})(typeof window!=='undefined'?window:this);
