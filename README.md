# 🎬 Video Editor

Data-driven multi-track video renderer powered by [Remotion](https://www.remotion.dev/). Describe your video entirely in a JSON file and render it to MP4 — no code required.

---

## Quick Start

```bash
npm install

# Preview in browser
npm run dev

# Render to MP4
npm run render -- history-of-venus out/history-of-venus.mp4
```

---

## How It Works

1. Create a folder under `public/content/{your-project}/`
2. Place your assets (images, audio, video) inside it
3. Write a `timeline.json` describing the video
4. Preview with `npm run dev` or render directly from CLI

The renderer auto-discovers every folder that contains a `timeline.json` and registers it as a Remotion composition.

---

## Project Structure

```
public/
└── content/
    └── your-project/
        ├── timeline.json      ← Describes the video
        ├── images/            ← Image assets
        ├── audio/             ← Audio assets
        └── videos/            ← Video assets (optional)
```

---

## Timeline JSON Schema

> 📌 Full type definitions (Zod schemas): [`src/lib/types.ts`](src/lib/types.ts)

### Root

```json
{
  "fps": 30,
  "width": 1080,
  "height": 1920,
  "tracks": []
}
```

| Field | Type | Default | Description |
|---|---|---|---|
| `fps` | `number` | `30` | Frames per second |
| `width` | `number` | `1080` | Video width in pixels |
| `height` | `number` | `1920` | Video height in pixels |
| `tracks` | `Track[]` | — | Ordered list of tracks |

> `durationMs` is **not required** — it is calculated automatically from the maximum `endMs` of all clips.

---

### Tracks

Tracks are either `visual` (rendered as layers) or `audio`.

#### Visual Track

```json
{
  "id": "background",
  "type": "visual",
  "zIndex": 0,
  "clips": []
}
```

| Field | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | — | Unique track identifier |
| `type` | `"visual"` | — | Marks this as a visual track |
| `zIndex` | `number` | `0` | Stacking order (higher = on top) |
| `clips` | `VisualClip[]` | — | List of clips (`image`, `video`, `text`) |

#### Audio Track

```json
{
  "id": "narration",
  "type": "audio",
  "clips": []
}
```

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique track identifier |
| `type` | `"audio"` | Marks this as an audio track |
| `clips` | `AudioClip[]` | List of audio clips |

---

### Clip Types

All clips share these base fields:

| Field | Type | Description |
|---|---|---|
| `startMs` | `number` | Start time in ms (absolute, from beginning of video) |
| `endMs` | `number` | End time in ms (absolute, from beginning of video) |

---

#### `image`

Displays a static image with optional Ken Burns animations and transitions.

```json
{
  "type": "image",
  "src": "images/scene1.png",
  "startMs": 0,
  "endMs": 10000,
  "fit": "cover",
  "enterTransition": { "type": "blur", "durationMs": 1000 },
  "exitTransition": { "type": "fade", "durationMs": 800 },
  "animations": [
    { "type": "scale", "from": 1.0, "to": 1.2, "startMs": 0, "endMs": 10000 }
  ]
}
```

| Field | Type | Default | Description |
|---|---|---|---|
| `src` | `string` | — | Path relative to the project folder |
| `fit` | `"cover" \| "contain" \| "fill"` | `"cover"` | Image fit mode |
| `enterTransition` | `Transition` | — | Transition when clip starts |
| `exitTransition` | `Transition` | — | Transition when clip ends |
| `animations` | `Animation[]` | — | Animations during the clip |

---

#### `video`

Plays a video clip with optional trim and transitions.

```json
{
  "type": "video",
  "src": "videos/broll.mp4",
  "startMs": 10000,
  "endMs": 25000,
  "fit": "cover",
  "volume": 0,
  "trimStartMs": 2000,
  "trimEndMs": 17000,
  "enterTransition": { "type": "fade", "durationMs": 500 }
}
```

| Field | Type | Default | Description |
|---|---|---|---|
| `src` | `string` | — | Path relative to the project folder |
| `fit` | `"cover" \| "contain" \| "fill"` | `"cover"` | Video fit mode |
| `volume` | `number` (0–1) | `1` | Playback volume |
| `trimStartMs` | `number` | — | Start trim point inside the video file |
| `trimEndMs` | `number` | — | End trim point inside the video file |
| `enterTransition` | `Transition` | — | Transition when clip starts |
| `exitTransition` | `Transition` | — | Transition when clip ends |
| `animations` | `Animation[]` | — | Scale animations during the clip |

---

#### `text`

Displays a text overlay with animated entrance and configurable style.

```json
{
  "type": "text",
  "text": "Venus is the second planet from the Sun.",
  "startMs": 1000,
  "endMs": 5000,
  "position": "bottom",
  "style": {
    "fontSize": 52,
    "color": "white",
    "fontFamily": "BreeSerif",
    "textShadow": "2px 2px 4px rgba(0,0,0,0.8)"
  }
}
```

| Field | Type | Default | Description |
|---|---|---|---|
| `text` | `string` | — | Text content |
| `position` | `"top" \| "center" \| "bottom"` | `"bottom"` | Vertical position |
| `style.fontSize` | `number` | auto-fit | Font size in pixels |
| `style.color` | `string` | — | CSS color value |
| `style.fontFamily` | `string` | `BreeSerif` | Font family name |
| `style.textShadow` | `string` | — | CSS text-shadow value |
| `animations` | `Animation[]` | — | Scale animations during the clip |

---

#### `audio`

Plays an audio file with optional volume fades.

```json
{
  "type": "audio",
  "src": "audio/narration.mp3",
  "startMs": 0,
  "endMs": 60000,
  "volume": 1.0,
  "fadeInMs": 500,
  "fadeOutMs": 1000
}
```

| Field | Type | Default | Description |
|---|---|---|---|
| `src` | `string` | — | Path relative to the project folder |
| `volume` | `number` (0–1) | `1` | Playback volume |
| `fadeInMs` | `number` | — | Duration of fade-in at clip start |
| `fadeOutMs` | `number` | — | Duration of fade-out at clip end |

---

### Transitions

Applied to `enterTransition` or `exitTransition` on `image` and `video` clips.

```json
{ "type": "fade", "durationMs": 800 }
```

| Type | Description |
|---|---|
| `"fade"` | Opacity fade in/out |
| `"blur"` | Gaussian blur fade in/out (max 25px) |
| `"none"` | Hard cut (instant) |

---

### Animations

Applied to the `animations` array on `image`, `video`, and `text` clips.

#### `scale` — Ken Burns / Zoom effect

```json
{
  "type": "scale",
  "from": 1.0,
  "to": 1.2,
  "startMs": 0,
  "endMs": 10000
}
```

| Field | Type | Description |
|---|---|---|
| `from` | `number` | Starting scale factor |
| `to` | `number` | Ending scale factor |
| `startMs` | `number` | Animation start (relative to clip start) |
| `endMs` | `number` | Animation end (relative to clip start) |

---

## Complete Example

```json
{
  "fps": 30,
  "width": 1080,
  "height": 1920,
  "tracks": [
    {
      "id": "background",
      "type": "visual",
      "zIndex": 0,
      "clips": [
        {
          "type": "image",
          "src": "images/venus.png",
          "startMs": 0,
          "endMs": 10000,
          "enterTransition": { "type": "blur", "durationMs": 1000 },
          "exitTransition": { "type": "fade", "durationMs": 800 },
          "animations": [
            { "type": "scale", "from": 1.0, "to": 1.15, "startMs": 0, "endMs": 10000 }
          ]
        }
      ]
    },
    {
      "id": "subtitles",
      "type": "visual",
      "zIndex": 1,
      "clips": [
        {
          "type": "text",
          "text": "Venus: The Evening Star",
          "startMs": 500,
          "endMs": 4500,
          "position": "bottom"
        }
      ]
    },
    {
      "id": "narration",
      "type": "audio",
      "clips": [
        {
          "type": "audio",
          "src": "audio/intro.mp3",
          "startMs": 0,
          "endMs": 10000,
          "fadeInMs": 300,
          "fadeOutMs": 500
        }
      ]
    }
  ]
}
```

---

## Scripts

```bash
npm run dev                                               # Open Remotion Studio (preview)
npm run render -- <id> <output>                           # Render (default quality)
npm run render:fast -- <id> <output>                      # Render with GPU + 100% CPU cores
npm run render:draft -- <id> <output>                     # Draft: 0.5x scale, lower quality
npm run build                                             # Bundle for server-side rendering
npm run lint                                              # Run ESLint + TypeScript check
```

### Render examples

```bash
npm run render -- history-of-venus out/history-of-venus.mp4
npm run render:fast -- history-of-venus out/history-of-venus.mp4
npm run render:draft -- history-of-venus out/preview.mp4
```

> `render:fast` uses `--gl=angle` for GPU acceleration and `--concurrency=100%` to use all CPU cores.  
> If `--gl=angle` fails on your system, use `npm run render` instead.

---

## Source Code Structure

```
src/
├── index.ts                              # Remotion entry point
├── Root.tsx                              # Auto-discovers projects, registers compositions
├── lib/
│   ├── types.ts                          # Zod schemas + TypeScript types (source of truth)
│   ├── constants.ts                      # Default fps, width, height
│   └── utils.ts                          # msToFrames, calculateTimelineDuration, etc.
└── components/
    ├── MultiTrackComposition.tsx         # Renders a full timeline (separates visual/audio tracks)
    ├── TrackRenderer.tsx                 # Renders a single track (wraps clips in <Sequence>)
    ├── clips/
    │   ├── ImageClip.tsx                 # <Img> with fit, transitions, scale animations
    │   ├── VideoClip.tsx                 # <OffthreadVideo> with trim, volume, transitions
    │   ├── TextClip.tsx                  # Text with spring entrance + fitText
    │   └── AudioClip.tsx                 # <Audio> with volume fades
    └── transitions/
        └── useTransition.ts              # Hook: computes opacity/filter from transition config
```
