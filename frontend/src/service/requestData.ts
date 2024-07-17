import getNonce from "./nonce-helper";

type RequestData = { [key: string]: any };

export interface RequestResponseWithPagination {
  _pagination: {
    total?: number;
    totalPages?: number;
  };
}

export async function requestData<T>(
  path: string | URL,
  data?: RequestData,
  initOptions: RequestInit = {}
) {
  const { nonce, root } = await getNonce();
  let url: URL;
  // extract path
  if (typeof path === "string") {
    url = new URL(root + path);
  } else {
    url = path;
  }

  // set header if query
  const headers = new Headers(initOptions.headers);
  delete initOptions.headers;
  const options = {
    ...initOptions,
    headers,
  } as RequestInit;

  // set nonce to request header
  headers.append("X-WP-Nonce", nonce);

  // apply data to request
  if (data) {
    // apply get variable binding if this is a GET call.
    if (!options.method || options.method === "GET") {
      // join existing search params with data
      const params = new URLSearchParams();
      for(let key in data) {
        if (!key) {
          continue
        }
        if(Array.isArray(data[key])) {
          data[key].forEach((it: string | number) => params.append(key + '[]', it as string))
        } else {
          params.append(key, data[key])
        }
      }
      params.forEach(
        (value, key) => url.searchParams?.append(key, value)
      );
    } else {
        headers.append("content-type", "application/json");
        options.body = JSON.stringify(data);
    }
  }

  // request stuff
  try {
    const response = await fetch(url.toString(), options);
    if (!response.ok) {
      throw new Error(`Fehler beim Abrufen der Daten: ${response.statusText}`);
    }

    // extract pagination data: https://developer.wordpress.org/rest-api/using-the-rest-api/pagination/
    const data = (await response.json()) as RequestResponseWithPagination & T;
    data["_pagination"] = {
      total: parseHeaderNumber(response.headers.get("X-WP-Total")),
      totalPages: parseHeaderNumber(response.headers.get("X-WP-TotalPages")),
    };

    // return data
    return data;
  } catch (error) {
    console.error("Fehler beim Abrufen der Daten:", error);
    throw new Error(
      `Fehler beim Abrufen der Daten: ${(error as Error).message}`
    );
  }
}

function parseHeaderNumber(s: string | null): number | undefined {
  return s ? parseInt(s, 10) : undefined;
}
