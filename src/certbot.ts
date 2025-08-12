import { spawn } from "bun";

type GetCertificateParams = {
  domain: string;
  name: string;
  email?: string;
};

export const getCertificate = async ({
  domain,
  name,
  email = "suporte@cloudworks.com.br",
}: GetCertificateParams) => {
  const certbotCommand = `certbot certonly --agree-tos --non-interactive --webroot --webroot-path /etc/letsencrypt/ --email ${email} --cert-name ${name} -d ${domain}`;
  const subprocess = spawn({
    cmd: certbotCommand.split(" "),
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
  const renewCommand = "certbot renew";
  return spawn({
    cmd: renewCommand.split(" "),
    stdout: "pipe",
  });
};
