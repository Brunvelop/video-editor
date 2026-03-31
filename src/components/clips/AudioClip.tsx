import React from "react";
import { Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { AudioClip as AudioClipType } from "../../lib/types";
import { msToFrames } from "../../lib/utils";

interface AudioClipProps {
  clip: AudioClipType;
  projectPath: string;
}

export const AudioClip: React.FC<AudioClipProps> = ({ clip, projectPath }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const baseVolume = clip.volume ?? 1;
  const hasFadeIn = clip.fadeInMs != null && clip.fadeInMs > 0;
  const hasFadeOut = clip.fadeOutMs != null && clip.fadeOutMs > 0;

  let volume = baseVolume;

  if (hasFadeIn || hasFadeOut) {
    const fadeInFrames = hasFadeIn ? msToFrames(clip.fadeInMs!, fps) : 0;
    const fadeOutFrames = hasFadeOut ? msToFrames(clip.fadeOutMs!, fps) : 0;
    const fadeOutStart = durationInFrames - fadeOutFrames;

    volume = interpolate(
      frame,
      [
        0,
        ...(hasFadeIn ? [fadeInFrames] : []),
        ...(hasFadeOut ? [fadeOutStart, durationInFrames] : []),
      ],
      [
        hasFadeIn ? 0 : baseVolume,
        ...(hasFadeIn ? [baseVolume] : []),
        ...(hasFadeOut ? [baseVolume, 0] : []),
      ],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
  }

  return (
    <Audio
      src={staticFile(`${projectPath}/${clip.src}`)}
      volume={volume}
    />
  );
};
