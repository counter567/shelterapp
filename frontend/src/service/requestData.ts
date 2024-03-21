import getNonce from "./nonce-helper";

export async function requestData(
  path: string | URL,
  data?: any,
  initOptions: RequestInit = {}
) {
  if (path instanceof URL) {
    path = path.href;
  }
  const headers = new Headers(initOptions.headers);
  delete initOptions.headers;
  const options = {
    mode: "cors",
    credentials: "include",
    referrerPolicy: "strict-origin-when-cross-origin",
    ...initOptions,
    headers,
  } as RequestInit;
  const { nonce, root } = await getNonce();
  headers.append("X-WP-Nonce", nonce);

  if (data) {
    if (data instanceof FormData) {
      options.body = data;
    } else {
      headers.append("content-type", "application/json");
      options.body = JSON.stringify(data);
    }
  }

  return fetch(root + path, options).then((response) => {
    return response.json();
  });
}
