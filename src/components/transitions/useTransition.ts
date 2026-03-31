import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Transition } from "../../lib/types";
import { msToFrames } from "../../lib/utils";

interface TransitionResult {
  opacity: number;
  filter: string;
}

export const useTransition = (
  enterTransition?: Transition,
  exitTransition?: Transition,
): TransitionResult => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  let opacity = 1;
  let blurPx = 0;

  // Enter transition
  if (enterTransition && enterTransition.type !== "none") {
    const enterFrames = msToFrames(enterTransition.durationMs, fps);

    if (enterTransition.type === "fade") {
      opacity *= interpolate(frame, [0, enterFrames], [0, 1], {
        extrapolateRight: "clamp",
      });
    }

    if (enterTransition.type === "blur") {
      blurPx += interpolate(frame, [0, enterFrames], [25, 0], {
        extrapolateRight: "clamp",
      });
    }
  }

  // Exit transition
  if (exitTransition && exitTransition.type !== "none") {
    const exitFrames = msToFrames(exitTransition.durationMs, fps);
    const exitStart = durationInFrames - exitFrames;

    if (exitTransition.type === "fade") {
      opacity *= interpolate(frame, [exitStart, durationInFrames], [1, 0], {
        extrapolateLeft: "clamp",
      });
    }

    if (exitTransition.type === "blur") {
      blurPx += interpolate(frame, [exitStart, durationInFrames], [0, 25], {
        extrapolateLeft: "clamp",
      });
    }
  }

  return {
    opacity,
    filter: blurPx > 0 ? `blur(${blurPx}px)` : "none",
  };
};
