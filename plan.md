
# 🎬 Remotion Multi-Track Video Renderer — Diseño del Sistema

## Visión General

Un **renderizador de vídeo data-driven** basado en Remotion que funciona como un editor multi-track controlado enteramente por una estructura de datos JSON. El sistema se divide en dos partes completamente desacopladas:

- **Python (Productor)**: Genera assets (imágenes, vídeos, audios, animaciones Lottie) y compone la estructura de datos (timeline JSON) que describe el vídeo completo.
- **Remotion (Renderizador)**: Recibe el JSON + assets y produce el vídeo final. No tiene lógica de negocio, solo renderiza lo que el JSON le dice.

---

## Arquitectura General

```
┌─────────────────────────────────────────────────────┐
│                    PYTHON (Productor)                │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │ Genera   │  │ Genera   │  │ Genera timeline   │  │
│  │ imágenes │  │ audios/  │  │ JSON (estructura  │  │
│  │ con IA   │  │ vídeos   │  │ multi-track)      │  │
│  └────┬─────┘  └────┬─────┘  └────────┬──────────┘  │
│       │              │                 │             │
│       │    (Opcionalmente genera       │             │
│       │     archivos .tsx custom       │             │
│       │     o animaciones Lottie)      │             │
└───────┼──────────────┼─────────────────┼─────────────┘
        │              │                 │
        ▼              ▼                 ▼
┌─────────────────────────────────────────────────────┐
│              SISTEMA DE ARCHIVOS                    │
│                                                     │
│  remotion-renderer/                                 │
│  ├── public/projects/{nombre}/                      │
│  │   ├── assets/          ← imágenes, vídeos, mp3  │
│  │   ├── animations/      ← archivos Lottie .json  │
│  │   └── timeline.json    ← EL CONTRATO DE DATOS   │
│  └── src/custom/{nombre}/ ← componentes .tsx custom │
│                                                     │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│              REMOTION (Renderizador)                 │
│                                                     │
│  1. Lee timeline.json                               │
│  2. Bundlea (incluyendo custom .tsx si existen)      │
│  3. Renderiza frame a frame                         │
│  4. Codifica vídeo (H.264 MP4)                      │
│                                                     │
│  Comando: npx remotion render {nombre} output.mp4   │
└─────────────────────────────────────────────────────┘
```

---

## Modelo de Datos: Timeline JSON (Multi-Track)

El JSON es el **contrato central** entre Python y Remotion. Describe el vídeo como una lista de **tracks** (pistas), cada una con **clips**.

### Schema completo:

```json
{
  "version": "1.0",
  "fps": 30,
  "width": 1080,
  "height": 1920,
  "durationMs": 600000,
  
  "tracks": [
    {
      "id": "background",
      "type": "visual",
      "zIndex": 0,
      "clips": [
        {
          "type": "image",
          "src": "assets/scene1.png",
          "startMs": 0,
          "endMs": 10000,
          "fit": "cover",
          "enterTransition": {"type": "blur", "durationMs": 1000},
          "exitTransition": {"type": "fade", "durationMs": 800},
          "animations": [
            {"type": "scale", "from": 1.0, "to": 1.2, "startMs": 0, "endMs": 10000}
          ]
        },
        {
          "type": "video",
          "src": "assets/clip1.mp4",
          "startMs": 10000,
          "endMs": 25000,
          "trimStartMs": 0,
          "trimEndMs": 15000,
          "volume": 0,
          "enterTransition": {"type": "slide", "direction": "left", "durationMs": 500},
          "exitTransition": {"type": "blur", "durationMs": 1000}
        },
        {
          "type": "image",
          "src": "assets/scene2.png",
          "startMs": 25000,
          "endMs": 40000,
          "animations": [
            {"type": "scale", "from": 1.3, "to": 1.0, "startMs": 0, "endMs": 15000}
          ]
        }
      ]
    },
    
    {
      "id": "overlays",
      "type": "visual",
      "zIndex": 1,
      "clips": [
        {
          "type": "component",
          "component": "chapter-title",
          "startMs": 0,
          "endMs": 4000,
          "props": {
            "title": "Introducción",
            "subtitle": "¿Qué es la inflación?",
            "color": "#FFD700"
          }
        },
        {
          "type": "component",
          "component": "line-chart",
          "startMs": 15000,
          "endMs": 25000,
          "props": {
            "data": [2.1, 3.4, 5.2, 8.1, 6.5, 3.2],
            "labels": ["2019", "2020", "2021", "2022", "2023", "2024"],
            "title": "IPC España",
            "color": "#FF4444"
          }
        },
        {
          "type": "component",
          "component": "chapter-title",
          "startMs": 25000,
          "endMs": 29000,
          "props": {
            "title": "Capítulo 2",
            "color": "#4488FF"
          }
        },
        {
          "type": "lottie",
          "src": "animations/confetti.json",
          "startMs": 55000,
          "endMs": 58000
        },
        {
          "type": "html-animated",
          "startMs": 35000,
          "endMs": 40000,
          "html": "<div id='fact'><span>💡</span><p>¿Sabías que...?</p></div>",
          "css": "#fact { display:flex; gap:16px; align-items:center; background:rgba(0,0,0,0.7); padding:20px 40px; border-radius:12px; color:white; font-size:48px; }",
          "animations": [
            {"target": "#fact", "property": "opacity", "keyframes": [{"frame": 0, "value": 0}, {"frame": 15, "value": 1}]},
            {"target": "#fact", "property": "transform", "keyframes": [{"frame": 0, "value": "translateY(50px)"}, {"frame": 20, "value": "translateY(0px)"}]}
          ]
        },
        {
          "type": "component",
          "component": "custom:GraficoIBEX",
          "startMs": 42000,
          "endMs": 52000,
          "props": {
            "data": [9200, 9500, 8800, 10200, 11500]
          }
        }
      ]
    },
    
    {
      "id": "subtitles",
      "type": "visual",
      "zIndex": 2,
      "clips": [
        {
          "type": "text",
          "text": "La inflación es",
          "startMs": 1000,
          "endMs": 3000,
          "position": "bottom",
          "style": {
            "fontSize": 52,
            "color": "white",
            "fontFamily": "BreeSerif",
            "textShadow": "2px 2px 4px rgba(0,0,0,0.8)"
          }
        }
      ]
    },
    
    {
      "id": "narration",
      "type": "audio",
      "clips": [
        {
          "type": "audio",
          "src": "assets/narration.mp3",
          "startMs": 0,
          "endMs": 600000,
          "volume": 1.0
        }
      ]
    },
    
    {
      "id": "music",
      "type": "audio",
      "clips": [
        {
          "type": "audio",
          "src": "assets/bgm.mp3",
          "startMs": 0,
          "endMs": 600000,
          "volume": 0.15,
          "fadeIn": 2000,
          "fadeOut": 3000
        }
      ]
    }
  ]
}
```

---

## Tipos de Clips Soportados

### Clips Visuales (en tracks `type: "visual"`)

| Tipo | Descripción | Fuente | Cuándo usarlo |
|---|---|---|---|
| `image` | Imagen estática con animaciones Ken Burns | Archivo .png/.jpg | Fondos, slides |
| `video` | Clip de vídeo con trim | Archivo .mp4/.webm | B-roll, clips |
| `text` | Texto con estilo y posición | Inline en JSON | Subtítulos, labels |
| `component` | Componente React del registry global | Pre-definido en Remotion | Títulos de capítulo, gráficas, callouts, counters... |
| `custom:X` | Componente React del proyecto | Archivo .tsx generado | Animaciones one-off muy custom |
| `lottie` | Animación Lottie | Archivo .json | Animaciones complejas, iconos animados |
| `html-animated` | HTML+CSS con keyframes | Inline en JSON | Animaciones simples one-off sin crear archivos |

### Clips de Audio (en tracks `type: "audio"`)

| Tipo | Descripción | Fuente |
|---|---|---|
| `audio` | Pista de audio con volumen y fade | Archivo .mp3/.wav |

---

## Transiciones Disponibles

Aplicables como `enterTransition` o `exitTransition` en cualquier clip visual:

| Transición | Descripción | Parámetros |
|---|---|---|
| `blur` | Desenfoque progresivo | `durationMs` |
| `fade` | Fundido de opacidad | `durationMs` |
| `slide` | Deslizamiento lateral | `durationMs`, `direction` (left/right/up/down) |
| `wipe` | Cortina/barrido | `durationMs`, `direction` |
| `none` | Corte directo | — |

*(Implementables con `@remotion/transitions` o CSS custom)*

---

## Animaciones de Clip

Aplicables a clips de imagen/vídeo para efectos durante su duración:

| Animación | Descripción |
|---|---|
| `scale` | Zoom in/out progresivo (efecto Ken Burns) |

*(Extensible a: `rotate`, `translateX`, `translateY`, `opacity`...)*

---

## Sistema de Componentes (Registry)

```
┌──────────────────────────────────────────────────┐
│              COMPONENT REGISTRY                  │
│                                                  │
│  Globales (reutilizables):                       │
│  ├── chapter-title    → Título de capítulo       │
│  ├── line-chart       → Gráfica de líneas        │
│  ├── bar-chart        → Gráfica de barras        │
│  ├── callout-box      → Caja informativa         │
│  ├── counter          → Número animado           │
│  ├── progress-bar     → Barra de progreso        │
│  └── quote            → Cita textual             │
│                                                  │
│  Por proyecto (custom):                          │
│  └── custom:{nombre}  → Cargado dinámicamente    │
│       desde src/custom/{proyecto}/{nombre}.tsx    │
│                                                  │
│  Lottie:                                         │
│  └── lottie           → Reproductor de Lottie    │
│                                                  │
│  HTML inline:                                    │
│  └── html-animated    → HTML+CSS con keyframes   │
└──────────────────────────────────────────────────┘
```

---

## Estructura de Archivos del Renderer

```
remotion-renderer/
├── src/
│   ├── index.ts                    # Entry point de Remotion
│   ├── Root.tsx                    # Descubre proyectos y registra composiciones
│   ├── components/
│   │   ├── MultiTrackRenderer.tsx  # Componente principal: lee timeline, renderiza tracks
│   │   ├── TrackRenderer.tsx       # Renderiza un track (visual o audio)
│   │   ├── clips/
│   │   │   ├── ImageClip.tsx       # Renderiza clip de imagen
│   │   │   ├── VideoClip.tsx       # Renderiza clip de vídeo (<OffthreadVideo>)
│   │   │   ├── AudioClip.tsx       # Renderiza clip de audio
│   │   │   ├── TextClip.tsx        # Renderiza clip de texto
│   │   │   ├── ComponentClip.tsx   # Renderiza componente del registry
│   │   │   ├── LottieClip.tsx      # Renderiza animación Lottie
│   │   │   └── HtmlAnimatedClip.tsx # Renderiza HTML+CSS con keyframes
│   │   ├── library/                # Componentes animados reutilizables
│   │   │   ├── ChapterTitle.tsx
│   │   │   ├── LineChart.tsx
│   │   │   ├── CalloutBox.tsx
│   │   │   └── Counter.tsx
│   │   └── transitions/            # Lógica de transiciones
│   │       └── TransitionEngine.tsx
│   ├── custom/                     # Componentes custom por proyecto
│   │   └── {proyecto}/
│   │       └── MiAnimacion.tsx     # ← Generado por Python/IA
│   └── lib/
│       ├── types.ts                # Schema Zod del timeline
│       ├── constants.ts
│       ├── registry.ts             # Registry de componentes
│       └── utils.ts
├── public/
│   └── projects/
│       └── {proyecto}/
│           ├── assets/             # Imágenes, vídeos, audios
│           ├── animations/         # Archivos Lottie
│           └── timeline.json       # EL JSON
├── package.json
├── remotion.config.ts
└── tsconfig.json
```

---

## Flujo de Ejecución Completo

```
   PASO 1: Python genera todo
   ─────────────────────────
   python generate_video.py --topic "Inflación en España"
   
   → Genera imágenes con IA (DALL-E, Stable Diffusion...)
   → Genera narración con IA (ElevenLabs, OpenAI TTS...)
   → Genera música de fondo
   → (Opcional) Genera componentes .tsx custom con LLM
   → (Opcional) Genera animaciones Lottie
   → Compone el timeline.json
   → Escribe todo en remotion-renderer/public/projects/{nombre}/
   
   PASO 2: Remotion renderiza
   ──────────────────────────
   cd remotion-renderer
   npx remotion render {nombre} ../output/{nombre}.mp4
   
   → Bundlea todo el código (incluidos .tsx custom)
   → Lee timeline.json
   → Renderiza frame a frame (8 threads en paralelo)
   → Codifica a H.264 MP4
   → ¡Vídeo listo!
```

---

## Integración Python ↔ Remotion

**Recomendación: Git submodule**

```
mi-proyecto-python/
├── src/                        # Código Python
│   ├── generators/             # Generadores de assets con IA
│   ├── timeline_builder.py     # Construye el timeline JSON
│   └── render.py               # Ejecuta npx remotion render
├── remotion-renderer/          # ← Git submodule
│   ├── src/
│   └── public/projects/
├── output/                     # Vídeos renderizados
└── requirements.txt
```

```python
# render.py
import subprocess
import json

def render_video(project_name: str, timeline: dict, output_path: str):
    # 1. Escribir timeline
    project_dir = f"remotion-renderer/public/projects/{project_name}"
    with open(f"{project_dir}/timeline.json", "w") as f:
        json.dump(timeline, f)
    
    # 2. Renderizar
    subprocess.run([
        "npx", "remotion", "render", 
        project_name, output_path
    ], cwd="remotion-renderer/", check=True)
```

---

## Resumen de Capacidades

| Capacidad | Soporte |
|---|---|
| Imágenes con Ken Burns | ✅ |
| Clips de vídeo con trim | ✅ |
| Audio largo como base | ✅ |
| Múltiples tracks de audio (narración + música) | ✅ |
| Transiciones entre clips (blur, fade, slide, wipe) | ✅ |
| Subtítulos/texto animado | ✅ |
| Componentes animados reutilizables (títulos, gráficas...) | ✅ |
| Componentes custom one-off (generados por Python/IA) | ✅ |
| Animaciones Lottie | ✅ |
| Animaciones inline HTML+CSS | ✅ |
| Render headless desde CLI | ✅ |
| Integración con pipeline Python | ✅ |
| Vídeos de 10+ minutos | ✅ |
| Multi-track con capas (zIndex) | ✅ |

---





# Plan Commit a Commit

---

## Commit 1: `chore: remove CLI, generation deps and legacy files`

**Eliminar todo lo que no es renderizado.**

### Archivos a ELIMINAR:
- `cli/cli.ts`
- `cli/service.ts`
- `cli/timeline.ts`
- `.env.example` (ya no hay API keys)
- `Promo.png` (promo del template original)
- `public/content/history-of-venus/descriptor.json` (metadata de generación, no del renderer)

### Archivos a MODIFICAR:

**`package.json`** — Eliminar dependencias de generación + script `gen`:
```diff
  "scripts": {
    "dev": "remotion studio",
    "build": "remotion bundle",
    "upgrade": "remotion upgrade",
-   "lint": "eslint src && tsc",
-   "gen": "bun cli/cli.ts"
+   "lint": "eslint src && tsc"
  },
```

DevDependencies a **eliminar**:
- `@elevenlabs/elevenlabs-js`
- `@types/prompts`
- `@types/uuid`
- `@types/yargs`
- `chalk`
- `dotenv`
- `ora`
- `prompts`
- `tsx`
- `uuid`
- `yargs`

**`package.json`** — Cambiar nombre y descripción:
```diff
- "name": "template-ai-video",
+ "name": "video-editor",
- "description": "Create AI videos using remotion",
+ "description": "Data-driven multi-track video renderer powered by Remotion",
```

**`README.md`** — Reescribir completamente. Ya no es un "AI video template", es un video editor. README mínimo por ahora:
```md
# Video Editor

Data-driven multi-track video renderer powered by Remotion.

## Usage

1. Place assets + `timeline.json` in `public/content/{project-name}/`
2. `npm run dev` to preview
3. `npx remotion render {project-name} output.mp4` to render
```

**`src/lib/types.ts`** — Eliminar todo lo relacionado con generación:
- Eliminar import de `@elevenlabs/elevenlabs-js`
- Eliminar `StoryScript`, `StoryWithImages`, `VoiceDescriptorSchema`, `VoiceDescriptor`
- Eliminar `StoryMetadataWithDetails`, `ContentItemWithDetails`
- Mantener solo los schemas del timeline (que se reescribirán en Commit 2)

**`.gitignore`** — Añadir:
```
.env
```
(ya está, pero confirmar que no hay `.env` trackeado)

### Después del commit:
- `npm install` para actualizar lock
- El proyecto compila pero sigue usando el formato v1 de timeline

---

## Commit 2: `feat: define multi-track timeline v2 schema`

**El contrato de datos. El corazón del sistema.**

### Archivos a CREAR/REESCRIBIR:

**`src/lib/types.ts`** — Schema Zod completo del timeline v2:
```typescript
// Tipos de clip: image, video, text, audio
// Transiciones: fade, blur, none
// Animations: scale (extensible después)
// Track: { id, type, zIndex?, clips[] }
// Timeline: { version, fps, width, height, tracks[] }
```

Decisiones del schema:
- `version: "2.0"` (para futura compat)
- `fps`, `width`, `height` opcionales con defaults (30, 1080, 1920)
- `durationMs` NO existe — se calcula
- Cada clip tiene `startMs` + `endMs` (posición absoluta en el timeline global)
- Transitions y animations opcionales
- `fit` para image/video: `"cover" | "contain" | "fill"` (default `"cover"`)
- Audio: `volume` (0-1), `fadeInMs`, `fadeOutMs`

**`src/lib/constants.ts`** — Limpiar:
```typescript
export const DEFAULT_FPS = 30;
export const DEFAULT_WIDTH = 1080;
export const DEFAULT_HEIGHT = 1920;
```
Eliminar `INTRO_DURATION`, `IMAGE_WIDTH`, `IMAGE_HEIGHT`.

**`src/lib/utils.ts`** — Reescribir con utilidades para v2:
```typescript
export const msToFrames = (ms: number, fps: number) => Math.round((ms / 1000) * fps);
export const framesToMs = (frames: number, fps: number) => (frames / fps) * 1000;
export const calculateTimelineDuration = (timeline: Timeline) => { /* max endMs de todos los clips */ };
export const getProjectPath = (project: string) => `content/${project}`;
export const getTimelinePath = (project: string) => `content/${project}/timeline.json`;
```

### Después del commit:
- Los tipos están definidos pero nada los usa aún
- El código antiguo (`AIVideo.tsx`, etc.) no compila → es temporal

---

## Commit 3: `feat: implement multi-track renderer core`

**Los componentes que leen el timeline y renderizan tracks.**

### Archivos a CREAR:

**`src/components/MultiTrackComposition.tsx`**
- Recibe el timeline (ya parseado)
- Calcula `durationInFrames` del max `endMs` de todos los clips
- Ordena tracks visuales por `zIndex`
- Renderiza cada track con `<TrackRenderer>`
- Tracks de audio van aparte (sin zIndex, sin AbsoluteFill)

**`src/components/TrackRenderer.tsx`**
- Recibe un track
- Itera `clips[]`
- Para cada clip: calcula `from` y `durationInFrames`, lo wrappea en `<Sequence>`
- Hace switch por `clip.type` → delega al componente correcto

### Después del commit:
- El core del multi-track funciona pero los clips individuales aún no existen

---

## Commit 4: `feat: implement image clip with transitions and animations`

### Archivos a CREAR:

**`src/components/clips/ImageClip.tsx`**
- Migrar lógica de `Background.tsx`
- Soporte para `fit` (cover/contain/fill)
- Enter/exit transitions (fade, blur)
- Animations (scale → Ken Burns)
- Usa `<Img>` de Remotion con `staticFile()`

**`src/components/transitions/useTransition.ts`**
- Hook que recibe `enterTransition`, `exitTransition`, clip duration, frame actual
- Devuelve `{ opacity, blur }` calculados
- Reutilizable por todos los clips visuales

### Después del commit:
- Las imágenes se renderizan correctamente en el multi-track

---

## Commit 5: `feat: implement text, audio and video clips`

### Archivos a CREAR:

**`src/components/clips/TextClip.tsx`**
- Migrar lógica de `Subtitle.tsx` + `Word.tsx`
- Posición configurable (top/center/bottom)
- Estilos configurables (fontSize, color, fontFamily)
- Animación de entrada (spring)

**`src/components/clips/AudioClip.tsx`**
- Usa `<Audio>` de `@remotion/media`
- Soporte para `volume` (constante o con fade)
- `fadeInMs` / `fadeOutMs` usando `interpolate` de Remotion

**`src/components/clips/VideoClip.tsx`**
- Usa `<OffthreadVideo>` de Remotion
- Soporte para `trimStartMs` / `trimEndMs`
- Soporte para `volume` y `fit`

### Después del commit:
- Todos los tipos de clip del MVP funcionan

---

## Commit 6: `feat: wire up Root.tsx and adapt project discovery`

### Archivos a MODIFICAR:

**`src/Root.tsx`**
- Usa `MultiTrackComposition` en vez de `AIVideo`
- Lee `timeline.json` con el nuevo schema v2
- Calcula duración automáticamente
- Usa `fps`, `width`, `height` del timeline (o defaults)

### Archivos a ELIMINAR (código legacy):
- `src/components/AIVideo.tsx`
- `src/components/Background.tsx`
- `src/components/Subtitle.tsx`
- `src/components/Word.tsx`

### Después del commit:
- El renderer funciona end-to-end con el schema v2
- Pero el ejemplo aún tiene el formato v1

---

## Commit 7: `feat: migrate history-of-venus example to v2 format`

### Archivos a MODIFICAR:

**`public/content/history-of-venus/timeline.json`**
- Convertir del formato flat (`elements`, `text`, `audio`) al formato multi-track v2
- Adaptar `imageUrl: "uuid"` → `src: "images/uuid.png"` (paths relativos)
- Adaptar `audioUrl: "uuid"` → `src: "audio/uuid.mp3"`
- Restructurar en tracks:
  - Track "background" (visual, zIndex 0) → las imágenes
  - Track "subtitles" (visual, zIndex 1) → los textos
  - Track "narration" (audio) → los audios

### Después del commit:
- `npm run dev` funciona y muestra el ejemplo "History of Venus" correctamente
- **El MVP está completo** ✅

---

## Commit 8 (opcional): `docs: update plan.md with v2 architecture`

- Actualizar `plan.md` para reflejar la arquitectura real del MVP
- Documentar el schema v2
- Documentar qué viene post-MVP (components, lottie, más transiciones, etc.)

---

## Resumen visual:

| Commit | Tipo | Qué hace |
|---|---|---|
| 1 | 🧹 Limpieza | Elimina CLI, deps, legacy |
| 2 | 📐 Contrato | Define schema v2 + tipos + utils |
| 3 | 🏗️ Core | MultiTrackComposition + TrackRenderer |
| 4 | 🖼️ Clip | ImageClip + useTransition |
| 5 | 🎵📝🎬 Clips | TextClip + AudioClip + VideoClip |
| 6 | 🔌 Wiring | Root.tsx + eliminar código old |
| 7 | 📦 Ejemplo | Migrar timeline de ejemplo a v2 |
| 8 | 📝 Docs | Actualizar plan.md |

¿Te parece bien? ¿Quieres ajustar algo (juntar commits, separar, cambiar orden)? Si estás conforme, puedes toggle a **Act Mode** y empezamos con el Commit 1 (limpieza).
