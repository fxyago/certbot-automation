import type {
  ChangeStreamDocumentKey,
  ChangeStreamInsertDocument,
  ChangeStreamUpdateDocument,
} from "mongodb";
import { copyFromAzure, copyToAzure, runAzureSync } from "./src/azcopy";
import { getCertificate } from "./src/certbot";
import { watchCollection } from "./src/mongodb";
import type { CustomDomainSchema } from "./src/types";
import {
  copyCertsFromLetsEncryptLive,
  createConfFile,
  createDirs,
} from "./src/utils";

const onInsert = async (
  change: ChangeStreamInsertDocument<CustomDomainSchema>
) => {
  console.log("Inserido documento: ", change);
  const document = change.fullDocument;
  const insertedDocumentId = document?._id;
  if (insertedDocumentId) {
    console.log(
      "Novo domínio inserido, gerando certificado e criando configuração..."
    );

    await getCertificate({
      domain: document.Domain,
      name: document.TenantDomain,
    });

    await copyCertsFromLetsEncryptLive();

    await createConfFile({
      name: document.TenantDomain,
      domain: document.Domain,
    });

    await runAzureSync();
    console.log(
      "Novo domínio inserido, gerando certificado e criando configuração..."
    );
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

const sync = async () => {
  await copyFromAzure();
  await copyCertsFromLetsEncryptLive();
  await copyToAzure();
};

await createDirs();
await sync();
setInterval(sync, 1000 * 60 * 15);

watchCollection({
  onInsert,
  onUpdate,
  onDelete,
});
