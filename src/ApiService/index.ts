/* eslint-disable @typescript-eslint/no-empty-object-type */
import createOpenAPIClient, { FetchOptions } from 'openapi-fetch';
import { ClientType } from './enums.js';
import { paths } from '../schemas.js';
import { RequestObject, RequestOptions, RequestResult } from './types.js';
import * as qs from 'qs';
import {
  FilterKeys,
  HttpMethod,
  PathsWithMethod,
} from 'openapi-typescript-helpers';
import { createError, getRequestHeaders } from './helpers.js';

const emptyResponseStatuses = [200, 204];
export class ApiService {
  private openApiClient:
    | ReturnType<typeof this.createClient<paths>>
    | undefined = undefined;
  private baseUrl: string;
  private csrfToken: string | undefined = undefined;
  private cookies: string[] | undefined = undefined;
  private clientType: ClientType;

  constructor(baseUrl: string, clientType: ClientType = ClientType.Web) {
    this.baseUrl = baseUrl;
    this.clientType = clientType;
    this.openApiClient = this.createClient<paths>({ baseUrl });
  }

  async makeRequest<T>({
    method,
    path,
    options,
  }: RequestObject): Promise<RequestResult<T>> {
    try {
      const requestOptions: RequestOptions = {
        ...options,
        headers: options?.headers ?? this.getRequestHeaders(),
      };

      const res = await this.openApiClient[method](path, {
        ...requestOptions,
      });

      const { data, response, error } = res;

      if (error) {
        throw error;
      }

      return { data, response };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  getOpenApiClient(): ReturnType<typeof this.createClient<paths>> {
    return this.openApiClient;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  getCSRFToken(): string | undefined {
    return this.csrfToken;
  }

  getCookies(): string[] | undefined {
    return this.cookies;
  }

  getClientType(): ClientType {
    return this.clientType;
  }

  getRequestHeaders(includeCsrfToken = true, includeCookies = true) {
    return {
      ...(includeCsrfToken &&
        this.csrfToken && { 'X-XSRF-TOKEN': this.csrfToken }),
      ...(includeCookies &&
        this.cookies && {
          Cookie: `${this.cookies.join(';')}`,
        }),
    };
  }

  createClient<Paths extends {}>(
    clientOptions: Parameters<typeof createOpenAPIClient>[0]
  ) {
    const options = {
      querySerializer: (query: unknown) => {
        return qs.stringify(query, { arrayFormat: 'repeat' });
      },
    };

    const client = createOpenAPIClient<Paths>({
      ...options,
      ...clientOptions,
    });
    const csrfToken = () => this.csrfToken;
    const cookies = () => this.cookies;
    // TODO: When response is 200 and it's empty should add parseAs: 'text'
    function addAuthorizationHeader<
      P extends PathsWithMethod<Paths, M>,
      M extends HttpMethod,
    >(options?: FetchOptions<FilterKeys<Paths[P], M>>) {
      const updatedHeaders =
        options?.headers ?? getRequestHeaders(csrfToken(), cookies());
      return {
        ...options,
        headers: updatedHeaders,
      };
    }

    return {
      async GET<P extends PathsWithMethod<Paths, 'get'>>(
        url: P,
        init?: FetchOptions<FilterKeys<Paths[P], 'get'>>
      ) {
        const { data, error, response } = await client.GET(
          url,
          addAuthorizationHeader(init)
        );

        if (data || emptyResponseStatuses.includes(response?.status)) {
          return { data, response };
        }

        throw createError(error, response);
      },

      async PUT<P extends PathsWithMethod<Paths, 'put'>>(
        url: P,
        init?: FetchOptions<FilterKeys<Paths[P], 'put'>>
      ) {
        const { data, error, response } = await client.PUT(
          url,
          addAuthorizationHeader(init)
        );

        if (data || emptyResponseStatuses.includes(response?.status)) {
          return { data, response };
        }

        throw createError(error, response);
      },

      async POST<P extends PathsWithMethod<Paths, 'post'>>(
        url: P,
        init?: FetchOptions<FilterKeys<Paths[P], 'post'>>
      ) {
        const { data, error, response } = await client.POST(
          url,
          addAuthorizationHeader(init)
        );
        if (data || emptyResponseStatuses.includes(response?.status)) {
          return { data, response };
        }

        throw createError(error, response);
      },

      async DELETE<P extends PathsWithMethod<Paths, 'delete'>>(
        url: P,
        init?: FetchOptions<FilterKeys<Paths[P], 'delete'>>
      ) {
        const { data, error, response } = await client.DELETE(
          url,
          addAuthorizationHeader(init)
        );

        if (data || emptyResponseStatuses.includes(response?.status)) {
          return { data, response };
        }

        throw createError(error, response);
      },
    };
  }

  setBaseUrl(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.openApiClient = this.createClient<paths>({ baseUrl });
  }

  setCSRFToken(csrfToken: string | undefined) {
    this.csrfToken = csrfToken;
  }

  setCookies(cookies: string[] | undefined) {
    this.cookies = cookies;
  }

  setClientType(clientType: ClientType) {
    this.clientType = clientType;
  }
}
