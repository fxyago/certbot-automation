import { env } from "bun";

export const AZURE_BLOB_DIRECTORY = `${
  env.AZCOPY_ROOT_FOLDER ?? "/etc/azcopy-root"
}/${env.NODE_ENV}`;

export const AZURE_BLOB_NGINX_CERT_DIRECTORY = `${AZURE_BLOB_DIRECTORY}/certificates`;
export const AZURE_BLOB_NGINX_CONF_DIRECTORY = `${AZURE_BLOB_DIRECTORY}/conf.d`;
export const AZURE_BLOB_NGINX_TEMPLATES_DIRECTORY = `${AZURE_BLOB_DIRECTORY}/templates`;
