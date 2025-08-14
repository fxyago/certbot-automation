declare namespace NodeJS {
  interface ProcessEnv {
    AZCOPY_LOCAL_FOLDER?: string;
    AZCOPY_SAS_TOKEN: string;
    AZCOPY_SAS_URI: string;
    MONGODB_URI: string;
    MONGODB_DB: string;
    MONGODB_COLLECTION: string;
    MONGODB_USERNAME: string;
    MONGODB_PASSWORD: string;
    MONGODB_URI_PARAMS?: string;
    NODE_ENV: "development" | "staging" | "production";
    LOG_LEVEL?: "fatal" | "error" | "warn" | "info" | "debug" | "trace";
  }
}
