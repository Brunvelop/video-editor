import { Timeline } from "./types";

export const msToFrames = (ms: number, fps: number): number =>
  Math.round((ms / 1000) * fps);

export const framesToMs = (frames: number, fps: number): number =>
  (frames / fps) * 1000;

export const calculateTimelineDuration = (timeline: Timeline): number => {
  let maxEndMs = 0;
  for (const track of timeline.tracks) {
    for (const clip of track.clips) {
      if (clip.endMs > maxEndMs) maxEndMs = clip.endMs;
    }
  }
  return maxEndMs;
};

export const getProjectPath = (project: string): string =>
  `content/${project}`;

export const getTimelinePath = (project: string): string =>
  `content/${project}/timeline.json`;
