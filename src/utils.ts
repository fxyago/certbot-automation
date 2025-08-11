import { env, spawn } from "bun";

type CopyCertificateParams = {
  certPath: string;
  keyPath: string;
  destination: string;
};

export const copyCertificate = async ({
  certPath,
  keyPath,
  destination,
}: CopyCertificateParams) => {
  try {
    await spawn({
      cmd: ["ln", "-s", `${destination}`, certPath],
      stdout: "pipe",
    }).exited;
    console.log("Criado link simbólico para o certificado");

    await spawn({
      cmd: ["ln", "-s", `${destination}`, keyPath],
      stdout: "pipe",
    }).exited;
    console.log("Criado link simbólico para a chave do certificado");
  } catch (error) {
    console.error("Erro em criação de symlinks: ", error);
  }
};

export const runAzureSync = async () => {
  const subprocess = spawn({
    cmd: [
      "azcopy",
      "sync",
      `${env.AZCOPY_ROOT_FOLDER ?? "/etc/azcopy-root"}/${env.NODE_ENV}`,
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
