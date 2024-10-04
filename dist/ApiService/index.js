"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiService = void 0;
/* eslint-disable @typescript-eslint/no-empty-object-type */
const openapi_fetch_1 = __importDefault(require("openapi-fetch"));
const enums_js_1 = require("./enums.js");
const qs = __importStar(require("qs"));
const helpers_js_1 = require("./helpers.js");
const emptyResponseStatuses = [200, 204];
class ApiService {
    constructor(baseUrl, clientType = enums_js_1.ClientType.Web) {
        this.openApiClient = undefined;
        this.csrfToken = undefined;
        this.cookies = undefined;
        this.baseUrl = baseUrl;
        this.clientType = clientType;
        this.openApiClient = this.createClient({ baseUrl });
    }
    async makeRequest({ method, path, options, }) {
        try {
            const requestOptions = {
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
        }
        catch (error) {
            console.error(error);
            throw error;
        }
    }
    getOpenApiClient() {
        return this.openApiClient;
    }
    getBaseUrl() {
        return this.baseUrl;
    }
    getCSRFToken() {
        return this.csrfToken;
    }
    getCookies() {
        return this.cookies;
    }
    getClientType() {
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
    createClient(clientOptions) {
        const options = {
            querySerializer: (query) => {
                return qs.stringify(query, { arrayFormat: 'repeat' });
            },
        };
        const client = (0, openapi_fetch_1.default)({
            ...options,
            ...clientOptions,
        });
        const csrfToken = () => this.csrfToken;
        const cookies = () => this.cookies;
        // TODO: When response is 200 and it's empty should add parseAs: 'text'
        function addAuthorizationHeader(options) {
            const updatedHeaders = options?.headers ?? (0, helpers_js_1.getRequestHeaders)(csrfToken(), cookies());
            return {
                ...options,
                headers: updatedHeaders,
            };
        }
        return {
            async GET(url, init) {
                const { data, error, response } = await client.GET(url, addAuthorizationHeader(init));
                if (data || emptyResponseStatuses.includes(response?.status)) {
                    return { data, response };
                }
                throw (0, helpers_js_1.createError)(error, response);
            },
            async PUT(url, init) {
                const { data, error, response } = await client.PUT(url, addAuthorizationHeader(init));
                if (data || emptyResponseStatuses.includes(response?.status)) {
                    return { data, response };
                }
                throw (0, helpers_js_1.createError)(error, response);
            },
            async POST(url, init) {
                const { data, error, response } = await client.POST(url, addAuthorizationHeader(init));
                if (data || emptyResponseStatuses.includes(response?.status)) {
                    return { data, response };
                }
                throw (0, helpers_js_1.createError)(error, response);
            },
            async DELETE(url, init) {
                const { data, error, response } = await client.DELETE(url, addAuthorizationHeader(init));
                if (data || emptyResponseStatuses.includes(response?.status)) {
                    return { data, response };
                }
                throw (0, helpers_js_1.createError)(error, response);
            },
        };
    }
    setBaseUrl(baseUrl) {
        this.baseUrl = baseUrl;
        this.openApiClient = this.createClient({ baseUrl });
    }
    setCSRFToken(csrfToken) {
        this.csrfToken = csrfToken;
    }
    setCookies(cookies) {
        this.cookies = cookies;
    }
    setClientType(clientType) {
        this.clientType = clientType;
    }
}
exports.ApiService = ApiService;
//# sourceMappingURL=index.js.map