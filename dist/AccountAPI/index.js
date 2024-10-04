"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountAPI = void 0;
class AccountAPI {
    constructor(apiService) {
        this.setApiService = (apiService) => {
            this.apiService = apiService;
        };
        this.getApiService = () => {
            return this.apiService;
        };
        this.getAntiForgeryToken = async () => {
            try {
                const { data, response } = await this.apiService
                    .getOpenApiClient()
                    .GET('/api/Account/AntiForgeryToken');
                const token = data.requestVerificationToken;
                const cookie = response.headers.get('set-cookie');
                if (!this.apiService.getCookies()?.length) {
                    if (cookie)
                        this.apiService.setCookies([cookie]);
                }
                if (token)
                    this.apiService.setCSRFToken(token);
                return { token, cookie };
            }
            catch (error) {
                console.error('Error fetching AntiForgeryToken:', error);
                return error;
            }
        };
        this.loginByEmailAndPassword = async (body) => {
            try {
                const { data, response } = await this.apiService
                    .getOpenApiClient()
                    .POST('/api/Account/Login', { body });
                const cookies = response.headers.get('set-cookie');
                this.apiService.setCookies([...this.apiService.getCookies(), cookies]);
                await this.getAntiForgeryToken();
                console.log('Logged in');
                return data;
            }
            catch (error) {
                console.error('Error logging in:', error);
                return error;
            }
        };
        this.loginAdminByEmailAndPassword = async (body) => {
            try {
                const bodyData = { ...body };
                if (!bodyData.language)
                    bodyData.language = 'en';
                const { data, response } = await this.apiService
                    .getOpenApiClient()
                    .POST('/api/Account/LoginAdmin', { body: bodyData });
                const dataObject = data;
                const code = dataObject?.code;
                if (code) {
                    return this.loginAdminByEmailAndPassword({ ...body, code });
                }
                const cookies = response.headers.get('set-cookie');
                this.apiService.setCookies([...this.apiService.getCookies(), cookies]);
                await this.getAntiForgeryToken();
                console.log('Logged in');
                return data;
            }
            catch (error) {
                console.error('Error admin logging in:', error);
                return error;
            }
        };
        this.getUserInfo = async () => {
            try {
                const { data } = await this.apiService
                    .getOpenApiClient()
                    .GET('/api/Account/Info');
                return data;
            }
            catch (error) {
                console.error('Error getting user info:', error);
                return error;
            }
        };
        this.logout = async (query) => {
            try {
                await this.apiService.getOpenApiClient().POST('/api/Account/Logout', {
                    params: { query },
                });
                this.apiService.setCookies([]);
                await this.getAntiForgeryToken();
                console.log('Logout successful');
            }
            catch (error) {
                console.error('Error logging out:', error);
                return error;
            }
        };
        this.apiService = apiService;
    }
}
exports.AccountAPI = AccountAPI;
//# sourceMappingURL=index.js.map