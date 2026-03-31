import React from "react";
import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { VideoClip as VideoClipType } from "../../lib/types";
import { msToFrames } from "../../lib/utils";
import { useTransition } from "../transitions/useTransition";

interface VideoClipProps {
  clip: VideoClipType;
  projectPath: string;
}

export const VideoClip: React.FC<VideoClipProps> = ({ clip, projectPath }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { opacity, filter } = useTransition(
    clip.enterTransition,
    clip.exitTransition,
  );

  // Calculate scale animation (Ken Burns effect)
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
  const volume = clip.volume ?? 1;

  // trimStartMs → startFrom in frames
  const startFrom = clip.trimStartMs != null
    ? msToFrames(clip.trimStartMs, fps)
    : undefined;

  // trimEndMs → endAt in frames
  const endAt = clip.trimEndMs != null
    ? msToFrames(clip.trimEndMs, fps)
    : undefined;

  return (
    <AbsoluteFill style={{ opacity, overflow: "hidden" }}>
      <OffthreadVideo
        src={staticFile(`${projectPath}/${clip.src}`)}
        volume={volume}
        startFrom={startFrom}
        endAt={endAt}
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
