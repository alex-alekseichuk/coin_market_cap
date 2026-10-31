export type HttpRequestHeaders = Record<string, string>;
export type HttpRequestParams = Record<string, string | number | boolean>;

export type HttpRequestOptions = {
    headers?: HttpRequestHeaders;
    params?: HttpRequestParams;
    timeout?: number;
}

export interface HttpClient {
    get<T>(url: string, options: HttpRequestOptions): Promise<T|null>;
}
