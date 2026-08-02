/* ============================================================
   Ajedrez en el Aula · Motor de ajedrez + IA
   Motor propio, sin dependencias externas. Genera movimientos
   legales, detecta jaque / mate / ahogado y ofrece una IA
   sencilla (minimax con poda) en tres niveles.

   Representación del tablero:
     board = matriz 8x8. board[fila][col]
     fila 0 = rank 8 (arriba)  ...  fila 7 = rank 1 (abajo)
     col  0 = columna a        ...  col  7 = columna h
     Piezas: mayúscula = blancas, minúscula = negras, null = vacía.
   ============================================================ */
(function(global){
'use strict';

/* ---------- utilidades de casilla ---------- */
function sqToRC(sq){ return [8 - parseInt(sq[1],10), sq.charCodeAt(0)-97]; }
function rcToSq(r,c){ return 'abcdefgh'[c] + (8-r); }
function inside(r,c){ return r>=0 && r<8 && c>=0 && c<8; }
function isWhite(p){ return p && p===p.toUpperCase(); }
function colorOf(p){ return p ? (p===p.toUpperCase()?'w':'b') : null; }

var START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

/* ---------- parseo de FEN ---------- */
function parseFEN(fen){
  var parts = (fen||START_FEN).trim().split(/\s+/);
  var rows = parts[0].split('/');
  var board = [];
  for(var r=0;r<8;r++){
    var line=[], row=rows[r]||'8';
    for(var j=0;j<row.length;j++){
      var ch=row[j];
      if(ch>='1'&&ch<='8'){ for(var k=0;k<+ch;k++) line.push(null); }
      else line.push(ch);
    }
    while(line.length<8) line.push(null);
    board.push(line.slice(0,8));
  }
  var castling = parts[2]||'-';
  return {
    board: board,
    turn: (parts[1]==='b')?'b':'w',
    castling: {
      K: castling.indexOf('K')>-1, Q: castling.indexOf('Q')>-1,
      k: castling.indexOf('k')>-1, q: castling.indexOf('q')>-1
    },
    ep: (parts[3] && parts[3]!=='-') ? sqToRC(parts[3]) : null,
    half: parseInt(parts[4]||'0',10),
    full: parseInt(parts[5]||'1',10)
  };
}

function cloneState(s){
  var b=new Array(8);
  for(var r=0;r<8;r++) b[r]=s.board[r].slice();
  return {
    board:b, turn:s.turn,
    castling:{K:s.castling.K,Q:s.castling.Q,k:s.castling.k,q:s.castling.q},
    ep: s.ep ? [s.ep[0],s.ep[1]] : null,
    half:s.half, full:s.full
  };
}

/* ---------- deltas de movimiento ---------- */
var KNIGHT=[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
var KING  =[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
var ROOK  =[[-1,0],[1,0],[0,-1],[0,1]];
var BISHOP=[[-1,-1],[-1,1],[1,-1],[1,1]];

/* ¿la casilla (r,c) está atacada por el color 'by'? */
function attacked(board,r,c,by){
  // peones
  var pr = (by==='w') ? r+1 : r-1;   // el peón atacante está una fila "detrás"
  for(var dc=-1;dc<=1;dc+=2){
    var cc=c+dc;
    if(inside(pr,cc)){
      var p=board[pr][cc];
      if(p && colorOf(p)===by && p.toLowerCase()==='p') return true;
    }
  }
  // caballo
  for(var i=0;i<8;i++){
    var nr=r+KNIGHT[i][0], nc=c+KNIGHT[i][1];
    if(inside(nr,nc)){ var q=board[nr][nc];
      if(q && colorOf(q)===by && q.toLowerCase()==='n') return true; }
  }
  // rey
  for(i=0;i<8;i++){
    var kr=r+KING[i][0], kc=c+KING[i][1];
    if(inside(kr,kc)){ var kp=board[kr][kc];
      if(kp && colorOf(kp)===by && kp.toLowerCase()==='k') return true; }
  }
  // deslizantes: torre/dama en líneas, alfil/dama en diagonales
  function ray(dirs,types){
    for(var d=0;d<dirs.length;d++){
      var rr=r+dirs[d][0], ccc=c+dirs[d][1];
      while(inside(rr,ccc)){
        var pp=board[rr][ccc];
        if(pp){
          if(colorOf(pp)===by && types.indexOf(pp.toLowerCase())>-1) return true;
          break;
        }
        rr+=dirs[d][0]; ccc+=dirs[d][1];
      }
    }
    return false;
  }
  if(ray(ROOK,['r','q'])) return true;
  if(ray(BISHOP,['b','q'])) return true;
  return false;
}

function findKing(board,color){
  var k = (color==='w')?'K':'k';
  for(var r=0;r<8;r++)for(var c=0;c<8;c++) if(board[r][c]===k) return [r,c];
  return null;
}

function inCheck(state,color){
  var k=findKing(state.board,color);
  if(!k) return false;
  return attacked(state.board,k[0],k[1], color==='w'?'b':'w');
}

/* ---------- generación de pseudo-movimientos ---------- */
function pseudoMoves(state){
  var b=state.board, turn=state.turn, moves=[];
  var me=turn, opp=(turn==='w')?'b':'w';
  function add(fr,fc,tr,tc,extra){
    var mv={from:[fr,fc],to:[tr,tc],piece:b[fr][fc],capture:b[tr][tc]||null};
    if(extra) for(var kk in extra) mv[kk]=extra[kk];
    moves.push(mv);
  }
  for(var r=0;r<8;r++)for(var c=0;c<8;c++){
    var p=b[r][c];
    if(!p || colorOf(p)!==me) continue;
    var t=p.toLowerCase();
    if(t==='p'){
      var dir=(me==='w')?-1:1;
      var startRow=(me==='w')?6:1;
      var promoRow=(me==='w')?0:7;
      // avance simple
      if(inside(r+dir,c) && !b[r+dir][c]){
        if(r+dir===promoRow){ ['q','r','b','n'].forEach(function(pr){ add(r,c,r+dir,c,{promotion:pr}); }); }
        else add(r,c,r+dir,c,{});
        // avance doble
        if(r===startRow && !b[r+2*dir][c]) add(r,c,r+2*dir,c,{double:true});
      }
      // capturas
      for(var dc=-1;dc<=1;dc+=2){
        var tr=r+dir, tc=c+dc;
        if(!inside(tr,tc)) continue;
        var target=b[tr][tc];
        if(target && colorOf(target)===opp){
          if(tr===promoRow){ ['q','r','b','n'].forEach(function(pr){ add(r,c,tr,tc,{promotion:pr}); }); }
          else add(r,c,tr,tc,{});
        } else if(state.ep && state.ep[0]===tr && state.ep[1]===tc){
          add(r,c,tr,tc,{ep:true});
        }
      }
    } else if(t==='n'){
      for(var i=0;i<8;i++){ var nr=r+KNIGHT[i][0],nc=c+KNIGHT[i][1];
        if(inside(nr,nc) && colorOf(b[nr][nc])!==me) add(r,c,nr,nc,{}); }
    } else if(t==='k'){
      for(i=0;i<8;i++){ var kr=r+KING[i][0],kc=c+KING[i][1];
        if(inside(kr,kc) && colorOf(b[kr][kc])!==me) add(r,c,kr,kc,{}); }
      // enroque
      var rank=(me==='w')?7:0;
      if(r===rank && c===4 && !attacked(b,rank,4,opp)){
        var rights=state.castling;
        // corto
        if((me==='w'?rights.K:rights.k) && !b[rank][5] && !b[rank][6] &&
           b[rank][7] && b[rank][7].toLowerCase()==='r' && colorOf(b[rank][7])===me &&
           !attacked(b,rank,5,opp) && !attacked(b,rank,6,opp)){
          add(r,c,rank,6,{castle:'K'});
        }
        // largo
        if((me==='w'?rights.Q:rights.q) && !b[rank][3] && !b[rank][2] && !b[rank][1] &&
           b[rank][0] && b[rank][0].toLowerCase()==='r' && colorOf(b[rank][0])===me &&
           !attacked(b,rank,3,opp) && !attacked(b,rank,2,opp)){
          add(r,c,rank,2,{castle:'Q'});
        }
      }
    } else {
      var dirs = (t==='r')?ROOK : (t==='b')?BISHOP : ROOK.concat(BISHOP);
      for(var d=0;d<dirs.length;d++){
        var rr=r+dirs[d][0], cc=c+dirs[d][1];
        while(inside(rr,cc)){
          if(!b[rr][cc]){ add(r,c,rr,cc,{}); }
          else { if(colorOf(b[rr][cc])===opp) add(r,c,rr,cc,{}); break; }
          rr+=dirs[d][0]; cc+=dirs[d][1];
        }
      }
    }
  }
  return moves;
}

/* aplica un movimiento y devuelve un NUEVO estado */
function makeMove(state, mv){
  var s=cloneState(state);
  var b=s.board;
  var fr=mv.from[0],fc=mv.from[1],tr=mv.to[0],tc=mv.to[1];
  var piece=b[fr][fc];
  var me=colorOf(piece);
  var isPawn = piece.toLowerCase()==='p';
  var isCapture = !!b[tr][tc] || mv.ep;

  // captura al paso: quitar el peón capturado
  if(mv.ep){ b[fr][tc]=null; }

  // mover la pieza
  b[tr][tc]=piece; b[fr][fc]=null;

  // coronación
  if(mv.promotion){
    b[tr][tc] = (me==='w') ? mv.promotion.toUpperCase() : mv.promotion.toLowerCase();
  }

  // enroque: mover la torre
  if(mv.castle){
    var rank=tr;
    if(mv.castle==='K'){ b[rank][5]=b[rank][7]; b[rank][7]=null; }
    else { b[rank][3]=b[rank][0]; b[rank][0]=null; }
  }

  // actualizar derechos de enroque
  if(piece==='K'){ s.castling.K=false; s.castling.Q=false; }
  if(piece==='k'){ s.castling.k=false; s.castling.q=false; }
  if(fr===7&&fc===7 || tr===7&&tc===7) s.castling.K=false;
  if(fr===7&&fc===0 || tr===7&&tc===0) s.castling.Q=false;
  if(fr===0&&fc===7 || tr===0&&tc===7) s.castling.k=false;
  if(fr===0&&fc===0 || tr===0&&tc===0) s.castling.q=false;

  // objetivo de captura al paso
  s.ep = mv.double ? [(fr+tr)/2, fc] : null;

  // relojes
  s.half = (isPawn||isCapture) ? 0 : s.half+1;
  if(me==='b') s.full++;
  s.turn = (me==='w')?'b':'w';
  return s;
}

/* movimientos LEGALES (filtra los que dejan al propio rey en jaque) */
function legalMoves(state){
  var pseudo=pseudoMoves(state), legal=[], me=state.turn;
  for(var i=0;i<pseudo.length;i++){
    var ns=makeMove(state,pseudo[i]);
    if(!inCheck(ns,me)) legal.push(pseudo[i]);
  }
  return legal;
}

/* estado de la partida */
function status(state){
  var moves=legalMoves(state);
  var check=inCheck(state,state.turn);
  if(moves.length===0){
    return check ? {over:true, result:'checkmate', winner:(state.turn==='w'?'b':'w')}
                 : {over:true, result:'stalemate', winner:null};
  }
  if(state.half>=100) return {over:true, result:'fifty', winner:null};
  return {over:false, result: check?'check':'ongoing', winner:null, check:check};
}

/* notación algebraica sencilla (SAN) en español */
function toSAN(state, mv){
  var LET={p:'',n:'C',b:'A',r:'T',q:'D',k:'R'};
  if(mv.castle) return mv.castle==='K' ? '0-0' : '0-0-0';
  var piece=mv.piece.toLowerCase();
  var dest=rcToSq(mv.to[0],mv.to[1]);
  var capture = !!mv.capture || mv.ep;
  var txt='';
  if(piece==='p'){
    if(capture) txt += 'abcdefgh'[mv.from[1]] + 'x';
    txt += dest;
    if(mv.promotion) txt += '=' + (LET[mv.promotion]||mv.promotion.toUpperCase());
  } else {
    txt = LET[piece];
    // desambiguación mínima: si otra pieza igual puede ir al mismo destino
    var others=legalMoves(state).filter(function(m){
      return m.piece===mv.piece && m.to[0]===mv.to[0] && m.to[1]===mv.to[1] &&
             !(m.from[0]===mv.from[0]&&m.from[1]===mv.from[1]);
    });
    if(others.length){
      var sameFile=others.some(function(m){return m.from[1]===mv.from[1];});
      txt += sameFile ? (8-mv.from[0]) : 'abcdefgh'[mv.from[1]];
    }
    if(capture) txt+='x';
    txt += dest;
  }
  var after=makeMove(state,mv), st=status(after);
  if(st.result==='checkmate') txt+='#';
  else if(inCheck(after,after.turn)) txt+='+';
  return txt;
}

/* ============================================================
   IA · minimax con poda alfa-beta
   ============================================================ */
var VAL={p:100,n:320,b:330,r:500,q:900,k:20000};

// tablas posición-pieza (perspectiva blancas, fila 0 = rank 8)
var PST={
  p:[[0,0,0,0,0,0,0,0],[50,50,50,50,50,50,50,50],[10,10,20,30,30,20,10,10],
     [5,5,10,25,25,10,5,5],[0,0,0,20,20,0,0,0],[5,-5,-10,0,0,-10,-5,5],
     [5,10,10,-20,-20,10,10,5],[0,0,0,0,0,0,0,0]],
  n:[[-50,-40,-30,-30,-30,-30,-40,-50],[-40,-20,0,0,0,0,-20,-40],
     [-30,0,10,15,15,10,0,-30],[-30,5,15,20,20,15,5,-30],
     [-30,0,15,20,20,15,0,-30],[-30,5,10,15,15,10,5,-30],
     [-40,-20,0,5,5,0,-20,-40],[-50,-40,-30,-30,-30,-30,-40,-50]],
  b:[[-20,-10,-10,-10,-10,-10,-10,-20],[-10,0,0,0,0,0,0,-10],
     [-10,0,5,10,10,5,0,-10],[-10,5,5,10,10,5,5,-10],
     [-10,0,10,10,10,10,0,-10],[-10,10,10,10,10,10,10,-10],
     [-10,5,0,0,0,0,5,-10],[-20,-10,-10,-10,-10,-10,-10,-20]],
  r:[[0,0,0,0,0,0,0,0],[5,10,10,10,10,10,10,5],[-5,0,0,0,0,0,0,-5],
     [-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],
     [-5,0,0,0,0,0,0,-5],[0,0,0,5,5,0,0,0]],
  q:[[-20,-10,-10,-5,-5,-10,-10,-20],[-10,0,0,0,0,0,0,-10],
     [-10,0,5,5,5,5,0,-10],[-5,0,5,5,5,5,0,-5],[0,0,5,5,5,5,0,-5],
     [-10,5,5,5,5,5,0,-10],[-10,0,5,0,0,0,0,-10],[-20,-10,-10,-5,-5,-10,-10,-20]],
  k:[[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],
     [-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],
     [-20,-30,-30,-40,-40,-30,-30,-20],[-10,-20,-20,-20,-20,-20,-20,-10],
     [20,20,0,0,0,0,20,20],[20,30,10,0,0,10,30,20]]
};

function evaluate(state){
  var b=state.board, score=0;
  for(var r=0;r<8;r++)for(var c=0;c<8;c++){
    var p=b[r][c]; if(!p) continue;
    var t=p.toLowerCase(), v=VAL[t];
    if(isWhite(p)) score += v + PST[t][r][c];
    else           score -= v + PST[t][7-r][c];
  }
  return score; // positivo = mejor para blancas
}

function orderMoves(moves){
  // capturas primero (MVV-LVA) para mejorar la poda
  return moves.sort(function(a,b){
    var av=(a.capture?VAL[a.capture.toLowerCase()]:0)-(a.piece?VAL[a.piece.toLowerCase()]/10:0);
    var bv=(b.capture?VAL[b.capture.toLowerCase()]:0)-(b.piece?VAL[b.piece.toLowerCase()]/10:0);
    return bv-av;
  });
}

function negamax(state, depth, alpha, beta, color){
  var moves=legalMoves(state);
  if(moves.length===0){
    if(inCheck(state,state.turn)) return -100000 - depth; // mate: cuanto antes, mejor
    return 0; // ahogado
  }
  if(depth===0) return color*evaluate(state);
  moves=orderMoves(moves);
  var best=-Infinity;
  for(var i=0;i<moves.length;i++){
    var val=-negamax(makeMove(state,moves[i]), depth-1, -beta, -alpha, -color);
    if(val>best) best=val;
    if(best>alpha) alpha=best;
    if(alpha>=beta) break;
  }
  return best;
}

/* Elige el mejor movimiento. difficulty: 1 fácil, 2 medio, 3 normal */
function bestMove(state, difficulty){
  var moves=legalMoves(state);
  if(moves.length===0) return null;
  var color=(state.turn==='w')?1:-1;

  // Nivel fácil: mezcla de aleatoriedad con algo de sensatez (profundidad 1)
  if(difficulty<=1){
    // 45% del tiempo juega una jugada razonable; si no, aleatoria (pero no regala mate)
    if(Math.random()<0.45){
      return pickBest(state,1,color,moves);
    }
    // aleatoria, pero prefiere capturar si hay algo gratis evidente
    var caps=moves.filter(function(m){return m.capture;});
    var pool=(caps.length && Math.random()<0.5)?caps:moves;
    return pool[Math.floor(Math.random()*pool.length)];
  }
  var depth = (difficulty>=3)?3:2;
  // un poco de variedad: entre las mejores casi-iguales, elige al azar
  return pickBest(state, depth, color, moves, difficulty>=3?0:25);
}

function pickBest(state, depth, color, moves, jitter){
  moves=orderMoves(moves);
  var scored=[];
  var alpha=-Infinity, beta=Infinity, best=-Infinity;
  for(var i=0;i<moves.length;i++){
    var val=-negamax(makeMove(state,moves[i]), depth-1, -beta, -alpha, -color);
    scored.push({mv:moves[i], val:val});
    if(val>best) best=val;
    if(val>alpha) alpha=val;
  }
  var margin=jitter||0;
  var top=scored.filter(function(s){return s.val>=best-margin;});
  return top[Math.floor(Math.random()*top.length)].mv;
}

/* ---------- API pública ---------- */
var Chess = {
  START_FEN: START_FEN,
  parseFEN: parseFEN,
  cloneState: cloneState,
  legalMoves: legalMoves,
  makeMove: makeMove,
  inCheck: inCheck,
  status: status,
  toSAN: toSAN,
  evaluate: evaluate,
  bestMove: bestMove,
  sqToRC: sqToRC,
  rcToSq: rcToSq,
  colorOf: colorOf,
  isWhite: isWhite,
  // busca en una lista de movimientos legales el que va de/hacia dadas casillas
  findMove: function(state, from, to){
    var ms=legalMoves(state);
    return ms.filter(function(m){
      return m.from[0]===from[0]&&m.from[1]===from[1]&&m.to[0]===to[0]&&m.to[1]===to[1];
    });
  }
};

global.Chess = Chess;
})(typeof window!=='undefined'?window:this);
