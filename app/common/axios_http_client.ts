import axios from 'axios';
import {HttpClient, HttpRequestOptions} from "#app/common/interfaces/http_client.js";
import {Logger} from "#app/common/interfaces/logger.js";

export class AxiosHttpClient implements HttpClient {
    constructor(private logger: Logger) {
    }
    async get<T>(url: string, options: HttpRequestOptions): Promise<T|null> {
        try {
            const { data } = await axios.get<T>(url, options);
            return data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('HTTP status:', error.response?.status);
                console.error('Error response:', error.response?.data);
                console.error('Message:', error.message);
            } else {
                console.error('Unexpected error:', error);
            }
            return null;
        }
    }
}
