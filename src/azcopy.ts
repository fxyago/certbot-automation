import { $, env } from "bun";
import { AZURE_BLOB_DIRECTORY } from "./constants";
import { log } from "./logging";

export const azureStorageWithPath = (path: string = "") => {
  return `${env.AZCOPY_SAS_URI}${path}?${env.AZCOPY_SAS_TOKEN}`;
};

export const localStorageWithPath = (path: string = "") => {
  return `${AZURE_BLOB_DIRECTORY}${path}`;
};

export const runAzureSync = async () => {
  log.trace("Iniciando sincronização de diretório local com Azure");
  const sync =
    await $`azcopy sync ${localStorageWithPath()} ${azureStorageWithPath()} --recursive`;

  if (sync.exitCode !== 0)
    throw new Error(`Erro ao executar o comando: ${sync.text()}`);

  log.debug("Sync finalizado com sucesso");
};

export const copyToAzure = async () => {
  log.trace("Iniciando copy de diretório local para Azure");
  const output = await $`azcopy copy ${localStorageWithPath(
    "/*"
  )} ${azureStorageWithPath("/.")} --recursive`;

  if (output.exitCode !== 0)
    throw new Error(
      `Erro ao copiar de diretório local para Azure: ${output.text()}`
    );

  log.debug("Copy de diretório local para Azure finalizado");
};

export const copyFromAzure = async () => {
  log.trace("Iniciando copy de Azure para diretório local");
  const output = await $`azcopy copy ${azureStorageWithPath(
    "/*"
  )} ${localStorageWithPath("/.")} --recursive`;

  if (output.exitCode !== 0)
    throw new Error(
      `Erro ao copiar de Azure para diretório local: ${output.text()}`
    );

  log.debug("Copy de Azure para diretório local finalizado");
};
