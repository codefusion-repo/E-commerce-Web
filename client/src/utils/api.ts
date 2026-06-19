const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");
const normalizePath = (path: string) => (path.startsWith("/") ? path : `/${path}`);

const firstConfiguredUrl = (values: Array<string | undefined>) => {
  const value = values.find((candidate) => candidate && candidate.trim().length > 0);
  return value ? trimTrailingSlash(value) : "";
};

export const getClientApiBaseUrl = () =>
  firstConfiguredUrl([
    process.env.NEXT_PUBLIC_API_URL,
    process.env.NEXT_PUBLIC_BACKEND_URL,
    process.env.NEXT_PUBLIC_URL_PRO,
    process.env.NEXT_PUBLIC_URL_DOCKER,
  ]);

export const getServerApiBaseUrl = () =>
  firstConfiguredUrl([
    process.env.API_INTERNAL_URL,
    process.env.API_URL,
    process.env.NEXT_PUBLIC_API_URL,
    process.env.NEXT_PUBLIC_BACKEND_URL,
    process.env.NEXT_PUBLIC_URL_PRO,
    process.env.NEXT_PUBLIC_URL_DOCKER,
  ]);

export const clientApiUrl = (path: string) =>
  `${getClientApiBaseUrl()}${normalizePath(path)}`;

export const serverApiUrl = (path: string) =>
  `${getServerApiBaseUrl()}${normalizePath(path)}`;
