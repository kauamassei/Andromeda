/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_BG_TYPE?: 'gradient' | 'image' | 'video'
  readonly VITE_BG_SRC?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
