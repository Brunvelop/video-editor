import { z } from "zod";

// ─── Transitions ───────────────────────────────────────────────────────────────

const TransitionSchema = z.object({
  type: z.enum(["fade", "blur", "none"]),
  durationMs: z.number().positive(),
});

// ─── Animations ────────────────────────────────────────────────────────────────

const ScaleAnimationSchema = z.object({
  type: z.literal("scale"),
  from: z.number(),
  to: z.number(),
  startMs: z.number().nonnegative(), // relative to clip start
  endMs: z.number().positive(),      // relative to clip start
});

// Single type for now — convert to discriminatedUnion when more animation types added
const AnimationSchema = ScaleAnimationSchema;

// ─── Base Clip ─────────────────────────────────────────────────────────────────

const BaseClipSchema = z.object({
  startMs: z.number().nonnegative(), // absolute position in global timeline
  endMs: z.number().positive(),      // absolute position in global timeline
});

// ─── Image Clip ────────────────────────────────────────────────────────────────

const ImageClipSchema = BaseClipSchema.extend({
  type: z.literal("image"),
  src: z.string(),
  fit: z.enum(["cover", "contain", "fill"]).default("cover"),
  enterTransition: TransitionSchema.optional(),
  exitTransition: TransitionSchema.optional(),
  animations: z.array(AnimationSchema).optional(),
});

// ─── Video Clip ────────────────────────────────────────────────────────────────

const VideoClipSchema = BaseClipSchema.extend({
  type: z.literal("video"),
  src: z.string(),
  fit: z.enum(["cover", "contain", "fill"]).default("cover"),
  volume: z.number().min(0).max(1).default(1),
  trimStartMs: z.number().nonnegative().optional(),
  trimEndMs: z.number().positive().optional(),
  enterTransition: TransitionSchema.optional(),
  exitTransition: TransitionSchema.optional(),
  animations: z.array(AnimationSchema).optional(),
});

// ─── Hero Title Clip ───────────────────────────────────────────────────────────

const HeroTitleStyleSchema = z.object({
  titleFontSize: z.number().optional(),
  subtitleFontSize: z.number().optional(),
  titleColor: z.string().optional(),
  subtitleColor: z.string().optional(),
  accentColor: z.string().optional(),
  titleFontFamily: z.string().optional(),
  subtitleFontFamily: z.string().optional(),
});

const HeroTitleClipSchema = BaseClipSchema.extend({
  type: z.literal("hero-title"),
  title: z.string(),
  subtitle: z.string().optional(),
  animation: z.enum(["glitch", "typewriter", "cinematic"]).default("cinematic"),
  showBackground: z.boolean().default(true),
  style: HeroTitleStyleSchema.optional(),
  enterTransition: TransitionSchema.optional(),
  exitTransition: TransitionSchema.optional(),
});

// ─── Text Clip ─────────────────────────────────────────────────────────────────

const TextStyleSchema = z.object({
  fontSize: z.number().optional(),
  color: z.string().optional(),
  fontFamily: z.string().optional(),
  textShadow: z.string().optional(),
});

const TextClipSchema = BaseClipSchema.extend({
  type: z.literal("text"),
  text: z.string(),
  position: z.enum(["top", "center", "bottom"]).default("bottom"),
  style: TextStyleSchema.optional(),
  animations: z.array(AnimationSchema).optional(),
});

// ─── Audio Clip ────────────────────────────────────────────────────────────────

const AudioClipSchema = BaseClipSchema.extend({
  type: z.literal("audio"),
  src: z.string(),
  volume: z.number().min(0).max(1).default(1),
  fadeInMs: z.number().nonnegative().optional(),
  fadeOutMs: z.number().nonnegative().optional(),
});

// ─── Clip Unions ───────────────────────────────────────────────────────────────

const VisualClipSchema = z.discriminatedUnion("type", [
  ImageClipSchema,
  VideoClipSchema,
  TextClipSchema,
  HeroTitleClipSchema,
]);

// ─── Tracks ────────────────────────────────────────────────────────────────────

const VisualTrackSchema = z.object({
  id: z.string(),
  type: z.literal("visual"),
  zIndex: z.number().int().nonnegative().default(0),
  clips: z.array(VisualClipSchema),
});

const AudioTrackSchema = z.object({
  id: z.string(),
  type: z.literal("audio"),
  clips: z.array(AudioClipSchema),
});

const TrackSchema = z.discriminatedUnion("type", [
  VisualTrackSchema,
  AudioTrackSchema,
]);

// ─── Timeline ──────────────────────────────────────────────────────────────────

const TimelineSchema = z.object({
  fps: z.number().positive().default(30),
  width: z.number().positive().default(1080),
  height: z.number().positive().default(1920),
  tracks: z.array(TrackSchema),
});

// ─── Exports ───────────────────────────────────────────────────────────────────

export type Transition = z.infer<typeof TransitionSchema>;
export type ScaleAnimation = z.infer<typeof ScaleAnimationSchema>;
export type Animation = z.infer<typeof AnimationSchema>;
export type TextStyle = z.infer<typeof TextStyleSchema>;

export type ImageClip = z.infer<typeof ImageClipSchema>;
export type VideoClip = z.infer<typeof VideoClipSchema>;
export type TextClip = z.infer<typeof TextClipSchema>;
export type HeroTitleClip = z.infer<typeof HeroTitleClipSchema>;
export type HeroTitleStyle = z.infer<typeof HeroTitleStyleSchema>;
export type AudioClip = z.infer<typeof AudioClipSchema>;
export type VisualClip = z.infer<typeof VisualClipSchema>;

export type VisualTrack = z.infer<typeof VisualTrackSchema>;
export type AudioTrack = z.infer<typeof AudioTrackSchema>;
export type Track = z.infer<typeof TrackSchema>;

export type Timeline = z.infer<typeof TimelineSchema>;

export {
  TransitionSchema,
  ScaleAnimationSchema,
  AnimationSchema,
  TextStyleSchema,
  HeroTitleStyleSchema,
  HeroTitleClipSchema,
  ImageClipSchema,
  VideoClipSchema,
  TextClipSchema,
  AudioClipSchema,
  VisualClipSchema,
  VisualTrackSchema,
  AudioTrackSchema,
  TrackSchema,
  TimelineSchema,
};
