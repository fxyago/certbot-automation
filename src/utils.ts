import { file, spawn } from "bun";
import { copyFromAzure, copyToAzure } from "./azcopy";
import { AZURE_BLOB_NGINX_CERT_DIRECTORY } from "./constants";

export const copyCertsFromLetsEncryptLive = async () => {
  const copyCommand = `cd /etc/letsencrypt/live/ && mkdir -p ${AZURE_BLOB_NGINX_CERT_DIRECTORY} && cp -RL --parents ./**/{fullchain,privkey}.pem ${AZURE_BLOB_NGINX_CERT_DIRECTORY}`;

  const copyProcess = spawn({
    cmd: copyCommand.split(" "),
    stdout: "pipe",
  });

  await copyProcess.exited;

  if (copyProcess.exitCode !== 0)
    throw new Error(`Erro ao copiar os certificados: ${copyProcess.stdout}`);
};

export const createConfFile = async ({
  name,
  domain,
}: {
  name: string;
  domain: string;
}) => {
  const confFileTemplate = file("./nginx-templates/default.conf");
  let confText = await confFileTemplate.text();

  confText = confText.replaceAll("%SERVER_NAME%", domain);
  confText = confText.replaceAll(
    "%CERTIFICATE_PATH%",
    `../certificates/${name}/fullchain.pem`
  );
  confText = confText.replaceAll(
    "%CERTIFICATE_KEY_PATH%",
    `../certificates/${name}/privkey.pem`
  );
};

export const syncAzureWithLocal = async () => {
  const sync = async () => {
    await copyFromAzure();
    await copyCertsFromLetsEncryptLive();
    await copyToAzure();
  };

  await sync();
  setInterval(sync, 1000 * 60 * 15);
};
