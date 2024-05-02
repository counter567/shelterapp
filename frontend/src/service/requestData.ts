import getNonce from "./nonce-helper";

type RequestData = FormData | { [key: string]: any };

interface RequestResponseWithPagination {
  _pagination: {
    total?: number;
    totalPages?: number;
  }
}


export async function requestData<T>(
  path: string | URL,
  data?: RequestData,
  initOptions: RequestInit = {}
) {
  let serachParams: URLSearchParams | undefined;
  // extract path
  if (path instanceof URL) {
    serachParams = path.searchParams;
    path = path.href;
  }

  // set header if query
  const headers = new Headers(initOptions.headers);
  delete initOptions.headers;
  const options = {
    ...initOptions,
    headers,
  } as RequestInit;

  // set nonce to request header
  const { nonce, root } = await getNonce();
  headers.append("X-WP-Nonce", nonce);

  // apply data to request
  if (data) {
    // apply get variable binding if this is a GET call.
    if (!options.method || options.method === 'GET') {
      if (serachParams) {
        // join existing search params with data
        const params = new URLSearchParams(data as Record<string, string>);
        params.forEach((value, key) => serachParams?.set(key, value));
        path += '?' + serachParams.toString();
      } else {
        // append data as search params
        path += '?' + new URLSearchParams(data as Record<string, string>).toString();
      }
    } else {
      if (data instanceof FormData) {
        options.body = data;
      } else {
        headers.append("content-type", "application/json");
        options.body = JSON.stringify(data);
      }
    }
  }

  // request stuff
  try {
    const url = new URL(root + path, root);
    const response = await fetch(url.toString(), options);
    if (!response.ok) {
      throw new Error(`Fehler beim Abrufen der Daten: ${response.statusText}`);
    }

    // extract pagination data: https://developer.wordpress.org/rest-api/using-the-rest-api/pagination/
    const data = await response.json() as RequestResponseWithPagination & T;
    data['_pagination'] = {
      total: parseHeaderNumber(response.headers.get('X-WP-Total')),
      totalPages: parseHeaderNumber(response.headers.get('X-WP-TotalPages')),
    }

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
