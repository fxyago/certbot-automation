import { file, spawn } from "bun";
import { copyFromAzure, copyToAzure } from "./azcopy";
import {
  AZURE_BLOB_DIRECTORY,
  AZURE_BLOB_NGINX_CERT_DIRECTORY,
  AZURE_BLOB_NGINX_CONF_DIRECTORY,
} from "./constants";
import { log } from "./logging";

export const createDirs = async () => {
  const mkdirCommand = `mkdir -p ${AZURE_BLOB_DIRECTORY}`;
  log.debug(`Criando diretório: ${AZURE_BLOB_DIRECTORY}`);
  log.trace(`Comando: ${mkdirCommand}`);
  const mkdirProcess = spawn({
    cmd: mkdirCommand.split(" "),
    stdout: "pipe",
  });

  await mkdirProcess.exited;

  if (mkdirProcess.exitCode === 0) {
    log.debug(`Diretório criado: ${AZURE_BLOB_DIRECTORY}`);
    return;
  }
  const output = await mkdirProcess.stdout.text();
  throw new Error(`Erro ao criar diretórios: ${output}`);
};

export const copyCertsFromLetsEncryptLive = async () => {
  const copyCommand = `sh -c cd /etc/letsencrypt/live/ && mkdir -p ${AZURE_BLOB_NGINX_CERT_DIRECTORY} && cp -RL --parents ./**/{fullchain,privkey}.pem ${AZURE_BLOB_NGINX_CERT_DIRECTORY}`;

  log.trace(`Copiando certificados de Let's Encrypt para a pasta local Azure`);
  log.trace(`Comando: ${copyCommand}`);
  const copyProcess = spawn({
    cmd: copyCommand.split(" "),
    stdout: "pipe",
  });

  await copyProcess.exited;

  if (copyProcess.exitCode === 0) {
    log.debug(`Certificados copiados para a pasta local Azure`);
    return;
  }

  const output = await copyProcess.stdout.text();
  throw new Error(`Erro ao copiar os certificados: ${output}`);
};

export const createConfFile = async ({
  name,
  domain,
}: {
  name: string;
  domain: string;
}) => {
  const templatePath = "../../nginx-templates/default.conf";
  const confFileTemplate = file(templatePath);

  log.trace("Criando configuração Nginx para o domínio");
  log.trace(`Template path: ${templatePath}`);
  let confText = await confFileTemplate.text();

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

  const confFilePath = `${AZURE_BLOB_NGINX_CONF_DIRECTORY}/${name}.conf`;
  try {
    await file(confFilePath).write(confText);
    log.debug("Arquivo de configuração Nginx criado");
  } catch (error) {
    throw new Error(`Erro ao criar o arquivo de configuração Nginx: ${error}`);
  }
};

export const syncAzureWithLocal = async () => {
  await createDirs();

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
