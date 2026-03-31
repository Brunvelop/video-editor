import { makeTransform, scale, translateY } from "@remotion/animation-utils";
import { loadFont } from "@remotion/google-fonts/BreeSerif";
import { fitText } from "@remotion/layout-utils";
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { TextClip as TextClipType } from "../../lib/types";

interface TextClipProps {
  clip: TextClipType;
}

const positionStyles: Record<
  "top" | "center" | "bottom",
  React.CSSProperties
> = {
  top: { top: 120, bottom: undefined, height: 150, justifyContent: "center" },
  center: { top: undefined, bottom: undefined, height: 150, justifyContent: "center", alignItems: "center" },
  bottom: { top: undefined, bottom: 350, height: 150, justifyContent: "center" },
};

export const TextClip: React.FC<TextClipProps> = ({ clip }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const { fontFamily: defaultFontFamily } = loadFont();

  const fontFamily = clip.style?.fontFamily ?? defaultFontFamily;
  const color = clip.style?.color ?? "white";
  const textShadow = clip.style?.textShadow;
  const maxFontSize = clip.style?.fontSize ?? 120;

  const fittedText = fitText({
    fontFamily,
    text: clip.text,
    withinWidth: width * 0.8,
  });

  const fontSize = Math.min(maxFontSize, fittedText.fontSize);

  // Spring enter animation
  const enter = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: 5,
  });

  // Scale animation from schema (applied on top of spring)
  let scaleValue = interpolate(enter, [0, 1], [0.8, 1]);
  if (clip.animations) {
    for (const anim of clip.animations) {
      if (anim.type === "scale") {
        const fps_ = fps;
        const animStartFrame = Math.round((anim.startMs / 1000) * fps_);
        const animEndFrame = Math.round((anim.endMs / 1000) * fps_);
        scaleValue = interpolate(
          frame,
          [animStartFrame, animEndFrame],
          [anim.from, anim.to],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );
      }
    }
  }

  const position = clip.position ?? "bottom";
  const containerStyle: React.CSSProperties = {
    ...positionStyles[position],
    alignItems: "center",
  };

  const textTransform = makeTransform([
    scale(scaleValue),
    translateY(interpolate(enter, [0, 1], [50, 0])),
  ]);

  const sharedStyle: React.CSSProperties = {
    fontSize,
    fontFamily,
    transform: textTransform,
    textTransform: "uppercase",
    textAlign: "center",
  };

  return (
    <AbsoluteFill>
      {/* Stroke layer (outline for readability over images) */}
      <AbsoluteFill style={containerStyle}>
        <div
          style={{
            ...sharedStyle,
            color: "transparent",
            WebkitTextStroke: "20px black",
          }}
        >
          {clip.text}
        </div>
      </AbsoluteFill>

      {/* Text layer */}
      <AbsoluteFill style={containerStyle}>
        <div
          style={{
            ...sharedStyle,
            color,
            textShadow,
          }}
        >
          {clip.text}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
