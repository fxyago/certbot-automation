import { env } from "bun";
import type {
  ChangeStreamDocumentKey,
  ChangeStreamInsertDocument,
  ChangeStreamUpdateDocument,
} from "mongodb";
import { getCertificate } from "./src/certbot";
import { watchCollection } from "./src/mongodb";
import type { CustomDomainSchema } from "./src/types";
import { copyCertificate, runAzureSync } from "./src/utils";

const onInsert = async (
  change: ChangeStreamInsertDocument<CustomDomainSchema>
) => {
  console.log("Inserido documento: ", change);
  const insertedDocumentId = change.fullDocument?._id;
  if (insertedDocumentId) {
    const { certPath, keyPath } = await getCertificate({
      domain: change.fullDocument.Domain,
      name: change.fullDocument.TenantDomain,
      folder: env.NODE_ENV,
    });

    copyCertificate({
      certPath,
      keyPath,
      destination: change.fullDocument.TenantId,
    });

    runAzureSync();
  }
};

const onUpdate = (change: ChangeStreamUpdateDocument<CustomDomainSchema>) => {
  const updatedDocumentId = change.documentKey?._id;
  if (updatedDocumentId) {
    console.log(`Documento com ID ${updatedDocumentId} atualizado`);
    if (change.updateDescription) {
      console.log(
        "Campos atualizados:",
        change.updateDescription.updatedFields
      );
      console.log("Campos removidos:", change.updateDescription.removedFields);
    } else {
      console.log("Nenhuma descrição de atualização fornecida");
    }
  }
};

const onDelete = (documentKey: ChangeStreamDocumentKey<CustomDomainSchema>) => {
  console.log("Deletado documento: ", documentKey);
};

watchCollection({
  onInsert,
  onUpdate,
  onDelete,
});
