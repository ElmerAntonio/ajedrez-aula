/* ============================================================
   Ajedrez en el Aula · Tablero interactivo
   Componente reutilizable que dibuja un tablero jugable sobre
   el motor de Chess (assets/chess.js). Click para seleccionar,
   click para mover. Muestra jugadas legales y coronación.
   ============================================================ */
(function(global){
'use strict';
var FILL={k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟'};
var OUTL={k:'♔',q:'♕',r:'♖',b:'♗',n:'♘',p:'♙'};

function el(tag,cls){ var e=document.createElement(tag); if(cls)e.className=cls; return e; }

function ChessBoard(container, opts){
  opts=opts||{};
  this.box=container;
  this.state=Chess.parseFEN(opts.fen);
  this.flip=!!opts.flip;                     // ver desde las negras
  this.interactive=opts.interactive!==false; // permite jugar
  this.allowedSide=opts.allowedSide||null;   // 'w','b' o null (ambos)
  this.onMove=opts.onMove||function(){};      // callback(move, san, state)
  this.onDrop=opts.onDrop||null;              // valida drop en modo práctica
  this.sel=null;                              // casilla seleccionada [r,c]
  this.legal=[];                              // jugadas legales de la selección
  this.lastMove=null;
  this.pendingPromo=null;
  this._build();
  this.render();
}

ChessBoard.prototype._build=function(){
  var self=this;
  this.box.classList.add('cb');
  if(this.flip) this.box.classList.add('flip');
  this.box.innerHTML='';
  var g=el('div','grid8'); this.grid=g;
  this.cells={};
  for(var r=0;r<8;r++)for(var c=0;c<8;c++){
    var sq=el('div','sq '+((r+c)%2===0?'lt':'dk'));
    sq.dataset.r=r; sq.dataset.c=c;
    (function(rr,cc){ sq.addEventListener('click',function(){ self._click(rr,cc); }); })(r,c);
    this.cells[r+'-'+c]=sq;
    g.appendChild(sq);
  }
  this.box.appendChild(g);
  // coordenadas
  for(var i=0;i<8;i++){
    var f=el('div','coord'); f.textContent='abcdefgh'[i];
    f.style.cssText+=';left:calc(4.4% + '+((i+0.5)*11.4)+'%);bottom:.7%;transform:translateX(-50%)'+(this.flip?';rotate:180deg':'');
    this.box.appendChild(f);
    var n=el('div','coord'); n.textContent=(8-i);
    n.style.cssText+=';top:calc(4.4% + '+((i+0.5)*11.4)+'%);left:1.2%;transform:translateY(-50%)'+(this.flip?';rotate:180deg':'');
    this.box.appendChild(n);
  }
  // capa de coronación
  var promo=el('div','promo');
  var opts=el('div','opts');
  ['q','r','b','n'].forEach(function(p){
    var btn=el('button'); btn.type='button'; btn.textContent=OUTL[p];
    btn.addEventListener('click',function(){ self._doPromo(p); });
    opts.appendChild(btn);
  });
  promo.appendChild(opts); this.box.appendChild(promo); this.promoEl=promo;
};

ChessBoard.prototype._pieceEl=function(code){
  var e=el('div','pc'+(code===code.toLowerCase()?' blk':''));
  var t=code.toLowerCase();
  e.innerHTML='<span class="f">'+FILL[t]+'</span><span class="o">'+OUTL[t]+'</span>';
  return e;
};

ChessBoard.prototype.render=function(){
  // limpiar piezas y marcas
  Array.prototype.slice.call(this.grid.querySelectorAll('.pc')).forEach(function(p){p.remove();});
  for(var k in this.cells) this.cells[k].className='sq '+((+k.split('-')[0]+ +k.split('-')[1])%2===0?'lt':'dk');
  // piezas
  var b=this.state.board;
  for(var r=0;r<8;r++)for(var c=0;c<8;c++){
    var code=b[r][c]; if(!code) continue;
    var pc=this._pieceEl(code);
    pc.style.left=(c*12.5)+'%'; pc.style.top=(r*12.5)+'%';
    this.grid.appendChild(pc);
  }
  // última jugada
  if(this.lastMove){
    this._mark(this.lastMove.from,'last'); this._mark(this.lastMove.to,'last');
  }
  // jaque
  var st=Chess.status(this.state);
  if(st.check || st.result==='checkmate'){
    var kColor=this.state.turn;
    var kr,kc,K=(kColor==='w')?'K':'k';
    for(r=0;r<8;r++)for(c=0;c<8;c++) if(b[r][c]===K){kr=r;kc=c;}
    if(kr!=null) this._mark([kr,kc],'chk');
  }
  // selección + pistas
  if(this.sel){
    this._mark(this.sel,'sel');
    var self=this;
    this.legal.forEach(function(m){
      var cell=self.cells[m.to[0]+'-'+m.to[1]];
      cell.classList.add('hint');
      if(m.capture||m.ep) cell.classList.add('cap');
    });
  }
};

ChessBoard.prototype._mark=function(rc,cls){
  var cell=this.cells[rc[0]+'-'+rc[1]]; if(cell) cell.classList.add(cls);
};

ChessBoard.prototype._click=function(r,c){
  if(!this.interactive || this.pendingPromo) return;
  var st=Chess.status(this.state);
  if(st.over) return;
  var b=this.state.board, p=b[r][c];
  // ¿es mi turno permitido?
  if(this.allowedSide && this.state.turn!==this.allowedSide) return;

  if(this.sel){
    var match=this.legal.filter(function(m){return m.to[0]===r&&m.to[1]===c;});
    if(match.length){
      if(match.length>1 && match[0].promotion){ // coronación: pedir pieza
        this.pendingPromo={r:r,c:c,options:match};
        this.promoEl.classList.add('on');
        return;
      }
      this._apply(match[0]);
      return;
    }
    // reseleccionar otra pieza propia
    if(p && Chess.colorOf(p)===this.state.turn){ this._select(r,c); return; }
    this.sel=null; this.legal=[]; this.render(); return;
  }
  if(p && Chess.colorOf(p)===this.state.turn) this._select(r,c);
};

ChessBoard.prototype._select=function(r,c){
  this.sel=[r,c];
  this.legal=Chess.legalMoves(this.state).filter(function(m){
    return m.from[0]===r&&m.from[1]===c;
  });
  this.render();
};

ChessBoard.prototype._doPromo=function(piece){
  if(!this.pendingPromo) return;
  var mv=this.pendingPromo.options.filter(function(m){return m.promotion===piece;})[0];
  this.promoEl.classList.remove('on');
  this.pendingPromo=null;
  if(mv) this._apply(mv);
};

ChessBoard.prototype._apply=function(mv){
  // modo práctica: validar antes de aplicar
  if(this.onDrop){
    var ok=this.onDrop(mv, this.state);
    if(ok===false){ this.sel=null; this.legal=[]; this.render(); return; }
  }
  var san=Chess.toSAN(this.state, mv);
  this.state=Chess.makeMove(this.state, mv);
  this.lastMove=mv; this.sel=null; this.legal=[];
  this.render();
  this.onMove(mv, san, this.state);
};

/* API para uso externo */
ChessBoard.prototype.setState=function(fen){
  this.state=Chess.parseFEN(fen);
  this.sel=null; this.legal=[]; this.lastMove=null; this.pendingPromo=null;
  this.promoEl.classList.remove('on');
  this.render();
};
ChessBoard.prototype.applyMove=function(mv){ // aplica sin interacción (jugada de la IA)
  this.state=Chess.makeMove(this.state, mv);
  this.lastMove=mv; this.sel=null; this.legal=[];
  this.render();
};
ChessBoard.prototype.setFlip=function(v){
  this.flip=!!v;
  this.box.classList.toggle('flip',this.flip);
  // reorientar coordenadas
  Array.prototype.slice.call(this.box.querySelectorAll('.coord')).forEach(function(el){
    el.style.rotate=v?'180deg':'0deg';
  });
  this.render();
};
ChessBoard.prototype.lock=function(v){ this.interactive=!v; };

global.ChessBoard=ChessBoard;
})(typeof window!=='undefined'?window:this);
