import React from "react";
import { Composition, getStaticFiles, staticFile } from "remotion";
import { z } from "zod";
import { MultiTrackComposition } from "./components/MultiTrackComposition";
import { TimelineSchema } from "./lib/types";
import {
  calculateTimelineDuration,
  msToFrames,
  getProjectPath,
} from "./lib/utils";

const compositionPropsSchema = z.object({
  timeline: TimelineSchema.nullable(),
  projectPath: z.string(),
});

type CompositionProps = z.infer<typeof compositionPropsSchema>;

export const RemotionRoot: React.FC = () => {
  const staticFiles = getStaticFiles();
  const projects = staticFiles
    .filter((file) => file.name.endsWith("timeline.json"))
    .map((file) => file.name.split("/")[1]);

  return (
    <>
      {projects.map((projectName) => (
        <Composition
          key={projectName}
          id={projectName}
          component={MultiTrackComposition as React.ComponentType<CompositionProps>}
          fps={30}
          width={1080}
          height={1920}
          schema={compositionPropsSchema}
          defaultProps={{
            timeline: null,
            projectPath: getProjectPath(projectName),
          }}
          calculateMetadata={async ({ props }) => {
            const timelineUrl = staticFile(
              `content/${projectName}/timeline.json`,
            );
            const response = await fetch(timelineUrl);
            const json = await response.json();
            const timeline = TimelineSchema.parse(json);

            const fps = timeline.fps;
            const durationMs = calculateTimelineDuration(timeline);
            const durationInFrames = msToFrames(durationMs, fps);

            return {
              fps,
              width: timeline.width,
              height: timeline.height,
              durationInFrames,
              props: {
                ...props,
                timeline,
                projectPath: getProjectPath(projectName),
              },
            };
          }}
        />
      ))}
    </>
  );
};
