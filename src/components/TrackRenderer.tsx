import React from "react";
import { Sequence } from "remotion";
import { AudioClip, Track, VisualClip } from "../lib/types";
import { msToFrames } from "../lib/utils";
import { ImageClip } from "./clips/ImageClip";

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
            <ClipRenderer clip={clip} fps={fps} projectPath={projectPath} />
          </Sequence>
        );
      })}
    </>
  );
};

const ClipRenderer: React.FC<{
  clip: VisualClip | AudioClip;
  fps: number;
  projectPath: string;
}> = ({ clip, projectPath }) => {
  switch (clip.type) {
    case "image":
      return <ImageClip clip={clip} projectPath={projectPath} />;
    case "video":
      return <div>VideoClip placeholder: {clip.src}</div>;
    case "text":
      return <div>TextClip placeholder: {clip.text}</div>;
    case "audio":
      // AudioClip component will go here
      return null;
    default:
      return null;
  }
};
