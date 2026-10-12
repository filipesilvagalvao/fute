const DEFAULT_BASE_URL = "https://futemax.com.br";

function resolveBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || DEFAULT_BASE_URL;
  return raw.replace(/\/+$/, "");
}

export const siteConfig = {
  baseUrl: resolveBaseUrl(),
  name: "FuteMax",
  description:
    "Acompanhe todos os campeonatos de futebol, jogos de hoje e canais de tv esportivos.",
};

export function getMetadataBase(): URL {
  return new URL(siteConfig.baseUrl);
}
