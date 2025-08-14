import { spawn } from "bun";
import { log } from "./logging";

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
  log.trace("Iniciando geração de certificado Let's Encrypt");
  log.trace(`Comando: ${certbotCommand}`);
  const subprocess = spawn({
    cmd: certbotCommand.split(" "),
    stdout: "pipe",
  });

  await subprocess.exited;

  if (subprocess.exitCode !== 0) {
    throw new Error(
      `Erro ao executar o comando: ${await subprocess.stdout.text()}`
    );
  }

  log.debug("Geração de certificado finalizada com sucesso");
};

export const renewCertificates = async () => {
  const renewCommand = "certbot renew";
  log.trace("Iniciando renovação de certificado Let's Encrypt");
  log.trace(`Comando: ${renewCommand}`);
  const subprocess = spawn({
    cmd: renewCommand.split(" "),
    stdout: "pipe",
  });

  await subprocess.exited;

  if (subprocess.exitCode !== 0) {
    throw new Error(
      `Erro ao executar o comando: ${await subprocess.stdout.text()}`
    );
  }

  log.debug("Renovação de certificado finalizada com sucesso");
};
