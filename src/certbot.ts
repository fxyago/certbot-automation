import { $ } from "bun";
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
  log.trace("Iniciando geração de certificado Let's Encrypt");
  const certonly =
    await $`certbot certonly --agree-tos --non-interactive --webroot --webroot-path /etc/letsencrypt/ --email ${email} --cert-name ${name} -d ${domain}`;

  if (certonly.exitCode !== 0)
    throw new Error(`Erro ao executar o comando: ${certonly.text()}`);

  log.debug("Geração de certificado finalizada com sucesso");
};

export const renewCertificates = async () => {
  log.trace("Iniciando renovação de certificado Let's Encrypt");
  const renew = await $`certbot renew`;

  if (renew.exitCode !== 0)
    throw new Error(`Erro ao executar o comando: ${renew.text()}`);

  log.debug("Renovação de certificado finalizada com sucesso");
};
