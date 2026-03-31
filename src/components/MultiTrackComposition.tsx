import React from "react";
import { AbsoluteFill } from "remotion";
import { AudioTrack, Timeline, VisualTrack } from "../lib/types";
import { TrackRenderer } from "./TrackRenderer";

interface MultiTrackCompositionProps {
  timeline: Timeline | null;
  projectPath: string;
}

export const MultiTrackComposition: React.FC<MultiTrackCompositionProps> = ({
  timeline,
  projectPath,
}) => {
  if (!timeline) return null;

  const fps = timeline.fps;

  // Separate visual and audio tracks
  const visualTracks = timeline.tracks
    .filter((t): t is VisualTrack => t.type === "visual")
    .sort((a, b) => a.zIndex - b.zIndex); // lower zIndex renders first (behind)

  const audioTracks = timeline.tracks.filter(
    (t): t is AudioTrack => t.type === "audio",
  );

  return (
    <AbsoluteFill>
      {/* Visual tracks: each wrapped in AbsoluteFill, stacked by zIndex order */}
      {visualTracks.map((track) => (
        <AbsoluteFill key={track.id}>
          <TrackRenderer track={track} fps={fps} projectPath={projectPath} />
        </AbsoluteFill>
      ))}

      {/* Audio tracks: no AbsoluteFill needed */}
      {audioTracks.map((track) => (
        <TrackRenderer
          key={track.id}
          track={track}
          fps={fps}
          projectPath={projectPath}
        />
      ))}
    </AbsoluteFill>
  );
};
