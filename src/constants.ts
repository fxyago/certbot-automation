import { env } from "bun";

export const AZURE_BLOB_DIRECTORY = `${
  env.AZCOPY_LOCAL_FOLDER ?? "/etc/azcopy-root"
}/${env.NODE_ENV}`;

export const AZURE_BLOB_NGINX_CERT_DIRECTORY = `${AZURE_BLOB_DIRECTORY}/nginx/certificates`;
export const AZURE_BLOB_NGINX_CONF_DIRECTORY = `${AZURE_BLOB_DIRECTORY}/nginx/conf.d`;
export const AZURE_BLOB_NGINX_TEMPLATES_DIRECTORY = `${AZURE_BLOB_DIRECTORY}/nginx/templates`;

export const NGINX_TEMPLATE = `server {
  listen 443 ssl;
  server_name %SERVER_NAME%;

  ssl_certificate %CERTIFICATE_PATH%;
  ssl_certificate_key %CERTIFICATE_KEY_PATH%;
  ssl_protocols TLSv1.2 TLSv1.3;

  client_max_body_size 60M;
  proxy_read_timeout 600s;

  include ../templates/headers.conf;
  include ../templates/locations.conf;
}`;
