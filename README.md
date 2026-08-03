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
| **`aprende.html`** | Para los más pequeños que aún no saben jugar: conocer las piezas, ver cómo se mueven, juegos de adivinar la ficha, de memoria (cartas) y **El caballo glotón** (capturar todos los peones). Colorido y con celebraciones. | Niños pequeños |
| **`guia.html`** | Guía docente: presentación de 40 láminas con el tablero, las piezas, las reglas, las Leyes FIDE y cómo explicarlo. Incluye tableros animados, plan de 12 clases y evaluación sin exámenes. | Maestros |
| **`pedagogia.html`** | **Once** maneras de enseñar (pasos, cuento, mini-juegos, ajedrez humano, descubrimiento, entre pares, gamificación, inteligencias múltiples, dificultad deseable, análisis de la partida, metacognición) con guion paso a paso, estilos de aprendizaje, **adaptaciones por contexto**, formación del maestro y un **planificador de clase** con plan imprimible. | Maestros |
| **`reglas.html`** | Referencia completa de todas las reglas en un solo lugar, con diagramas: tablero, movimientos, enroque, al paso, coronación, jaque, mate, tablas y reglas de competencia. | Todos |
| **`practicas.html`** | **36 ejercicios** en 3 niveles reales (fácil, medio, difícil) tomados de un banco verificado y **barajados** para que no se repitan, **más un modo de notación**. Con pistas, solución y verificación automática. | Alumnos |
| **`estrategias.html`** | **Ocho tácticas**, **nociones de final** (oposición, peón pasado), **escuelas históricas** (romántica, clásica, hipermoderna, moderna) y planes de medio juego, más una **prueba interactiva con selector de dificultad** que baraja muchas posiciones. | Alumnos y maestros |
| **`jugar.html`** | **Juega contra una IA** en tres niveles reales **o en modo 2 jugadores**. Con pistas, deshacer, lista de jugadas, capturas y **reloj**. | Todos |
| **`arbitraje.html`** | Prácticas de **árbitro**: banco de **17 casos** de torneo (8 al azar por sesión) con la regla FIDE que los respalda y la adaptación para primaria. | Estudiantes de 7.º–9.º |
| **`imprimibles.html`** | Materiales para **imprimir gratis**: tablero, fichas/cartas, planilla, hoja de actividad, **ficha del docente** (rúbrica + cotejo), **hoja de mini-juegos** y **diploma de participación**. | Maestros |
| **`nivel.html`** | Test **riguroso por áreas** (reglas, piezas, especiales, táctica, estrategia, finales, notación, competencia) con preguntas de dificultad creciente y retos en el tablero. Puntuación **ponderada** que ubica en **cinco niveles** (Principiante → Experto) con **desglose por área** y recomendaciones. | Alumnos |

---

## 🤖 ¿Cómo funciona la IA?

No usa internet ni un modelo de lenguaje. Es un **motor de ajedrez clásico**
escrito desde cero en JavaScript (`assets/chess.js`) que:

1. Genera **todos los movimientos legales** (incluye enroque, captura al paso,
   coronación, detección de jaque, jaque mate y ahogado).
2. Busca con el algoritmo **minimax con poda alfa-beta**, mirando hasta 3
   jugadas de anticipación, y evalúa las posiciones por material y posición de
   las piezas.

Los tres niveles son **reales** y distintos:

- **Fácil** — juega rápido y a veces deja piezas a propósito, para que un
  principiante gane sus primeras partidas y no se desanime.
- **Medio** — mira unas 3 jugadas hacia adelante con algo de variedad.
- **Difícil** — usa **profundización iterativa con límite de tiempo** (~1,8 s),
  **búsqueda de reposo (quiescence)** para no regalar piezas en los cambios y
  **extensión por jaque** para encontrar mates. Da pelea de verdad tanto a
  maestros como a alumnos.

El motor está verificado con pruebas **perft** estándar
(`perft(4) = 197 281` desde la posición inicial y la posición *Kiwipete*), que
es la forma habitual de comprobar que la generación de movimientos es correcta.

---

## 📁 Estructura del proyecto

```
ajedrez-aula/
├── index.html          Portal de inicio
├── aprende.html        Aprende jugando (niños pequeños)
├── guia.html           Guía docente (presentación de 40 láminas)
├── pedagogia.html      Métodos de enseñanza, contexto y planificador
├── reglas.html         Reglamento completo (referencia)
├── practicas.html      Ejercicios interactivos + notación
├── estrategias.html    Estrategias + prueba interactiva
├── jugar.html          Jugar contra la IA (con reloj)
├── arbitraje.html      Prácticas de árbitro
├── imprimibles.html    Materiales para imprimir
├── nivel.html          Test de nivel
├── assets/
│   ├── theme.css       Tema visual compartido + animaciones
│   ├── chess.js        Motor de ajedrez + IA (sin dependencias)
│   ├── puzzles.js      Banco de 36 ejercicios verificados con el motor
│   ├── board.js        Tablero interactivo + confeti
│   └── app.js          Rol, medallas, navegación y accesibilidad
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

## 👤 Personalización por rol y progreso

- Al entrar por primera vez, el sitio pregunta **si eres maestro, estudiante o
  niño pequeño** y **reacomoda el inicio y la navegación** según la respuesta.
  Puedes cambiar de rol cuando quieras desde el botón de la barra superior.
- Cada rol ve **solo las secciones apropiadas**: el estudiante y el niño no ven
  el material docente (guía, pedagogía, imprimibles); el niño ve únicamente lo
  esencial (aprender, jugar, practicar, reglas).
- La barra de navegación se **colapsa en un menú (☰)** en pantallas pequeñas.
- Un sistema de **medallas** (gamificación) premia cada logro: resolver un
  ejercicio, acertar una notación, aplicar una estrategia, ganarle a la IA,
  completar el test de nivel, aprobar las prácticas de árbitro, etc.
- El rol y las medallas se guardan **solo en tu dispositivo** (almacenamiento
  local del navegador). **No se envía nada a ningún servidor** y no hace falta
  cuenta.

## ♿ Accesibilidad y diseño responsive

Aplicando las pautas **WCAG 2.2**:

- **Operable por teclado:** los tableros se recorren con Tab y se juega con
  Enter o la barra espaciadora; el modal de rol se cierra con Escape y atrapa
  el foco correctamente.
- **Foco visible** con contraste suficiente en casillas, botones y enlaces.
- **Lectores de pantalla:** cada casilla anuncia su coordenada y la pieza que
  contiene (por ejemplo, «e4, dama blanca») mediante etiquetas ARIA. Hay un
  enlace «Saltar al contenido».
- Respeta la preferencia del sistema de **reducir animaciones**.
- Se adapta a pantallas de celular, tableta y computadora.
- Textos en lenguaje sencillo, con analogías pensadas para niñas y niños.

---

## 🔜 Pendiente (roadmap)

- **Lengua materna (ngäbere u otras):** el sitio está preparado para rotular en
  otro idioma, pero las traducciones deben hacerse **con hablantes nativos**;
  no se incluyen palabras inventadas. Queda pendiente para trabajarlo con la
  comunidad.
- **Videos:** por ahora no se incluyen (requerirían alojamiento externo). Las
  explicaciones son con texto, diagramas y tableros animados.
- Prácticas de mate en dos jugadas y guardado de partidas.

## 🧑‍🏫 Créditos y licencia

Creado como recurso educativo libre para escuelas. Puedes usarlo, adaptarlo y
compartirlo con fines educativos. **Recuerda: es material de enseñanza, no
acredita ni certifica nada.**
