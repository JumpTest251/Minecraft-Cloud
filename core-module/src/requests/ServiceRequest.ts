import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

type RequestMethod = 'get' | 'post' | 'patch' | 'delete' | 'put'


export interface RequestParams {
    method?: RequestMethod,
    body?: any,
    headers?: any
}


export class ServiceRequest {
    private retries = 0;
    private timeout = 5000;
    private fallback?: AxiosResponse<any> | any;
    private retryWait = 1000;

    private url: string;
    private method: RequestMethod = 'get';
    private body?: any;
    private token?: string;
    private headers?: any;
    private request?: Promise<AxiosResponse<any>>;

    private excludedStatuses = [401, 403];


    private tries = 0;

    constructor(url: string) {
        this.url = url;
    }

    withRetries(retries: number) {
        this.retries = retries;
        return this;
    }

    withTimeout(timeout: number) {
        this.timeout = timeout;
        return this;
    }

    withFallback(fallback: any) {
        this.fallback = fallback;
        return this;
    }

    withToken(token: string) {
        this.token = token;
        return this;
    }

    withRetryWait(retryWait: number) {
        this.retryWait = retryWait;
        return this;
    }

    async exec(params?: RequestParams): Promise<AxiosResponse<any> | any> {
        if (params?.headers) {
            this.headers = params.headers;
        }
        if (params?.body) {
            this.body = params.body;
        }

        if (params?.method) {
            this.method = params.method;
        }

        if (this.token) {
            if (!this.headers) {
                this.headers = {};
            }

            this.headers['Authorization'] = this.token;
        }

        const config: AxiosRequestConfig = this.headers ? {
            headers: this.headers,
            timeout: this.timeout
        } : {
            timeout: this.timeout
        }

        this.request = this.body ? axios[this.method](this.url, this.body, config) : axios[this.method](this.url, config);

        return this.makeRequest();

    }

    async makeRequest(): Promise<AxiosResponse<any> | any> {
        try {
            const response = await this.request;

            return response;
        } catch (error) {
            if (!this.excludedStatuses.includes(error.response.status)) {
                if (this.tries < this.retries) {
                    this.tries += 1;

                    if (this.retryWait > 0) {
                        await new Promise(resolve => setTimeout(resolve, this.retryWait));
                    }

                    return this.makeRequest();
                }
            }
            
            if (this.fallback) return this.fallback;

            throw error;
        }
    }

}