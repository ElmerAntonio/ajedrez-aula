/* ============================================================
   Ajedrez en el Aula · Banco de ejercicios verificados
   Cada posición y su solución fueron comprobadas con el motor
   (legalidad + resultado esperado). Se agrupan por nivel; cada
   una lleva su tema táctico para poder filtrarlas y variarlas.
   Formato: {lv, tema, t (título), d (consigna), h (pista),
             fen, sol:[[desde,hasta,(coronación)]], want}
   want ∈ 'capture' | 'check' | 'mate' | 'move'
   ============================================================ */
(function(global){
'use strict';
var P=[
/* ---------------- FÁCIL: mover y capturar ---------------- */
{lv:'facil',tema:'captura',t:'La torre captura',d:'Come el peón negro con la torre.',h:'La torre va en línea recta por su columna.',fen:'7k/8/8/3p4/8/8/3R4/7K w - - 0 1',sol:[['d2','d5']],want:'capture'},
{lv:'facil',tema:'captura',t:'El caballo come la dama',d:'Captura la dama negra con el caballo.',h:'El caballo salta en L: dos y una.',fen:'7k/8/4q3/8/3N4/8/8/7K w - - 0 1',sol:[['d4','e6']],want:'capture'},
{lv:'facil',tema:'captura',t:'El alfil por la diagonal',d:'Captura la torre negra con el alfil.',h:'El alfil no cambia de color de casilla.',fen:'7k/8/5r2/8/8/2B5/8/7K w - - 0 1',sol:[['c3','f6']],want:'capture'},
{lv:'facil',tema:'captura',t:'La dama come la torre',d:'Captura la torre negra con la dama.',h:'La dama va recto y en diagonal.',fen:'7k/8/8/3r4/8/8/3Q4/7K w - - 0 1',sol:[['d2','d5']],want:'capture'},
{lv:'facil',tema:'captura',t:'El peón come de lado',d:'Captura la dama negra con el peón.',h:'El peón avanza recto pero come en diagonal.',fen:'7k/8/8/3q4/4P3/8/8/7K w - - 0 1',sol:[['e4','d5']],want:'capture'},
{lv:'facil',tema:'coronacion',t:'Corona el peón',d:'Lleva el peón al final y hazlo dama.',h:'Al llegar arriba, el peón se transforma.',fen:'7k/P7/8/8/8/8/8/7K w - - 0 1',sol:[['a7','a8','q']],want:'move'},
{lv:'facil',tema:'jaque',t:'Da jaque con la dama',d:'Ataca al rey negro (dale jaque).',h:'Acércate al rey en línea o diagonal.',fen:'7k/8/8/8/8/8/6Q1/K7 w - - 0 1',sol:[['g2','g7'],['g2','g8']],want:'check'},
{lv:'facil',tema:'jaque',t:'La torre da jaque',d:'Da jaque al rey negro con la torre.',h:'Métete en la fila del rey.',fen:'4k3/8/8/8/8/8/8/R5K1 w - - 0 1',sol:[['a1','a8']],want:'check'},
{lv:'facil',tema:'captura',t:'El caballo atrapa la torre',d:'Captura la torre negra con el caballo.',h:'Busca el salto en L que llega a la torre.',fen:'7k/8/8/8/4r3/8/3N4/7K w - - 0 1',sol:[['d2','e4']],want:'capture'},
{lv:'facil',tema:'captura',t:'El alfil caza el caballo',d:'Captura el caballo negro con el alfil.',h:'Sigue la diagonal con el dedo.',fen:'7k/8/8/8/3n4/8/1B6/7K w - - 0 1',sol:[['b2','d4']],want:'capture'},
{lv:'facil',tema:'captura',t:'La dama por la diagonal larga',d:'Captura el alfil negro con la dama.',h:'La dama también se mueve en diagonal.',fen:'7k/8/8/8/8/2b5/8/Q6K w - - 0 1',sol:[['a1','c3']],want:'capture'},
{lv:'facil',tema:'captura',t:'El caballo muerde el peón',d:'Captura el peón negro con el caballo.',h:'Cae justo encima del peón.',fen:'7k/8/8/2p5/4N3/8/8/7K w - - 0 1',sol:[['e4','c5']],want:'capture'},
/* ---------------- MEDIO: tácticas de una jugada ---------------- */
{lv:'medio',tema:'tenedor',t:'Tenedor de caballo',d:'Ataca a la vez al rey y a la torre con un salto.',h:'Busca la casilla que da jaque y toca la torre.',fen:'4k3/8/8/5r2/4N3/8/8/7K w - - 0 1',sol:[['e4','d6']],want:'check'},
{lv:'medio',tema:'tenedor',t:'Tenedor real',d:'Salta atacando al rey y a la dama a la vez.',h:'Una casilla que toque las dos piezas.',fen:'2q3k1/8/2N5/8/8/8/8/6K1 w - - 0 1',sol:[['c6','e7']],want:'check'},
{lv:'medio',tema:'tenedor',t:'Tenedor que gana la dama',d:'Da jaque con el caballo y toca la dama.',h:'La casilla e6 mira al rey y a la dama.',fen:'3q1k2/8/8/2N5/8/8/8/6K1 w - - 0 1',sol:[['c5','e6']],want:'check'},
{lv:'medio',tema:'tenedor-peon',t:'Tenedor de peón',d:'Un peón ataca dos piezas. Captura la mayor.',h:'El peón come en diagonal: toma la dama.',fen:'7k/8/8/3q1r2/4P3/8/8/7K w - - 0 1',sol:[['e4','d5']],want:'capture'},
{lv:'medio',tema:'brocheta',t:'La brocheta',d:'Da jaque en la columna del rey; detrás cae la dama.',h:'Lleva la torre a la columna a.',fen:'q7/8/8/8/k7/6K1/8/7R w - - 0 1',sol:[['h1','a1']],want:'check'},
{lv:'medio',tema:'ataque-doble',t:'Ataque doble de dama',d:'Da jaque al rey y ataca la torre por otra línea.',h:'De5 toca al rey por una diagonal y a la torre por otra.',fen:'8/6k1/8/8/8/8/1r6/K3Q3 w - - 0 1',sol:[['e1','e5']],want:'check'},
{lv:'medio',tema:'ataque-doble',t:'Doble amenaza de dama',d:'Lleva la dama a d5: ataca el caballo y el alfil.',h:'Una casilla que mire a las dos piezas.',fen:'7k/8/8/1n6/8/5b2/8/3QK3 w - - 0 1',sol:[['d1','d5']],want:'move'},
{lv:'medio',tema:'descubierto',t:'Jaque descubierto',d:'Mueve el caballo capturando la dama y descubre la torre.',h:'El caballo se aparta y aparece la torre dando jaque.',fen:'4k3/8/8/2q5/4N3/8/8/4R2K w - - 0 1',sol:[['e4','c5']],want:'check'},
{lv:'medio',tema:'clavada',t:'Explota la clavada',d:'El caballo está clavado a la dama. Atácalo con el peón.',h:'Avanza el peón para amenazar el caballo.',fen:'3qk3/8/5n2/6B1/4P3/8/8/6K1 w - - 0 1',sol:[['e4','e5']],want:'move'},
{lv:'medio',tema:'pasillo',t:'Amenaza el pasillo',d:'Lleva la torre a la última fila y da jaque.',h:'La primera fila del rival puede ser su tumba.',fen:'7k/6pp/8/8/8/8/1r6/R6K w - - 0 1',sol:[['a1','a8']],want:'check'},
{lv:'medio',tema:'enroque',t:'Pon al rey a salvo',d:'Haz el enroque corto.',h:'El rey va dos casillas hacia la torre.',fen:'6k1/8/8/8/8/8/8/R3K2R w KQ - 0 1',sol:[['e1','g1']],want:'move'},
{lv:'medio',tema:'coronacion',t:'Corona capturando',d:'Captura en diagonal al coronar y consigue una dama.',h:'El peón come de lado justo al llegar arriba.',fen:'3r2k1/4P3/8/8/8/8/8/6K1 w - - 0 1',sol:[['e7','d8','q']],want:'capture'},
/* ---------------- DIFÍCIL: mate en una y táctica fuerte ---------------- */
{lv:'dificil',tema:'mate',t:'Mate del pasillo',d:'Da JAQUE MATE en una jugada.',h:'El rey está encerrado por sus peones.',fen:'6k1/5ppp/8/8/8/8/8/R6K w - - 0 1',sol:[['a1','a8']],want:'mate'},
{lv:'dificil',tema:'mate',t:'Mate de dama y rey',d:'Da JAQUE MATE en una jugada.',h:'Tu rey ya cuida las casillas de escape.',fen:'6k1/8/6K1/8/8/8/8/1Q6 w - - 0 1',sol:[['b1','b8']],want:'mate'},
{lv:'dificil',tema:'mate',t:'Mate en la esquina',d:'Da JAQUE MATE en una jugada.',h:'Empuja al rey contra el borde.',fen:'k7/8/1K6/8/8/8/8/7R w - - 0 1',sol:[['h1','h8']],want:'mate'},
{lv:'dificil',tema:'mate',t:'Mate de torre y rey',d:'Da JAQUE MATE en una jugada.',h:'El rey blanco quita las salidas; la torre remata.',fen:'6k1/R7/6K1/8/8/8/8/8 w - - 0 1',sol:[['a7','a8']],want:'mate'},
{lv:'dificil',tema:'mate',t:'Corona con mate',d:'Da JAQUE MATE coronando el peón.',h:'El peón se vuelve dama y remata.',fen:'6k1/4Pp1p/5K2/8/8/8/8/8 w - - 0 1',sol:[['e7','e8','q']],want:'mate'},
{lv:'dificil',tema:'mate',t:'Mate de la escalera',d:'Da JAQUE MATE con las dos torres en una jugada.',h:'Una torre corta la fila 7; la otra entra por la 8.',fen:'7k/1R6/8/8/8/8/8/R3K3 w - - 0 1',sol:[['a1','a8']],want:'mate'},
{lv:'dificil',tema:'mate',t:'Mate del caballo',d:'Da JAQUE MATE con el caballo en una jugada.',h:'El rey está ahogado por sus propias piezas.',fen:'6rk/6pp/7N/8/8/8/8/6K1 w - - 0 1',sol:[['h6','f7']],want:'mate'},
{lv:'dificil',tema:'mate',t:'Pasillo con muralla propia',d:'Da JAQUE MATE en una jugada.',h:'La torre entra por la última fila.',fen:'6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1',sol:[['a1','a8']],want:'mate'},
{lv:'dificil',tema:'mate',t:'Mate de dama apoyada',d:'Da JAQUE MATE en una jugada.',h:'Tu rey cubre las casillas de escape del rival.',fen:'6k1/6p1/6KP/8/8/8/8/1Q6 w - - 0 1',sol:[['b1','b8']],want:'mate'},
{lv:'dificil',tema:'mate',t:'Mate en la esquina con dama',d:'Da JAQUE MATE en una jugada con la dama.',h:'Tu rey defiende a la dama y le quita el hueco al rey rival.',fen:'7k/5K2/8/8/8/8/8/6Q1 w - - 0 1',sol:[['g1','g7']],want:'mate'},
{lv:'dificil',tema:'tenedor',t:'Gana la dama con tenedor',d:'Da jaque con el caballo tocando la dama.',h:'Aterriza donde amenaces al rey y a la dama.',fen:'3qk3/8/4N3/8/8/8/8/6K1 w - - 0 1',sol:[['e6','c7'],['e6','g7']],want:'check'},
{lv:'dificil',tema:'descubierto',t:'Descubierto que gana la dama',d:'Mueve el alfil dando jaque descubierto de la torre y gana la dama.',h:'El alfil se aparta con jaque; la torre atrapa la dama.',fen:'4k3/8/8/8/8/8/3qB3/4R1K1 w - - 0 1',sol:[['e2','a6'],['e2','b5'],['e2','c4'],['e2','d3'],['e2','f3'],['e2','g4'],['e2','h5']],want:'check'}
];
// índice por nivel
var BY={facil:[],medio:[],dificil:[]};
P.forEach(function(p){ if(BY[p.lv]) BY[p.lv].push(p); });
global.CHESS_PUZZLES={ all:P, byLevel:BY,
  tactic: P.filter(function(p){return p.lv!=='facil';}) };
})(typeof window!=='undefined'?window:this);
