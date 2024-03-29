import getNonce from "./nonce-helper";

type RequestData = FormData | { [key: string]: any };

export async function requestData(
  path: string | URL,
  data?: RequestData,
  initOptions: RequestInit = {}
) {
  if (path instanceof URL) {
    path = path.href;
  }
  const headers = new Headers(initOptions.headers);
  delete initOptions.headers;
  const options = {
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

  try {
    const url = new URL(root + path, root);
    const response = await fetch(url.toString(), options);
    if (!response.ok) {
      throw new Error(`Fehler beim Abrufen der Daten: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error("Fehler beim Abrufen der Daten:", error);
    throw new Error(
      `Fehler beim Abrufen der Daten: ${(error as Error).message}`
    );
  }
}
