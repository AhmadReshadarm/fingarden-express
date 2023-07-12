declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EMAIL_SECRET_TOKEN: string;
      ACCESS_SECRET_TOKEN: string;
      REFRESH_SECRET_TOKEN: string;
    }
  }
}

export {};
