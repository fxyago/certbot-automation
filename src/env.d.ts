declare namespace NodeJS {
  interface ProcessEnv {
    AZCOPY_ROOT_FOLDER?: string;
    AZCOPY_SAS_URI: string;
    MONGODB_URI: string;
    MONGODB_DB: string;
    MONGODB_COLLECTION: string;
    MONGODB_USERNAME: string;
    MONGODB_PASSWORD: string;
    MONGODB_URI_PARAMS?: string;
    NODE_ENV: "development" | "staging" | "production";
  }
}
