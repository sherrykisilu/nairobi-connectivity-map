/// <reference types="vite/client" />

// Tells TypeScript which VITE_ variables exist, so a typo is a compile error.
interface ImportMetaEnv {
  readonly VITE_MAPBOX_TOKEN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
