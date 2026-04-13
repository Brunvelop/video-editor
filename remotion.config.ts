// See all configuration options: https://remotion.dev/docs/config
// Each option also is available as a CLI flag: https://remotion.dev/docs/cli

// Note: When using the Node.JS APIs, the config file doesn't apply. Instead, pass options directly to the APIs

import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);

// Enable GPU acceleration in headless Chromium for all renders.
// This accelerates: filter:blur(), transform, linear/radial-gradient(),
// box-shadow, text-shadow, mix-blend-mode and 2D Canvas operations.
// On Linux the ANGLE renderer uses EGL under the hood.
Config.setChromiumOpenGlRenderer("angle");
