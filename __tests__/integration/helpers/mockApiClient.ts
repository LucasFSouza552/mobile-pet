/**
 * Wrapper para mockar respostas da API em testes de integração
 * Simula diferentes cenários: sucesso, erro, timeout, paginação
 */

interface MockResponse {
  data?: any;
  status?: number;
  statusText?: string;
  headers?: any;
}

interface MockRequest {
  method: string;
  url: string;
  data?: any;
  params?: any;
}

class MockApiClient {
  private responses: Map<string, MockResponse | Error> = new Map();
  private requests: MockRequest[] = [];
  private defaultResponse: MockResponse = { data: null, status: 200 };

  mockGet(url: string, response: MockResponse | Error): void {
    this.responses.set(`GET:${url}`, response);
  }

  mockPost(url: string, response: MockResponse | Error): void {
    this.responses.set(`POST:${url}`, response);
  }

  mockPut(url: string, response: MockResponse | Error): void {
    this.responses.set(`PUT:${url}`, response);
  }

  mockDelete(url: string, response: MockResponse | Error): void {
    this.responses.set(`DELETE:${url}`, response);
  }

  mockPatch(url: string, response: MockResponse | Error): void {
    this.responses.set(`PATCH:${url}`, response);
  }

  mockPaginatedGet(
    baseUrl: string,
    data: any[],
    pageSize: number = 10
  ): void {
    const totalPages = Math.ceil(data.length / pageSize);
    
    for (let page = 1; page <= totalPages; page++) {
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const pageData = data.slice(start, end);
      
      const url = baseUrl.includes('?') 
        ? `${baseUrl}&page=${page}`
        : `${baseUrl}?page=${page}`;
      
      this.mockGet(url, {
        data: pageData,
        status: 200,
      });
    }
  }

  getResponse(method: string, url: string): MockResponse | Error {
    // Remove query params para comparação
    const urlWithoutQuery = url.split('?')[0];
    const key = `${method.toUpperCase()}:${url}`;
    const keyWithoutQuery = `${method.toUpperCase()}:${urlWithoutQuery}`;
    
    // Tenta encontrar exato primeiro (com query params completos)
    if (this.responses.has(key)) {
      return this.responses.get(key)!;
    }

    // Tenta encontrar sem query params
    if (this.responses.has(keyWithoutQuery)) {
      return this.responses.get(keyWithoutQuery)!;
    }

    // Tenta encontrar por substring (para URLs com query params diferentes)
    // Exemplo: /post/with-author?page=1&limit=10 deve encontrar /post/with-author
    for (const [responseKey, response] of this.responses.entries()) {
      const [responseMethod, responseUrl] = responseKey.split(':');
      if (responseMethod === method.toUpperCase()) {
        const responseUrlWithoutQuery = responseUrl.split('?')[0];
        // Compara sem query params - se a base da URL for igual, retorna
        if (urlWithoutQuery === responseUrlWithoutQuery) {
          return response;
        }
        // Também verifica se a URL contém a resposta (para casos mais complexos)
        if (url.includes(responseUrlWithoutQuery) && responseUrlWithoutQuery.length > 0) {
          return response;
        }
      }
    }

    return this.defaultResponse;
  }

  recordRequest(method: string, url: string, data?: any, params?: any): void {
    this.requests.push({ method, url, data, params });
  }

  getRequests(): MockRequest[] {
    return [...this.requests];
  }

  clear(): void {
    this.responses.clear();
    this.requests = [];
    this.defaultResponse = { data: null, status: 200 };
  }

  reset(): void {
    this.clear();
  }

  setDefaultResponse(response: MockResponse): void {
    this.defaultResponse = response;
  }

  createError(status: number, message: string, data?: any): Error {
    const error: any = new Error(message);
    error.status = status;
    error.response = {
      status,
      statusText: message,
      data: data || { message },
    };
    return error;
  }
}

let mockApiInstance: MockApiClient | null = null;

export function getMockApiClient(): MockApiClient {
  if (!mockApiInstance) {
    mockApiInstance = new MockApiClient();
  }
  return mockApiInstance;
}

export function resetMockApiClient(): void {
  mockApiInstance = new MockApiClient();
}

export function createSuccessResponse(data: any, status: number = 200): MockResponse {
  return { data, status, statusText: 'OK' };
}

export function createErrorResponse(
  status: number,
  message: string,
  data?: any
): Error {
  const error: any = new Error(message);
  error.status = status;
  error.response = {
    status,
    statusText: message,
    data: data || { message },
  };
  return error;
}

