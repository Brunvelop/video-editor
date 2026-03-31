import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ImageClip as ImageClipType } from "../../lib/types";
import { msToFrames } from "../../lib/utils";
import { useTransition } from "../transitions/useTransition";

interface ImageClipProps {
  clip: ImageClipType;
  projectPath: string;
}

export const ImageClip: React.FC<ImageClipProps> = ({ clip, projectPath }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { opacity, filter } = useTransition(
    clip.enterTransition,
    clip.exitTransition,
  );

  // Calculate current scale from animations (Ken Burns effect)
  let scale = 1;
  if (clip.animations) {
    for (const anim of clip.animations) {
      if (anim.type === "scale") {
        const animStartFrame = msToFrames(anim.startMs, fps);
        const animEndFrame = msToFrames(anim.endMs, fps);
        scale = interpolate(frame, [animStartFrame, animEndFrame], [anim.from, anim.to], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
      }
    }
  }

  const objectFit: React.CSSProperties["objectFit"] = clip.fit ?? "cover";

  return (
    <AbsoluteFill style={{ opacity, overflow: "hidden" }}>
      <Img
        src={staticFile(`${projectPath}/${clip.src}`)}
        style={{
          width: "100%",
          height: "100%",
          objectFit,
          transform: `scale(${scale})`,
          filter,
        }}
      />
    </AbsoluteFill>
  );
};
