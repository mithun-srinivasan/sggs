/**
 * postcss.config.mjs
 * ---------------------------------------------------------------------------
 * PostCSS configuration — wires Tailwind CSS v4 into the build pipeline.
 *
 * Tailwind v4 uses `@tailwindcss/postcss` as its PostCSS plugin instead of
 * the older `tailwindcss` / `autoprefixer` combination.
 */

const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;