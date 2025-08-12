import { env, spawn } from "bun";

export const azureStorageWithPath = (path: string = "/") => {
  return `${env.AZCOPY_SAS_URI}${path}?${env.AZCOPY_SAS_TOKEN}`;
};

export const localStorageWithPath = (path: string = "/") => {
  return `${env.AZCOPY_LOCAL_FOLDER}${path}`;
};

export const runAzureSync = async () => {
  const syncCommand = `azcopy sync ${localStorageWithPath()} ${azureStorageWithPath()} --recursive`;
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
  const copyCommand = `azcopy copy ${localStorageWithPath(
    "/*"
  )} ${azureStorageWithPath()} --recursive`;
  return spawn({
    cmd: copyCommand.split(" "),
    stdout: "pipe",
  });
};

export const copyFromAzure = async () => {
  const copyCommand = `azcopy copy ${azureStorageWithPath(
    "/*"
  )} ${localStorageWithPath()} --recursive`;
  return spawn({
    cmd: copyCommand.split(" "),
    stdout: "pipe",
  });
};
