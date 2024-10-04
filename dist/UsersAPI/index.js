"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersAPI = void 0;
class UsersAPI {
    constructor(apiService) {
        this.registerUser = async (body) => {
            try {
                const { data } = await this.apiService
                    .getOpenApiClient()
                    .POST('/api/Admin/Users/Register', { body });
                return data;
            }
            catch (error) {
                console.error('Error registering user:', error);
                return error;
            }
        };
        this.changeUsersPassword = async (id, body) => {
            try {
                await this.apiService
                    .getOpenApiClient()
                    .POST('/api/Admin/Users/{id}/changePassword', {
                    body,
                    params: { path: { id } },
                    parseAs: 'text',
                });
            }
            catch (error) {
                console.error('Error registering users:', error);
                return error;
            }
        };
        this.registerUserAndSetPassword = async (body) => {
            try {
                const userData = await this.registerUser(body);
                if (userData?.id) {
                    await this.changeUsersPassword(userData.id, {
                        password: body.password,
                    });
                }
                return userData;
            }
            catch (error) {
                console.error('Error registering user and setting password:', error);
                return error;
            }
        };
        this.registerMultipleUsers = async (users) => {
            try {
                const result = await Promise.all(users.map((user) => this.registerUserAndSetPassword(user)));
                return result;
            }
            catch (error) {
                console.error('Error registering users:', error);
                return error;
            }
        };
        this.getUsers = async (query) => {
            try {
                const { data } = await this.apiService
                    .getOpenApiClient()
                    .GET('/api/Users', { params: { query } });
                return data;
            }
            catch (error) {
                console.error('Error fetching users:', error);
                return error;
            }
        };
        this.getUserById = async (id) => {
            try {
                const { data } = await this.apiService
                    .getOpenApiClient()
                    .GET('/api/Users/{id}', { params: { path: { id } } });
                return data;
            }
            catch (error) {
                console.error('Error fetching user by id:', error);
                return error;
            }
        };
        this.getAdminPanelUsers = async (query) => {
            try {
                const { data } = await this.apiService
                    .getOpenApiClient()
                    .GET('/api/Admin/Users/accounts', { params: { query } });
                return data?.users ?? [];
            }
            catch (error) {
                console.error('Error fetching groups:', error);
                return error;
            }
        };
        this.deleteUser = async (id, body) => {
            try {
                await this.apiService
                    .getOpenApiClient()
                    .DELETE('/api/Admin/Users/{id}/delete', {
                    body,
                    params: { path: { id } },
                    parseAs: 'text',
                });
            }
            catch (error) {
                console.error('Error deleting user:', error);
                return error;
            }
        };
        this.deleteMultipleUsers = async (users) => {
            try {
                if (!users.length)
                    return;
                await this.apiService
                    .getOpenApiClient()
                    .DELETE('/api/Admin/Users/delete', {
                    body: users,
                    parseAs: 'text',
                });
            }
            catch (error) {
                console.error('Error deleting users:', error);
                return error;
            }
        };
        this.apiService = apiService;
    }
    setApiService(apiService) {
        this.apiService = apiService;
    }
}
exports.UsersAPI = UsersAPI;
//# sourceMappingURL=index.js.map