import { env } from "bun";
import {
  Collection,
  MongoClient,
  type ChangeStreamDocument,
  type ChangeStreamDocumentKey,
  type ChangeStreamInsertDocument,
  type ChangeStreamUpdateDocument,
} from "mongodb";
import { log } from "./logging";
import type { CustomDomainSchema } from "./types";

type ChangeStreamParams = {
  onInsert?: (document: ChangeStreamInsertDocument<CustomDomainSchema>) => void;
  onUpdate?: (
    updateDescription: ChangeStreamUpdateDocument<CustomDomainSchema>
  ) => void;
  onDelete?: (documentKey: ChangeStreamDocumentKey<CustomDomainSchema>) => void;
};

const getClient = () => {
  const MONGODB_URI = `mongodb+srv://${env.MONGODB_USERNAME}:${
    env.MONGODB_PASSWORD
  }@${env.MONGODB_URI}${env.MONGODB_URI_PARAMS ?? ""}`;
  log.debug("Conectando ao MongoDB...");
  log.debug(`MongoDB URI: ${env.MONGODB_URI}`);
  log.debug(`MongoDB Username: ${env.MONGODB_USERNAME}`);
  log.debug(`MongoDB Password: ${"*".repeat(env.MONGODB_PASSWORD.length)}`);
  log.debug(`MongoDB URI Params: ${env.MONGODB_URI_PARAMS}`);
  log.debug(`MongoDB Full URI: ${MONGODB_URI}`);
  return new MongoClient(MONGODB_URI);
};

export const watchCollection = async ({
  onInsert = () => void 0,
  onUpdate = () => void 0,
  onDelete = () => void 0,
}: ChangeStreamParams) => {
  const client = getClient();

  try {
    log.info("Conectando ao MongoDB...");
    await client.connect();
    log.info("Conectado ao MongoDB com sucesso!");

    log.debug("Conectando ao banco de dados...");
    log.trace(`MongoDB DB: ${env.MONGODB_DB}`);
    const db = client.db(env.MONGODB_DB);

    log.debug("Conectando à collection...");
    log.trace(`MongoDB Collection: ${env.MONGODB_COLLECTION}`);
    const collection: Collection = db.collection(env.MONGODB_COLLECTION);

    log.debug("Iniciando processo de watch...");
    const changeStream = collection.watch();

    log.info(
      `Aguardando por alterações em: ${env.MONGODB_DB}.${env.MONGODB_COLLECTION}...`
    );

    changeStream.on(
      "change",
      async (change: ChangeStreamDocument<CustomDomainSchema>) => {
        switch (change.operationType) {
          case "insert":
            log.trace("Alteração de inserção detectada");
            onInsert(change);
            break;
          case "update":
            log.trace("Alteração de atualização detectada");
            onUpdate(change);
            break;

          case "delete":
            log.trace("Alteração de exclusão detectada");
            onDelete(change);
            break;

          default:
            log.warn(`Operação desconhecida: ${change.operationType}`);
            log.warn(change);
            log.warn("-".repeat(16));
            break;
        }
      }
    );
    await new Promise(() => {});
  } catch (error) {
    log.error(`Erro ao iniciar processo de watch: ${error}`);
  }
};
