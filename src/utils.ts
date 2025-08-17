import { $, file } from "bun";
import { copyFromAzure, copyToAzure } from "./azcopy";
import {
  AZURE_BLOB_CERT_DIRECTORY,
  AZURE_BLOB_CONF_DIRECTORY,
  AZURE_BLOB_DIRECTORY,
  NGINX_TEMPLATE,
} from "./constants";
import { log } from "./logging";

export const createDir = async (dir: string) => {
  log.debug(`Criando diretório: ${dir}`);
  const output = await $`mkdir -p ${dir}`;

  if (output.exitCode === 0) {
    log.trace(output.text());
    log.debug(`Diretório criado: ${dir}`);
    return;
  }
  throw new Error(`Erro ao criar diretório: ${output.text()}`);
};

export const copyCertsFromLetsEncryptLive = async () => {
  await createDir(AZURE_BLOB_CERT_DIRECTORY);
  log.trace(`Copiando certificados de Let's Encrypt para a pasta local Azure`);
  log.trace(
    `/bin/bash -c "shopt -s globstar && cp -RL --parents ./**/{fullchain,privkey}.pem ${AZURE_BLOB_CERT_DIRECTORY}`
  );
  const output =
    await $`/bin/bash -c "shopt -s globstar && cp -RL --parents ./**/{fullchain,privkey}.pem ${AZURE_BLOB_CERT_DIRECTORY}"`.cwd(
      "/etc/letsencrypt/live"
    );

  if (output.exitCode === 0) {
    log.trace(output.text());
    log.debug(`Certificados copiados para a pasta local Azure`);
    return;
  }

  throw new Error(`Erro ao copiar os certificados: ${output.text()}`);
};

export const createConfFile = async ({
  name,
  domain,
}: {
  name: string;
  domain: string;
}) => {
  log.trace("Criando configuração Nginx para o domínio");
  let confText = NGINX_TEMPLATE;
  log.trace(`Substituindo dóminio em \`server_name\` para: "${domain}"`);
  confText = confText.replaceAll("%SERVER_NAME%", domain);
  log.trace(
    `Substituindo caminho do certificado para: "../certificates/${name}/fullchain.pem"`
  );
  confText = confText.replaceAll(
    "%CERTIFICATE_PATH%",
    `../certificates/${name}/fullchain.pem`
  );
  log.trace(
    `Substituindo caminho da chave do certificado para: "../certificates/${name}/privkey.pem"`
  );
  confText = confText.replaceAll(
    "%CERTIFICATE_KEY_PATH%",
    `../certificates/${name}/privkey.pem`
  );

  const confFilePath = `${AZURE_BLOB_CONF_DIRECTORY}/${name}.conf`;
  try {
    await file(confFilePath).write(confText);
    log.debug("Arquivo de configuração Nginx criado");
  } catch (error) {
    throw new Error(`Erro ao criar o arquivo de configuração Nginx: ${error}`);
  }
};

export const syncAzureWithLocal = async () => {
  await createDir(AZURE_BLOB_DIRECTORY);

  const sync = async () => {
    await copyFromAzure();
    await copyCertsFromLetsEncryptLive();
    await copyToAzure();
  };

  log.debug("Iniciando sincronização inicial de Azure com diretório local");
  await sync();

  log.debug("Agendando sincronização periódica de Azure com diretório local");
  setInterval(sync, 1000 * 60 * 15);
};
