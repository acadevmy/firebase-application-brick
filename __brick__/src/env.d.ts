interface ImportMetaEnv {
  // Vite Env variable detect whether the app is running in production
  PROD: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
