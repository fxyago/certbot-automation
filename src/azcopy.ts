import { env, spawn } from "bun";
import { AZURE_BLOB_DIRECTORY } from "./constants";

export const runAzureSync = async () => {
  const subprocess = spawn({
    cmd: [
      "azcopy",
      "sync",
      `${AZURE_BLOB_DIRECTORY}`,
      "https://storage.azure.com/ellevo-next-staging-storage",
    ],
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
  return spawn({
    cmd: ["azcopy", "copy", AZURE_BLOB_DIRECTORY, env.AZCOPY_SAS_URI],
    stdout: "pipe",
  });
};

export const copyFromAzure = async () => {
  return spawn({
    cmd: ["azcopy", "copy", env.AZCOPY_SAS_URI, AZURE_BLOB_DIRECTORY],
    stdout: "pipe",
  });
};
