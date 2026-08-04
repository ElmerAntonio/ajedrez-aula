/* ============================================================
   Ajedrez en el Aula · Tutor Socrático (reutilizable)
   Un tutor basado en reglas que NO da la respuesta: hace preguntas
   cada vez más concretas —según el objetivo del ejercicio y su tema
   táctico— hasta que el estudiante encuentra la jugada. El último
   peldaño la muestra en el tablero. Usa el motor (assets/chess.js).

   Uso:
     var tut = Socratic.mount({ host, board, current });
     // al cargar un ejercicio nuevo:  tut.reset();
   - host: elemento contenedor donde se dibuja el panel.
   - board: instancia de ChessBoard (para leer la posición y resaltar).
   - current: función que devuelve el ejercicio actual {tema, want, sol, h}.

   Las cadenas se registran en window.I18N_EXTRA para compartir la
   traducción al inglés con todas las páginas que carguen este archivo.
   ============================================================ */
(function(global){
'use strict';

var TR={
  'Tutor socrático':'Socratic tutor',
  'Pulsa «Guíame» y te haré preguntas para que encuentres la jugada tú mismo, sin darte la respuesta de inmediato.':
    'Press «Guide me» and I\'ll ask you questions so you find the move yourself, without giving you the answer right away.',
  '▶ Guíame':'▶ Guide me','Otra pista →':'Another hint →','↺ Empezar de nuevo':'↺ Start over',
  'Concéntrate en tu':'Focus on your','¿A qué casilla debe ir?':'Which square should it go to?',
  'La jugada es':'The move is','Hazla en el tablero.':'Play it on the board.','Paso':'Step','pieza':'piece',
  'peón':'pawn','caballo':'knight','alfil':'bishop','torre':'rook','dama':'queen','rey':'king',
  '¿Qué pieza del rival puedes capturar con ventaja en esta posición?':'Which enemy piece can you capture with an advantage in this position?',
  '¿Cómo le das jaque al rey rival en una sola jugada?':'How do you give check to the enemy king in a single move?',
  '¿Puedes dar jaque mate en UNA jugada? Busca el jaque sin escape.':'Can you give checkmate in ONE move? Look for the check with no escape.',
  '¿Cuál es la mejor jugada aquí? Piensa en el plan que te conviene.':'What is the best move here? Think about the plan that suits you.',
  'Recuerda cómo se mueve cada pieza. ¿Cuál de las tuyas llega hasta esa pieza rival para capturarla?':
    'Remember how each piece moves. Which of yours reaches that enemy piece to capture it?',
  'Tu peón está muy cerca del final. ¿Qué le pasa a un peón cuando llega a la última fila?':
    'Your pawn is very close to the end. What happens to a pawn when it reaches the last rank?',
  'Un jaque obliga al rival a responder. ¿Desde qué casilla amenazas directamente al rey?':
    'A check forces the opponent to respond. From which square do you threaten the king directly?',
  'Un tenedor ataca dos cosas a la vez. ¿Hay una casilla desde donde UNA pieza amenace dos objetivos?':
    'A fork attacks two things at once. Is there a square from which ONE piece threatens two targets?',
  'Un peón también hace tenedor al comer. ¿Qué dos piezas rivales están juntas, en diagonal a tu peón?':
    'A pawn also forks when it captures. Which two enemy pieces are together, diagonal to your pawn?',
  'En la brocheta das jaque y detrás cae algo valioso. ¿En qué línea están el rey y una pieza grande, uno tras otro?':
    'In a skewer you give check and something valuable falls behind. On which line are the king and a big piece, one behind the other?',
  'Tu dama puede amenazar dos cosas por líneas distintas. ¿Qué casilla toca al rey y a otra pieza a la vez?':
    'Your queen can threaten two things on different lines. Which square hits the king and another piece at once?',
  'En el descubierto, mueves una pieza y OTRA que estaba detrás da el jaque. ¿Cuál de las tuyas tapa a otra?':
    'In a discovery, you move one piece and ANOTHER behind it gives check. Which of yours is blocking another?',
  'Una pieza rival está clavada: no puede moverse porque detrás está algo mayor. ¿Cómo la atacas otra vez?':
    'An enemy piece is pinned: it can\'t move because something greater is behind it. How do you attack it again?',
  'El rey rival está encerrado por sus propios peones. ¿Qué pieza tuya entra por la última fila?':
    'The enemy king is boxed in by its own pawns. Which of your pieces comes in on the last rank?',
  'Busca el jaque del que el rey no pueda escapar, ni tapar, ni capturar. ¿Cuál es?':
    'Look for the check the king can\'t escape, block or capture. Which is it?',
  'Tu rey está en el centro, expuesto. ¿Cuál es la jugada que lo pone a salvo y activa la torre?':
    'Your king is in the center, exposed. What move brings it to safety and activates the rook?'
};
global.I18N_EXTRA=global.I18N_EXTRA||{};
for(var k in TR){ if(TR.hasOwnProperty(k)) global.I18N_EXTRA[k]=TR[k]; }

var PNAME={p:'peón',n:'caballo',b:'alfil',r:'torre',q:'dama',k:'rey'};
var WANT_Q={
  capture:'¿Qué pieza del rival puedes capturar con ventaja en esta posición?',
  check:'¿Cómo le das jaque al rey rival en una sola jugada?',
  mate:'¿Puedes dar jaque mate en UNA jugada? Busca el jaque sin escape.',
  move:'¿Cuál es la mejor jugada aquí? Piensa en el plan que te conviene.'
};
var TEMA_Q={
  captura:'Recuerda cómo se mueve cada pieza. ¿Cuál de las tuyas llega hasta esa pieza rival para capturarla?',
  coronacion:'Tu peón está muy cerca del final. ¿Qué le pasa a un peón cuando llega a la última fila?',
  jaque:'Un jaque obliga al rival a responder. ¿Desde qué casilla amenazas directamente al rey?',
  tenedor:'Un tenedor ataca dos cosas a la vez. ¿Hay una casilla desde donde UNA pieza amenace dos objetivos?',
  'tenedor-peon':'Un peón también hace tenedor al comer. ¿Qué dos piezas rivales están juntas, en diagonal a tu peón?',
  brocheta:'En la brocheta das jaque y detrás cae algo valioso. ¿En qué línea están el rey y una pieza grande, uno tras otro?',
  'ataque-doble':'Tu dama puede amenazar dos cosas por líneas distintas. ¿Qué casilla toca al rey y a otra pieza a la vez?',
  descubierto:'En el descubierto, mueves una pieza y OTRA que estaba detrás da el jaque. ¿Cuál de las tuyas tapa a otra?',
  clavada:'Una pieza rival está clavada: no puede moverse porque detrás está algo mayor. ¿Cómo la atacas otra vez?',
  pasillo:'El rey rival está encerrado por sus propios peones. ¿Qué pieza tuya entra por la última fila?',
  mate:'Busca el jaque del que el rey no pueda escapar, ni tapar, ni capturar. ¿Cuál es?',
  enroque:'Tu rey está en el centro, expuesto. ¿Cuál es la jugada que lo pone a salvo y activa la torre?'
};

function t(s){ return (global.AA&&global.AA.t)?global.AA.t(s):s; }

var styled=false;
function injectCSS(){
  if(styled) return; styled=true;
  var s=document.createElement('style');
  s.textContent=
    '.socratic{margin-top:14px;border:1px solid #33473C;border-radius:16px;'+
    'background:linear-gradient(180deg,#22312a,#1b2721);padding:16px 18px}'+
    '.socratic .who{font-family:var(--mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;'+
    'color:var(--selva-cl);display:flex;align-items:center;gap:8px;margin-bottom:8px}'+
    '.socratic .who b{font-size:20px;line-height:1}'+
    '.soc-q{font-size:clamp(15.5px,1.5vw,18.5px);line-height:1.5;color:var(--marfil);min-height:2.4em}'+
    '.soc-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}'+
    '.soc-step{font-family:var(--mono);font-size:11px;color:#7E9086;margin-top:8px}';
  document.head.appendChild(s);
}

global.Socratic={
  mount:function(opts){
    injectCSS();
    var host=opts.host, board=opts.board, getCur=opts.current, Chess=global.Chess;
    host.classList.add('socratic');
    host.innerHTML=
      '<div class="who"><b>🦉</b> <span class="soc-who"></span></div>'+
      '<div class="soc-q"></div>'+
      '<div class="soc-actions">'+
        '<button class="btn sm soc-next" type="button"></button>'+
        '<button class="btn ghost sm soc-reset" type="button" style="display:none"></button>'+
      '</div>'+
      '<div class="soc-step"></div>';
    var whoEl=host.querySelector('.soc-who'), qEl=host.querySelector('.soc-q'),
        nextB=host.querySelector('.soc-next'), resetB=host.querySelector('.soc-reset'),
        stepEl=host.querySelector('.soc-step');
    var ladder=[], stage=0;

    function build(){
      ladder=[];
      var cur=getCur&&getCur();
      if(!cur||!cur.sol||!cur.sol[0]) return;
      var fromSq=cur.sol[0][0], toSq=cur.sol[0][1];
      var fr=Chess.sqToRC(fromSq);
      var code=(board.state.board[fr[0]]||[])[fr[1]];
      var pieza=code?t(PNAME[code.toLowerCase()]||'pieza'):t('pieza');
      ladder.push(t(WANT_Q[cur.want]||WANT_Q.move));
      if(TEMA_Q[cur.tema]) ladder.push(t(TEMA_Q[cur.tema]));
      if(cur.h) ladder.push('💡 '+t(cur.h));
      ladder.push(t('Concéntrate en tu')+' '+pieza+' '+t('de')+' '+fromSq+'. '+t('¿A qué casilla debe ir?'));
      ladder.push({reveal:true, from:fromSq, to:toSq});
    }
    function reset(){
      stage=0; ladder=[];
      whoEl.textContent=t('Tutor socrático');
      qEl.textContent=t('Pulsa «Guíame» y te haré preguntas para que encuentres la jugada tú mismo, sin darte la respuesta de inmediato.');
      nextB.style.display=''; nextB.textContent=t('▶ Guíame');
      resetB.style.display='none'; resetB.textContent=t('↺ Empezar de nuevo'); stepEl.textContent='';
    }
    function advance(){
      if(!ladder.length) build();
      if(stage>=ladder.length) return;
      var step=ladder[stage];
      if(step&&step.reveal){
        var fr=Chess.sqToRC(step.from), to=Chess.sqToRC(step.to);
        board.sel=fr;
        board.legal=Chess.legalMoves(board.state).filter(function(m){return m.from[0]===fr[0]&&m.from[1]===fr[1];});
        board.render();
        var cell=board.cells[to[0]+'-'+to[1]]; if(cell) cell.classList.add('sel');
        qEl.textContent=t('La jugada es')+' '+step.from+' → '+step.to+'. '+t('Hazla en el tablero.');
        nextB.style.display='none'; resetB.style.display='';
      } else {
        qEl.textContent=step;
        nextB.textContent=t('Otra pista →');
      }
      stage++;
      stepEl.textContent=t('Paso')+' '+Math.min(stage,ladder.length)+' / '+ladder.length;
      if(stage>=ladder.length){ nextB.style.display='none'; resetB.style.display=''; }
    }
    nextB.addEventListener('click',advance);
    resetB.addEventListener('click',reset);
    reset();
    return { reset:reset };
  }
};
})(typeof window!=='undefined'?window:this);
