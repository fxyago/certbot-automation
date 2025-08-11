import { env } from "bun";
import {
  Collection,
  MongoClient,
  type ChangeStreamDocument,
  type ChangeStreamDocumentKey,
  type ChangeStreamInsertDocument,
  type ChangeStreamUpdateDocument,
} from "mongodb";
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
  return new MongoClient(MONGODB_URI);
};

export const watchCollection = async ({
  onInsert = () => void 0,
  onUpdate = () => void 0,
  onDelete = () => void 0,
}: ChangeStreamParams) => {
  const client = getClient();

  try {
    await client.connect();
    console.log("Conectado ao MongoDB com sucesso!");

    const db = client.db(env.MONGODB_DB);
    const collection: Collection = db.collection(env.MONGODB_COLLECTION);

    const changeStream = collection.watch();

    console.log(
      `Aguardando por alterações em: ${env.MONGODB_DB}.${env.MONGODB_COLLECTION}...`
    );

    changeStream.on(
      "change",
      async (change: ChangeStreamDocument<CustomDomainSchema>) => {
        switch (change.operationType) {
          case "insert":
            onInsert(change);
            break;
          case "update":
            onUpdate(change);
            break;

          case "delete":
            onDelete(change);
            break;

          default:
            console.log(`Operação desconhecida: ${change.operationType}`);
            console.log(change);
        }
      }
    );
    await new Promise(() => {});
  } catch (error) {
    console.error(error);
  }
};
