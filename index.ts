import type {
  ChangeStreamDocumentKey,
  ChangeStreamInsertDocument,
  ChangeStreamUpdateDocument,
} from "mongodb";
import { runAzureSync } from "./src/azcopy";
import { getCertificate } from "./src/certbot";
import { log } from "./src/logging";
import { watchCollection } from "./src/mongodb";
import type { CustomDomainSchema } from "./src/types";
import {
  copyCertsFromLetsEncryptLive,
  createConfFile,
  syncAzureWithLocal,
} from "./src/utils";

const onInsert = async (
  change: ChangeStreamInsertDocument<CustomDomainSchema>
) => {
  log.debug(`Inserido documento: ${change}`);
  const document = change.fullDocument;
  const insertedDocumentId = document?._id;
  if (insertedDocumentId) {
    log.info("Novo domínio inserido, iniciando automação de configurações...");

    log.trace(`Gerando novo certificado para domínio: "${document.Domain}"`);
    await getCertificate({
      domain: document.Domain,
      name: document.TenantDomain,
    });

    log.trace(`Copiando certificados gerados para a pasta local Azure...`);
    await copyCertsFromLetsEncryptLive();

    log.trace(`Criando arquivo de configuração Nginx...`);
    await createConfFile({
      name: document.TenantDomain,
      domain: document.Domain,
    });

    log.trace(`Iniciando sincronização de diretório local com Azure...`);
    await runAzureSync();

    log.trace(
      `Automação finalizada! Aguardando por mais alterações em collection`
    );
  }
};

const onUpdate = (change: ChangeStreamUpdateDocument<CustomDomainSchema>) => {
  const updatedDocumentId = change.documentKey?._id;
  if (updatedDocumentId) {
    log.info(`Documento com ID ${updatedDocumentId} atualizado`);
    if (change.updateDescription) {
      log.debug(
        `Campos atualizados: ${change.updateDescription.updatedFields}`
      );
      log.debug(`Campos removidos: ${change.updateDescription.removedFields}`);
    } else {
      log.debug("Nenhuma descrição de atualização fornecida");
    }
  }
};

const onDelete = (documentKey: ChangeStreamDocumentKey<CustomDomainSchema>) => {
  log.info(`Deletado documento: ${documentKey}`);
};

syncAzureWithLocal();

watchCollection({
  onInsert,
  onUpdate,
  onDelete,
});
