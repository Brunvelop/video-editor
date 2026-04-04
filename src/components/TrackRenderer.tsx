import React from "react";
import { Sequence } from "remotion";
import { AudioClip as AudioClipType, Track, VisualClip } from "../lib/types";
import { msToFrames } from "../lib/utils";
import { AudioClip } from "./clips/AudioClip";
import { HeroTitleClip } from "./clips/HeroTitleClip";
import { ImageClip } from "./clips/ImageClip";
import { TextClip } from "./clips/TextClip";
import { VideoClip } from "./clips/VideoClip";

interface TrackRendererProps {
  track: Track;
  fps: number;
  projectPath: string;
}

export const TrackRenderer: React.FC<TrackRendererProps> = ({
  track,
  fps,
  projectPath,
}) => {
  return (
    <>
      {track.clips.map((clip, index) => {
        const from = msToFrames(clip.startMs, fps);
        const durationInFrames = msToFrames(clip.endMs - clip.startMs, fps);

        return (
          <Sequence
            key={`${track.id}-${index}`}
            from={from}
            durationInFrames={durationInFrames}
          >
            <ClipRenderer clip={clip} projectPath={projectPath} />
          </Sequence>
        );
      })}
    </>
  );
};

const ClipRenderer: React.FC<{
  clip: VisualClip | AudioClipType;
  projectPath: string;
}> = ({ clip, projectPath }) => {
  switch (clip.type) {
    case "image":
      return <ImageClip clip={clip} projectPath={projectPath} />;
    case "video":
      return <VideoClip clip={clip} projectPath={projectPath} />;
    case "text":
      return <TextClip clip={clip} />;
    case "hero-title":
      return <HeroTitleClip clip={clip} />;
    case "audio":
      return <AudioClip clip={clip} projectPath={projectPath} />;
    default:
      return null;
  }
};
