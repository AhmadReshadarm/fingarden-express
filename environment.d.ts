declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ACCESS_SECRET_TOKEN: string;
    }
  }
}

export {};
