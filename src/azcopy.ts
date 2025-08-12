import { env, spawn } from "bun";
import { AZURE_BLOB_DIRECTORY } from "./constants";

export const runAzureSync = async () => {
  const syncCommand = `azcopy sync ${AZURE_BLOB_DIRECTORY} ${env.AZCOPY_SAS_URI} --recursive`;
  const subprocess = spawn({
    cmd: syncCommand.split(" "),
    stdout: "pipe",
  });
  await subprocess.exited;
  const output = {
    stdout: await subprocess.stdout.text(),
    exitCode: subprocess.exitCode,
  };
  if (output.exitCode !== 0) {
    throw new Error(`Erro ao executar o comando: ${output.stdout}`);
  }
  console.log("Sync finalizado com sucesso");
};

export const copyToAzure = async () => {
  const copyCommand = `azcopy copy ${AZURE_BLOB_DIRECTORY} ${env.AZCOPY_SAS_URI} --recursive`;
  return spawn({
    cmd: copyCommand.split(" "),
    stdout: "pipe",
  });
};

export const copyFromAzure = async () => {
  const copyCommand = `azcopy copy ${env.AZCOPY_SAS_URI} ${AZURE_BLOB_DIRECTORY} --recursive`;
  return spawn({
    cmd: copyCommand.split(" "),
    stdout: "pipe",
  });
};
