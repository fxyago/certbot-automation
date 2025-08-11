import { spawn } from "bun";

type GetCertificateParams = {
  domain: string;
  name: string;
  folder: string;
  email?: string;
};

export const getCertificate = async ({
  domain,
  name,
  folder,
  email = "suporte@cloudworks.com.br",
}: GetCertificateParams) => {
  const subprocess = spawn({
    cmd: [
      "certbot",
      "certonly",
      "--agree-tos",
      "--non-interactive",
      "--webroot",
      "--webroot-path",
      `/etc/letsencrypt/${folder}`,
      "-m",
      email,
      "--cert-name",
      name,
      "-d",
      domain,
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
};

export const renewCertificates = async () => {
  return spawn({
    cmd: ["certbot", "renew"],
    stdout: "pipe",
  });
};
