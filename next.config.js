/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  experimental: {
    serverActions: {
      // Uploads go through a Server Action: the file (max 4 MB, see MAX_FILE_BYTES in
      // src/lib/materials.ts) plus its preview must fit, or Next rejects them with 413.
      bodySizeLimit: "5mb",
    },
  },
};

export default config;
