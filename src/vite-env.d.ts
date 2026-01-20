/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
  // Agregar aquí otras variables de entorno si es necesario
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
