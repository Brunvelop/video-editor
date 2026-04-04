import { loadFont as loadOswald } from "@remotion/google-fonts/Oswald";
import { loadFont as loadSpaceMono } from "@remotion/google-fonts/SpaceMono";
import { fitText } from "@remotion/layout-utils";
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { HeroTitleClip as HeroTitleClipType } from "../../lib/types";
import { useTransition } from "../transitions/useTransition";

interface HeroTitleClipProps {
  clip: HeroTitleClipType;
}

// ─── Defaults ──────────────────────────────────────────────────────────────────

const DEFAULT_ACCENT = "#00F0FF";
const DEFAULT_TITLE_COLOR = "#FFFFFF";
const DEFAULT_SUBTITLE_COLOR = "rgba(255,255,255,0.60)";
const DEFAULT_MAX_TITLE_SIZE = 130;
const DEFAULT_SUBTITLE_SIZE = 34;

// ─── Shared animation props ────────────────────────────────────────────────────

interface AnimationProps {
  title: string;
  subtitle?: string;
  titleFontFamily: string;
  subtitleFontFamily: string;
  titleFontSize: number;
  subtitleFontSize: number;
  titleColor: string;
  subtitleColor: string;
  accentColor: string;
  frame: number;
  fps: number;
  durationInFrames: number;
}

// ─── Generative Background ─────────────────────────────────────────────────────

const GenerativeBackground: React.FC<{
  accentColor: string;
  frame: number;
  fps: number;
}> = ({ accentColor, frame, fps }) => {
  // Slow breath: 0.18 cycles/sec (~5.5s cycle)
  const breathe = Math.sin((frame / fps) * Math.PI * 2 * 0.18);
  const b = (breathe + 1) / 2; // 0 → 1, normalised

  const blob1X = 15 + b * 9;
  const blob1Y = 22 + b * 6;
  const blob2X = 82 - b * 7;
  const blob2Y = 72 - b * 5;
  const blob3X = 52 + b * 5;
  const blob3Y = 8 + b * 7;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* Deep dark base */}
      <AbsoluteFill style={{ background: "#06070f" }} />

      {/* SVG grain/noise filter */}
      <svg style={{ position: "absolute", width: 0, height: 0 }} aria-hidden>
        <defs>
          <filter id="psych-grain" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.72"
              numOctaves="4"
              stitchTiles="stitch"
              result="noise"
            />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0"
              in="noise"
              result="darkNoise"
            />
            <feComposite in="SourceGraphic" in2="darkNoise" operator="over" />
          </filter>
        </defs>
      </svg>

      {/* Blob 1 — accent glow, top-left area */}
      <div
        style={{
          position: "absolute",
          width: "75%",
          height: "58%",
          left: `${blob1X}%`,
          top: `${blob1Y}%`,
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(ellipse, ${accentColor}1C 0%, transparent 68%)`,
          filter: "blur(45px)",
        }}
      />

      {/* Blob 2 — accent glow, bottom-right */}
      <div
        style={{
          position: "absolute",
          width: "62%",
          height: "52%",
          left: `${blob2X}%`,
          top: `${blob2Y}%`,
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(ellipse, ${accentColor}14 0%, transparent 62%)`,
          filter: "blur(55px)",
        }}
      />

      {/* Blob 3 — deep crimson-purple, psychological undertone */}
      <div
        style={{
          position: "absolute",
          width: "48%",
          height: "42%",
          left: `${blob3X}%`,
          top: `${blob3Y}%`,
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(ellipse, rgba(140,18,255,0.18) 0%, transparent 58%)",
          filter: "blur(48px)",
        }}
      />

      {/* Grain overlay using SVG filter */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.055,
          background: "#ffffff",
          filter: "url(#psych-grain)",
          mixBlendMode: "overlay",
        }}
      />

      {/* Vignette — strong edges */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 75% 65% at 50% 50%, transparent 25%, rgba(0,0,0,0.72) 100%)",
        }}
      />

      {/* CRT scan lines */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.04) 3px, rgba(0,0,0,0.04) 4px)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

// ─── CINEMATIC ─────────────────────────────────────────────────────────────────
// Horizontal reveal lines → title fades in from blur/scale → subtitle rises

const CinematicAnimation: React.FC<AnimationProps> = ({
  title,
  subtitle,
  titleFontFamily,
  subtitleFontFamily,
  titleFontSize,
  subtitleFontSize,
  titleColor,
  subtitleColor,
  accentColor,
  frame,
}) => {
  // Lines expand from centre (0 → 1 scaleX)
  const lineScale = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Title: blur-in + scale-down (frames 10 → 35)
  const titleScale = interpolate(frame, [10, 35], [1.28, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleBlur = interpolate(frame, [10, 35], [16, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleOpacity = interpolate(frame, [10, 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtitle rises up + fades in (frames 30 → 52)
  const subtitleOpacity = interpolate(frame, [30, 52], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subtitleY = interpolate(frame, [30, 52], [28, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const accentGlow = `0 0 18px ${accentColor}70, 0 0 40px ${accentColor}30`;

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 22,
          width: "85%",
        }}
      >
        {/* Top reveal line */}
        <div
          style={{
            width: "100%",
            height: 2,
            background: `linear-gradient(90deg, transparent 0%, ${accentColor} 50%, transparent 100%)`,
            transform: `scaleX(${lineScale})`,
            transformOrigin: "center",
            boxShadow: accentGlow,
          }}
        />

        {/* Title */}
        <div
          style={{
            fontSize: titleFontSize,
            fontFamily: titleFontFamily,
            fontWeight: 700,
            color: titleColor,
            textAlign: "center",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            transform: `scale(${titleScale})`,
            filter: titleBlur > 0.2 ? `blur(${titleBlur}px)` : "none",
            opacity: titleOpacity,
            lineHeight: 1.04,
          }}
        >
          {title}
        </div>

        {/* Bottom reveal line */}
        <div
          style={{
            width: "100%",
            height: 2,
            background: `linear-gradient(90deg, transparent 0%, ${accentColor} 50%, transparent 100%)`,
            transform: `scaleX(${lineScale})`,
            transformOrigin: "center",
            boxShadow: accentGlow,
          }}
        />

        {/* Subtitle */}
        {subtitle && (
          <div
            style={{
              fontSize: subtitleFontSize,
              fontFamily: subtitleFontFamily,
              color: subtitleColor,
              textAlign: "center",
              letterSpacing: "0.30em",
              textTransform: "uppercase",
              opacity: subtitleOpacity,
              transform: `translateY(${subtitleY}px)`,
              marginTop: 6,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

// ─── GLITCH ────────────────────────────────────────────────────────────────────
// RGB split text-shadow, Y-axis jitter, artifact bar, decays to clean

const GlitchAnimation: React.FC<AnimationProps> = ({
  title,
  subtitle,
  titleFontFamily,
  subtitleFontFamily,
  titleFontSize,
  subtitleFontSize,
  titleColor,
  subtitleColor,
  accentColor,
  frame,
}) => {
  // Intensity: max at start, converges to 0 by frame 38
  const intensity = interpolate(frame, [0, 20, 38], [1, 0.85, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Deterministic jitter (no Math.random — deterministic sine combos)
  const jX =
    (Math.sin(frame * 7.31) * 0.5 +
      Math.sin(frame * 13.71) * 0.32 +
      Math.sin(frame * 3.13) * 0.18) *
    34 *
    intensity;

  const jY =
    (Math.sin(frame * 5.13 + 1.2) * 0.6 + Math.sin(frame * 9.97) * 0.4) *
    10 *
    intensity;

  // Whole-body vertical shake
  const bodyY =
    (Math.sin(frame * 11.37) * 0.7 + Math.sin(frame * 4.71) * 0.3) *
    9 *
    intensity;

  // Horizontal scan displacement
  const scanX =
    intensity > 0.45 ? Math.sin(frame * 23.73) * 20 * intensity : 0;

  // Flicker: occasional total black-out
  const isFlickered =
    intensity > 0.35 && Math.sin(frame * 17.13) > 0.88;

  // RGB text-shadow: red right, cyan left
  const rgbShadow =
    intensity > 0.02
      ? `${jX}px ${jY}px 0 rgba(255,20,60,${0.9 * intensity}), ${-jX * 0.82}px ${-jY * 0.65}px 0 rgba(0,240,255,${0.9 * intensity})`
      : "none";

  // Artifact bar — thin glitch strip that drifts
  const artifactTop = 50 + Math.sin(frame * 7.77) * 18;
  const artifactLeft = 8 + Math.sin(frame * 11.11) * 22;
  const artifactOpacity =
    intensity > 0.55
      ? Math.max(0, Math.sin(frame * 19.33)) * 0.28 * intensity
      : 0;

  // Subtitle appears after glitch fully decays
  const subtitleOpacity = interpolate(frame, [36, 54], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Accent line width fluctuates during glitch
  const lineW = 80 + Math.sin(frame * 5.31) * 14 * intensity;

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 26,
          width: "85%",
          transform: `translateY(${bodyY}px)`,
          opacity: isFlickered ? 0 : 1,
          position: "relative",
        }}
      >
        {/* Accent line — glitches in width */}
        <div
          style={{
            width: `${lineW}%`,
            height: 2,
            background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
            boxShadow: `0 0 18px ${accentColor}CC, 0 0 36px ${accentColor}44`,
            transform: `translateX(${scanX}px)`,
            transition: "none",
          }}
        />

        {/* Title — RGB split via textShadow */}
        <div
          style={{
            fontSize: titleFontSize,
            fontFamily: titleFontFamily,
            fontWeight: 700,
            color: titleColor,
            textAlign: "center",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            textShadow: rgbShadow,
            transform: `translateX(${scanX * 0.4}px)`,
            lineHeight: 1.04,
          }}
        >
          {title}
        </div>

        {/* Glitch artifact strip */}
        <div
          style={{
            position: "absolute",
            width: "58%",
            height: `${Math.max(2, titleFontSize * 0.07)}px`,
            background: accentColor,
            opacity: artifactOpacity,
            top: `${artifactTop}%`,
            left: `${artifactLeft}%`,
            filter: "blur(1.5px)",
            pointerEvents: "none",
          }}
        />

        {/* Bottom line */}
        <div
          style={{
            width: `${lineW}%`,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${accentColor}80, transparent)`,
            transform: `translateX(${-scanX * 0.6}px)`,
          }}
        />

        {/* Subtitle */}
        {subtitle && (
          <div
            style={{
              fontSize: subtitleFontSize,
              fontFamily: subtitleFontFamily,
              color: subtitleColor,
              textAlign: "center",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              opacity: subtitleOpacity,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

// ─── TYPEWRITER ────────────────────────────────────────────────────────────────
// Characters revealed progressively, blinking cursor, terminal aesthetic

const TypewriterAnimation: React.FC<AnimationProps> = ({
  title,
  subtitle,
  titleFontFamily,
  subtitleFontFamily,
  titleFontSize,
  subtitleFontSize,
  titleColor,
  subtitleColor,
  accentColor,
  frame,
  durationInFrames,
}) => {
  const typingFrames = Math.max(12, Math.floor(durationInFrames * 0.42));
  const charsToShow = Math.min(
    title.length,
    Math.floor((frame / typingFrames) * title.length),
  );
  const typingDone = charsToShow >= title.length;

  // Cursor blink (10-frame cycle while typing, 16-frame after)
  const blinkRate = typingDone ? 16 : 10;
  const cursorOn = typingDone && subtitle
    ? frame % blinkRate < blinkRate * 0.55
    : frame % blinkRate < blinkRate * 0.6;

  // Prompt label — fades in instantly
  const promptOpacity = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Separator line — expands left-to-right
  const lineScale = interpolate(frame, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtitle: appears after typing done + 10 frame buffer
  const subStart = typingFrames + 10;
  const subtitleOpacity = interpolate(frame, [subStart, subStart + 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtle CRT phosphor flicker (very mild)
  const flicker = 1 - Math.max(0, Math.sin(frame * 31.71)) * 0.025;

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        opacity: flicker,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          width: "82%",
          gap: 18,
        }}
      >
        {/* Terminal-style prompt label */}
        <div
          style={{
            fontSize: subtitleFontSize * 0.75,
            fontFamily: subtitleFontFamily,
            color: accentColor,
            letterSpacing: "0.18em",
            opacity: promptOpacity,
            textTransform: "uppercase",
          }}
        >
          {"›› SESIÓN ACTIVA"}
        </div>

        {/* Accent separator line */}
        <div
          style={{
            width: "100%",
            height: 1,
            background: `linear-gradient(90deg, ${accentColor} 0%, ${accentColor}20 100%)`,
            transform: `scaleX(${lineScale})`,
            transformOrigin: "left center",
            boxShadow: `0 0 10px ${accentColor}50`,
            opacity: promptOpacity,
          }}
        />

        {/* Title — character-by-character reveal */}
        <div
          style={{
            fontSize: titleFontSize,
            fontFamily: titleFontFamily,
            fontWeight: 700,
            color: titleColor,
            textAlign: "left",
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            lineHeight: 1.08,
            display: "flex",
            alignItems: "baseline",
            flexWrap: "wrap",
          }}
        >
          <span>{title.slice(0, charsToShow)}</span>
          {/* Blinking cursor bar */}
          <span
            style={{
              display: "inline-block",
              width: "0.07em",
              height: "0.82em",
              background: accentColor,
              marginLeft: 5,
              opacity: cursorOn ? 1 : 0,
              boxShadow: cursorOn ? `0 0 10px ${accentColor}` : "none",
              verticalAlign: "baseline",
              alignSelf: "center",
            }}
          />
        </div>

        {/* Subtitle with left accent border */}
        {subtitle && (
          <div
            style={{
              fontSize: subtitleFontSize,
              fontFamily: subtitleFontFamily,
              color: subtitleColor,
              textAlign: "left",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              opacity: subtitleOpacity,
              borderLeft: `3px solid ${accentColor}`,
              paddingLeft: 18,
              marginTop: 4,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

// ─── HeroTitleClip — Main Export ───────────────────────────────────────────────

export const HeroTitleClip: React.FC<HeroTitleClipProps> = ({ clip }) => {
  const frame = useCurrentFrame();
  const { fps, width, durationInFrames } = useVideoConfig();

  const { fontFamily: oswaldFamily } = loadOswald();
  const { fontFamily: spaceMonoFamily } = loadSpaceMono();

  const { opacity, filter } = useTransition(
    clip.enterTransition,
    clip.exitTransition,
  );

  const style = clip.style ?? {};
  const accentColor = style.accentColor ?? DEFAULT_ACCENT;
  const titleColor = style.titleColor ?? DEFAULT_TITLE_COLOR;
  const subtitleColor = style.subtitleColor ?? DEFAULT_SUBTITLE_COLOR;
  const maxTitleSize = style.titleFontSize ?? DEFAULT_MAX_TITLE_SIZE;
  const subtitleFontSize = style.subtitleFontSize ?? DEFAULT_SUBTITLE_SIZE;
  const titleFontFamily = style.titleFontFamily ?? oswaldFamily;
  const subtitleFontFamily = style.subtitleFontFamily ?? spaceMonoFamily;

  const { fontSize: fittedSize } = fitText({
    fontFamily: titleFontFamily,
    text: clip.title,
    withinWidth: width * 0.85,
  });
  const titleFontSize = Math.min(maxTitleSize, fittedSize);

  const animProps: AnimationProps = {
    title: clip.title,
    subtitle: clip.subtitle,
    titleFontFamily,
    subtitleFontFamily,
    titleFontSize,
    subtitleFontSize,
    titleColor,
    subtitleColor,
    accentColor,
    frame,
    fps,
    durationInFrames,
  };

  return (
    <AbsoluteFill
      style={{
        opacity,
        filter: filter !== "none" ? filter : undefined,
      }}
    >
      {/* Generative atmospheric background */}
      {clip.showBackground !== false && (
        <GenerativeBackground
          accentColor={accentColor}
          frame={frame}
          fps={fps}
        />
      )}

      {/* Animation preset */}
      {clip.animation === "cinematic" && <CinematicAnimation {...animProps} />}
      {clip.animation === "glitch" && <GlitchAnimation {...animProps} />}
      {clip.animation === "typewriter" && (
        <TypewriterAnimation {...animProps} />
      )}
    </AbsoluteFill>
  );
};
