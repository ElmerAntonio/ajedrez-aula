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
| **`practicas.html`** | **36 ejercicios** en 3 niveles reales (fácil, medio, difícil) tomados de un banco verificado y **barajados** para que no se repitan, **más un modo de notación**. Con pistas, solución y verificación automática, y un **Modo Foco Socrático**. | Alumnos |
| **`estrategias.html`** | **Ocho tácticas** (con **clips animados** del movimiento), **nociones de final** (oposición, peón pasado), **escuelas históricas** (romántica, clásica, hipermoderna, moderna) y planes de medio juego, más una **prueba interactiva con selector de dificultad**, clips y **Modo Foco Socrático**. | Alumnos y maestros |
| **`jugar.html`** | **Juega contra una IA** en tres niveles reales **o en modo 2 jugadores**. Con pistas, deshacer, lista de jugadas, capturas y **reloj**. | Todos |
| **`ruta.html`** | **Mi ruta:** un **árbol de habilidades tipo videojuego** que avanza de la iniciación a la competencia; cada nodo se ilumina al ganar su medalla, con **rango** y barra de progreso. | Alumnos |
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

## 🦉 Modo Foco Socrático

En **Prácticas** y **Estrategias** hay un **Modo Foco Socrático**: una pantalla
sin distracciones (se ocultan la barra, los títulos y el resto de la página) con
un **tutor basado en reglas** que, en lugar de dar la respuesta, hace
**preguntas cada vez más concretas** hasta que el estudiante encuentra la jugada.

- Las preguntas se escalonan según el **objetivo** del ejercicio (capturar, dar
  jaque, dar mate, mejorar) y su **tema táctico** (tenedor, clavada, brocheta,
  descubierto, ataque doble, pasillo, coronación, enroque…), leyendo la posición
  con el motor. El último paso muestra la jugada resaltada en el tablero.
- El tutor es un módulo reutilizable (`assets/socratic.js`) compartido por ambas
  páginas. No usa internet ni un modelo de lenguaje: son reglas y el motor local.
- En **Nivel** hay un **Modo concentración** (sin tutor ni pistas, a propósito):
  quita las distracciones sin comprometer el rigor del test.

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
├── ruta.html           Mi ruta (árbol de habilidades tipo videojuego)
├── arbitraje.html      Prácticas de árbitro
├── imprimibles.html    Materiales para imprimir
├── nivel.html          Test de nivel
├── assets/
│   ├── theme.css       Tema visual compartido + animaciones
│   ├── chess.js        Motor de ajedrez + IA (sin dependencias)
│   ├── puzzles.js      Banco de 36 ejercicios verificados con el motor
│   ├── board.js        Tablero interactivo + confeti
│   ├── socratic.js     Tutor Socrático reutilizable (Prácticas y Estrategias)
│   ├── i18n-puzzles.js Traducción EN del banco de ejercicios (compartida)
│   ├── guia-i18n.js    Traducción EN de las 40 láminas de la guía
│   └── app.js          Rol, medallas, navegación, idioma y accesibilidad
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
- **Mi ruta** (`ruta.html`) muestra esas medallas como un **árbol de habilidades
  tipo videojuego**: cada nodo se ilumina al conseguir su medalla y el progreso
  otorga un **rango** (de Aprendiz a Gran maestro escolar).
- El rol y las medallas se guardan **solo en tu dispositivo** (almacenamiento
  local del navegador). **No se envía nada a ningún servidor** y no hace falta
  cuenta.

## 🌐 Idioma e interfaz

- **Español / Inglés (todo el sitio):** botón 🌐 en la barra que traduce **la
  plataforma completa, página por página** —incluidos los textos que genera el
  JavaScript (cuestionarios, planificador, rangos, estados de la partida)—.
  Funciona con un **motor de traducción por diccionario** (`PAGE_I18N` por
  página + diccionarios compartidos); el español sigue siendo el idioma por
  defecto y la preferencia se recuerda.
- **Logo propio** (caballo en un escudo verde) como favicon del navegador y
  marca en la barra.
- **Animación de contenido** que aparece suavemente al desplazarse, y **clips
  animados** en Estrategias que muestran cómo se mueve la pieza de cada táctica
  (siempre hacia adelante, partiendo de la casilla de origen).
- **Tarjetas que giran**: en «Aprende» las piezas se voltean para mostrar su
  nombre y valor; en «Pedagogía» las tarjetas de método **se viran** y muestran
  el guion paso a paso completo con letra legible.
- **Avance automático**: en el test de nivel y en árbitro, una respuesta
  correcta pasa sola a la siguiente; una incorrecta se queda para que leas el
  porqué antes de continuar.
- Tipografía más grande y legible en computadora; las piezas de los tableros
  de ejemplo se dimensionan respecto al tablero (no a la pantalla).

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
