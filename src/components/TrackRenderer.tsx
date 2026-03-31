import React from "react";
import { Sequence } from "remotion";
import { AudioClip, Track, VisualClip } from "../lib/types";
import { msToFrames } from "../lib/utils";

interface TrackRendererProps {
  track: Track;
  fps: number;
}

export const TrackRenderer: React.FC<TrackRendererProps> = ({ track, fps }) => {
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
            <ClipRenderer clip={clip} fps={fps} />
          </Sequence>
        );
      })}
    </>
  );
};

const ClipRenderer: React.FC<{ clip: VisualClip | AudioClip; fps: number }> = ({
  clip,
}) => {
  switch (clip.type) {
    case "image":
      return <div>ImageClip placeholder: {clip.src}</div>;
    case "video":
      return <div>VideoClip placeholder: {clip.src}</div>;
    case "text":
      return <div>TextClip placeholder: {clip.text}</div>;
    case "audio":
      // Audio clips render nothing visually — AudioClip component will go here
      return null;
    default:
      return null;
  }
};
