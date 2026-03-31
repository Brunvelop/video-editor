
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

Este es el diseño completo. ¿Quieres ajustar algo o empezamos a implementar? Si te parece bien, puedes toggle a Act Mode y arrancamos por el schema de tipos + el renderer multi-track como MVP.
