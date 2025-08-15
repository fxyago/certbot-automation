import { env, spawn } from "bun";
import { AZURE_BLOB_DIRECTORY } from "./constants";
import { log } from "./logging";

export const azureStorageWithPath = (path: string = "") => {
  return `${env.AZCOPY_SAS_URI}${path}?${env.AZCOPY_SAS_TOKEN}`;
};

export const localStorageWithPath = (path: string = "") => {
  return `${AZURE_BLOB_DIRECTORY}${path}`;
};

export const runAzureSync = async () => {
  const syncCommand = `azcopy sync ${localStorageWithPath(
    "/nginx"
  )} ${azureStorageWithPath()} --recursive`;

  log.trace("Iniciando sincronização de diretório local com Azure");
  log.trace(`Local: ${localStorageWithPath("/nginx")}`);
  log.trace(`Azure: ${azureStorageWithPath()}`);
  log.trace(`Comando: ${syncCommand}`);
  log.trace("-".repeat(16));

  const subprocess = spawn({
    cmd: syncCommand.split(" "),
    stdout: "pipe",
  });
  await subprocess.exited;

  if (subprocess.exitCode !== 0) {
    throw new Error(
      `Erro ao executar o comando: ${await subprocess.stdout.text()}`
    );
  }
  log.debug("Sync finalizado com sucesso");
};

export const copyToAzure = async () => {
  const copyCommand = `azcopy copy ${localStorageWithPath(
    "/*"
  )} ${azureStorageWithPath("/")} --recursive`;

  log.trace("Iniciando copy de diretório local para Azure");
  log.trace(`Local: ${localStorageWithPath("/")}`);
  log.trace(`Azure: ${azureStorageWithPath("/")}`);
  log.trace(`Comando: ${copyCommand}`);
  log.trace("-".repeat(16));

  const copyProcess = spawn({
    cmd: copyCommand.split(" "),
    stdout: "pipe",
  });

  await copyProcess.exited;

  if (copyProcess.exitCode !== 0) {
    throw new Error(
      `Erro ao copiar de diretório local para Azure: ${await copyProcess.stdout.text()}`
    );
  }

  log.debug("Copy de diretório local para Azure finalizado");
};

export const copyFromAzure = async () => {
  const copyCommand = `azcopy copy ${azureStorageWithPath(
    "/*"
  )} ${localStorageWithPath("/")} --recursive`;

  log.trace("Iniciando copy de Azure para diretório local");
  log.trace(`Azure: ${azureStorageWithPath("/")}`);
  log.trace(`Local: ${localStorageWithPath("/")}`);
  log.trace(`Comando: ${copyCommand}`);
  log.trace("-".repeat(16));

  const copyProcess = spawn({
    cmd: copyCommand.split(" "),
    stdout: "pipe",
  });

  await copyProcess.exited;

  if (copyProcess.exitCode !== 0) {
    throw new Error(
      `Erro ao copiar de Azure para diretório local: ${await copyProcess.stdout.text()}`
    );
  }

  log.debug("Copy de Azure para diretório local finalizado");
};
