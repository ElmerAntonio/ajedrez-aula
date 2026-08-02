# ♞ Ajedrez en el Aula

**Plataforma educativa libre para enseñar y aprender ajedrez en la escuela.**
Pensada para maestros que nunca han dado una clase de ajedrez y para alumnos que
mueven su primera pieza — desde CEFACEI hasta 9.° grado.

Todo funciona en el navegador: **sin cuenta, sin costo y, una vez cargada la
página, sin necesidad de internet.** Funciona igual en la computadora y en el
celular.

> [!IMPORTANT]
> ### 📌 Este material es solo para enseñar y educar
> - **No acredita nada.** No otorga certificados, títulos, notas oficiales ni
>   reconocimiento de ningún tipo. Su único propósito es didáctico y de práctica.
> - Es **gratuito y libre**: cualquiera puede usarlo, copiarlo y compartirlo.
> - Se **publica y aloja con GitHub** (GitHub Pages). El código es abierto.
> - **No pide datos personales.** Nada de lo que se hace en el sitio se guarda
>   ni se envía a ningún servidor: todo ocurre dentro del navegador.

---

## 🧭 Secciones

| Página | Para qué sirve | Dirigido a |
|---|---|---|
| **`index.html`** | Portal de inicio que reúne todo. | Todos |
| **`guia.html`** | Guía docente: presentación de 40 láminas con el tablero, las piezas, las reglas, las Leyes FIDE y cómo explicarlo con palabras que los niños entienden. Incluye tableros animados, plan de 12 clases y evaluación sin exámenes. | Maestros |
| **`practicas.html`** | 15 ejercicios interactivos de **fácil a normal**: mover piezas, capturar, tenedores y mate en una jugada. Con pistas, solución y verificación automática. | Alumnos |
| **`estrategias.html`** | Las estrategias y tácticas que ganan partidas (centro, desarrollo, tenedor, clavada, brocheta, mate del pasillo) con una **prueba interactiva** para aplicarlas. | Alumnos y maestros |
| **`jugar.html`** | **Juega contra una IA** integrada en tres niveles (fácil, medio, normal). Con pistas, deshacer, lista de jugadas y piezas capturadas. | Todos |
| **`nivel.html`** | Test de 8 preguntas que **verifica tu nivel** (principiante, intermedio o avanzado) y recomienda qué practicar. | Alumnos |

---

## 🤖 ¿Cómo funciona la IA?

No usa internet ni un modelo de lenguaje. Es un **motor de ajedrez clásico**
escrito desde cero en JavaScript (`assets/chess.js`) que:

1. Genera **todos los movimientos legales** (incluye enroque, captura al paso,
   coronación, detección de jaque, jaque mate y ahogado).
2. Busca con el algoritmo **minimax con poda alfa-beta**, mirando hasta 3
   jugadas de anticipación, y evalúa las posiciones por material y posición de
   las piezas.

Los tres niveles cambian cuánto «piensa» la IA:

- **Fácil** — juega rápido y a veces deja piezas a propósito, para que un
  principiante gane sus primeras partidas y no se desanime.
- **Medio** — piensa 2 jugadas hacia adelante.
- **Normal** — piensa 3 jugadas hacia adelante y elige la mejor.

El motor está verificado con pruebas **perft** estándar
(`perft(4) = 197 281` desde la posición inicial y la posición *Kiwipete*), que
es la forma habitual de comprobar que la generación de movimientos es correcta.

---

## 📁 Estructura del proyecto

```
ajedrez-aula/
├── index.html          Portal de inicio
├── guia.html           Guía docente (presentación de 40 láminas)
├── practicas.html      Ejercicios interactivos (fácil → normal)
├── estrategias.html    Estrategias + prueba interactiva
├── jugar.html          Jugar contra la IA
├── nivel.html          Test de nivel
├── assets/
│   ├── theme.css       Tema visual compartido
│   ├── chess.js        Motor de ajedrez + IA (sin dependencias)
│   └── board.js        Tablero interactivo reutilizable
└── README.md
```

No hay dependencias, ni paso de compilación, ni instalación. Son archivos
HTML, CSS y JavaScript que se abren directamente.

---

## 🚀 Cómo verlo

- **En línea:** con GitHub Pages, activando *Settings → Pages → Branch: main*.
  El sitio queda disponible en `https://elmerantonio.github.io/ajedrez-aula/`.
- **En tu computadora:** descarga el repositorio y abre `index.html` en
  cualquier navegador. (Para que carguen `assets/`, ábrelo con un servidor
  local simple, por ejemplo `python3 -m http.server`, o simplemente sube todo
  a GitHub Pages.)

---

## 📱 Accesibilidad y diseño responsive

- Se adapta a pantallas de celular, tableta y computadora.
- Respeta la preferencia del sistema de **reducir animaciones**.
- Los tableros usan piezas Unicode grandes y de alto contraste.
- Los textos están escritos en lenguaje sencillo, con analogías pensadas para
  niñas y niños.

---

## 🧑‍🏫 Créditos y licencia

Creado como recurso educativo libre para escuelas. Puedes usarlo, adaptarlo y
compartirlo con fines educativos. **Recuerda: es material de enseñanza, no
acredita ni certifica nada.**
